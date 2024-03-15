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

func dbConnection() {
	var err error
	// use container db_proyecto1
	db, err = sql.Open("mysql", "root:root@tcp(db_proyecto1:3306)/proyecto1")
	if err != nil {
		fmt.Println("Error al conectar con la base de datos")
		return
	}

	err = db.Ping()
	if err != nil {
		fmt.Println("Error al conectar con la base de datos")
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

func main() {

	dbConnection()

	go func() {
		ticket := time.NewTicker(5 * time.Second)
		for {
			select {
			case <-ticket.C:
				// _, err := db.Exec("INSERT INTO cpu (value) VALUES (?)", 10)
				// if err != nil {
				// 	fmt.Println("Error al insertar el valor de la CPU")
				// }
			}
		}
	}()

	fmt.Println("Server is running on http://localhost:8080")

	go func() {
		http.HandleFunc("/api/ram", infoRamHandler)
		http.HandleFunc("/api/cpu", infoCpuHandler)
		http.ListenAndServe(":8080", nil)
	}()
}
