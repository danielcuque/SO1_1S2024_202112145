package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
)

type InfoCpu struct{}

func infoRamHandler(w http.ResponseWriter, r *http.Request) {
	cmd := exec.Command("sh", "-c", "cat /proc/modulo_ram")
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

func main() {
	http.HandleFunc("/api/ram", infoRamHandler)
	fmt.Println("Server is running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
