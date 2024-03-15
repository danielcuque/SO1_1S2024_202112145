package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
	"time"
)

var db *sql.DB

type dbState struct {
	value string
	date  time.Time
}

func dbConnection() {
	db, errDb := sql.Open("mysql", "root:root@tcp(db:3306)/proyecto1")
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

func main() {

	dbConnection()

	go func() {
		ticket := time.NewTicker(5 * time.Second)
		for {
			select {
			case <-ticket.C:
				ramInfo, err := execCommand("cat /proc/ram_so1_1s2024")
				if err != nil {
					fmt.Println(err)
					continue
				}

				cpuInfo, err := execCommand("mpstat | awk 'NR==4 {print $NF}'")

				if err != nil {
					fmt.Println(err)
					continue
				}

				_, err = db.Exec("INSERT INTO cpu_state (value, date) VALUES (?, ?)", cpuInfo, time.Now())
				if err != nil {
					fmt.Println(err)
					continue
				}

				_, err = db.Exec("INSERT INTO ram_state (value, date) VALUES (?, ?)", ramInfo, time.Now())
				if err != nil {
					fmt.Println(err)
					continue
				}
			}
		}
	}()

	fmt.Println("Server is running on http://localhost:8080")

	go func() {
		http.HandleFunc("/api/ram", infoRamHandler)
		http.HandleFunc("/api/cpu", infoCpuHandler)
		http.HandleFunc("/api/historical", getHistoricalData)
		http.ListenAndServe(":8080", nil)
	}()
}
