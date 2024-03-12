package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
)

type InfoRam struct {
	TotalRam     int `json:"totalRam"`
	MemoriaEnUso int `json:"memoriaEnUso"`
	Porcentaje   int `json:"porcentaje"`
	Libre        int `json:"libre"`
}

type InfoCpu struct{}

func infoRamHandler(w http.ResponseWriter, r *http.Request) {
	cmd := exec.Command("sh", "-c", "cat /proc/modulo_ram")
	out, err := cmd.CombinedOutput()
	if err != nil {
		http.Error(w, "Error al obtener la información del módulo RAM", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	var response InfoRam
	err = json.Unmarshal(out, &response)
	if err != nil {
		http.Error(w, "Error al parsear la información del módulo RAM", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	// Escribir la respuesta en formato JSON
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		http.Error(w, "Error al escribir la respuesta JSON", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
}

func main() {
	http.HandleFunc("/api/ram", infoRamHandler)
	fmt.Println("Server is running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
