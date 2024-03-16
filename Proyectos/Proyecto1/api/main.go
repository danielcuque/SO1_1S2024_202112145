package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
	"strconv"
	"sync"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

var (
	db      *sql.DB
	initDB  sync.Once
	initAPI sync.Once
)

type dbState struct {
	value string
	date  time.Time
}

func dbConnection() {
	var errDb error
	initDB.Do(func() {
		db, errDb = sql.Open("mysql", "root:root@tcp(db:3306)/proyecto1")
		if errDb != nil {
			fmt.Println("Error al conectar con la base de datos", errDb)
			return
		}

		err := db.Ping()
		if err != nil {
			fmt.Println("Error al conectar con la base de datos", err)
			fmt.Println(err)
			return
		}

		fmt.Println("Conexión exitosa con la base de datos")
	})
}

func execCommand(command string) (string, error) {
	cmd := exec.Command("sh", "-c", command)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return "", err
	}

	return string(out[:]), nil
}

func infoRamHandler(w http.ResponseWriter, r *http.Request) {
	output, err := execCommand("cat /proc/ram_so1_1s2024")
	if err != nil {
		http.Error(w, "Error al obtener la información del módulo RAM", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(output)
}

func infoCpuHandler(w http.ResponseWriter, r *http.Request) {
	output, err := execCommand("mpstat | awk 'NR==4 {print $NF}'")
	if err != nil {
		http.Error(w, "Error al obtener la información de la CPU", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(output)
}

func getHistoricalData(w http.ResponseWriter, r *http.Request) {
	cpuRows, err := db.Query("SELECT * FROM cpu_state")
	if err != nil {
		http.Error(w, "Error al obtener la información de la CPU", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	var cpuState []dbState
	for cpuRows.Next() {
		var state dbState
		err = cpuRows.Scan(&state.value, &state.date)
		if err != nil {
			http.Error(w, "Error al obtener la información de la CPU", http.StatusInternalServerError)
			fmt.Println(err)
			return
		}
		cpuState = append(cpuState, state)
	}

	ramRows, err := db.Query("SELECT * FROM ram_state")
	if err != nil {
		http.Error(w, "Error al obtener la información de la RAM", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	var ramState []dbState
	for ramRows.Next() {
		var state dbState
		err = ramRows.Scan(&state.value, &state.date)
		if err != nil {
			http.Error(w, "Error al obtener la información de la RAM", http.StatusInternalServerError)
			fmt.Println(err)
			return
		}
		ramState = append(ramState, state)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"cpu": cpuState, "ram": ramState})
}

func setupRoutes() {
	initAPI.Do(func() {
		http.HandleFunc("/api/ram", infoRamHandler)
		http.HandleFunc("/api/cpu", infoCpuHandler)
		http.HandleFunc("/api/historical", getHistoricalData)
	})
}

func insertDataPeriodically() {
	for {
		// Ejecutar comandos para obtener información
		ramInfo, _ := execCommand("cat /proc/ram_so1_1s2024")
		cpuInfo, _ := execCommand("mpstat | awk 'NR==4 {print $NF}'")

		// Insertar datos en la base de datos

		cpuInfoValue, _ := strconv.ParseFloat(cpuInfo, 64)

		_, err := db.Exec("INSERT INTO cpu_state (value, date) VALUES (?, ?)", cpuInfoValue, time.Now())
		if err != nil {
			fmt.Println("Error al insertar datos en cpu_state:", err)
		}

		ramInfoValue, _ := strconv.ParseFloat(ramInfo, 64)

		_, err = db.Exec("INSERT INTO ram_state (value, date) VALUES (?, ?)", ramInfoValue, time.Now())
		if err != nil {
			fmt.Println("Error al insertar datos en ram_state:", err)
		}

		// Esperar 500 milisegundos antes de la próxima inserción
		time.Sleep(500 * time.Millisecond)
	}
}

func main() {
	go dbConnection() // Iniciar la conexión a la base de datos en una goroutine
	// go insertDataPeriodically() // Iniciar la inserción de datos en una goroutine

	// Configurar las rutas HTTP solo una vez
	setupRoutes()

	// Iniciar el servidor web
	http.ListenAndServe(":8080", nil)
}
