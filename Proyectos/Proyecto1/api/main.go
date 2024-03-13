package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
)

type InfoCpu struct{}

func infoRamHandler(w http.ResponseWriter, r *http.Request) {
	cmd := exec.Command("sh", "-c", "cat /proc/ram_so1_1s2024")
	out, err := cmd.CombinedOutput()
	if err != nil {
		http.Error(w, "Error al obtener la información del módulo RAM", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	output := string(out[:])

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(output)
}

func infoCpuHandler(w http.ResponseWriter, r *http.Request) {
	// Creamos un comando para ejecutar 'mpstat | awk 'NR==4 {print $NF}'
	cmd1 := exec.Command("mpstat")
	cmd2 := exec.Command("awk", "'NR==4 {print $NF}'")

	// Establecemos la salida de cmd1 como entrada para cmd2
	cmd2.Stdin, _ = cmd1.StdoutPipe()

	// Creamos un buffer para capturar la salida de cmd2
	var output bytes.Buffer
	cmd2.Stdout = &output

	// Iniciamos los comandos
	cmd1.Start()
	cmd2.Start()

	// Esperamos a que ambos comandos finalicen
	cmd1.Wait()
	cmd2.Wait()

	outputString := output.String()
	// Imprimimos la salida
	fmt.Println("Uso de CPU:", outputString)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(outputString)
}

func main() {
	http.HandleFunc("/api/ram", infoRamHandler)
	http.HandleFunc("/api/cpu", infoCpuHandler)
	fmt.Println("Server is running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
