package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

var db *sql.DB

type dbState struct {
	value string
	date  time.Time
}

func dbConnection() error {
	var err error
	db, err = sql.Open("mysql", "root:root@tcp(db:3306)/proyecto1")
	if err != nil {
		return fmt.Errorf("error al conectar con la base de datos: %v", err)
	}

	if err := db.Ping(); err != nil {
		return fmt.Errorf("error al hacer ping a la base de datos: %v", err)
	}

	fmt.Println("Conexión exitosa con la base de datos")
	return nil
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

func insertData() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	insertCPUStmt, err := db.Prepare("INSERT INTO cpu_state (value, date) VALUES (?, ?)")
	if err != nil {
		fmt.Println("Error al preparar la consulta para la CPU:", err)
		return
	}
	defer insertCPUStmt.Close()

	insertRAMStmt, err := db.Prepare("INSERT INTO ram_state (value, date) VALUES (?, ?)")
	if err != nil {
		fmt.Println("Error al preparar la consulta para la RAM:", err)
		return
	}
	defer insertRAMStmt.Close()

	for {
		select {
		case <-ticker.C:
			ramInfo, err := execCommand("cat /proc/ram_so1_1s2024")
			if err != nil {
				fmt.Println("Error al obtener información de RAM:", err)
				continue
			}

			cpuInfo, err := execCommand("mpstat | awk 'NR==4 {print $NF}'")
			if err != nil {
				fmt.Println("Error al obtener información de CPU:", err)
				continue
			}

			if _, err := insertCPUStmt.Exec(cpuInfo, time.Now()); err != nil {
				fmt.Println("Error al insertar datos de CPU:", err)
				continue
			}

			if _, err := insertRAMStmt.Exec(ramInfo, time.Now()); err != nil {
				fmt.Println("Error al insertar datos de RAM:", err)
				continue
			}
		}
	}
}

func main() {

	if err := dbConnection(); err != nil {
		fmt.Println("Error al conectar con la base de datos")
		return
	}

	go insertData()

	fmt.Println("Server is running on http://localhost:8080")

	http.HandleFunc("/api/ram", infoRamHandler)
	http.HandleFunc("/api/cpu", infoCpuHandler)
	http.HandleFunc("/api/historical", getHistoricalData)
	http.ListenAndServe(":8080", nil)
}
