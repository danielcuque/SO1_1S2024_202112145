package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
	"strconv"
	"strings"
	"sync"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

var (
	db      *sql.DB
	initDB  sync.Once
	initAPI sync.Once
)

type DbState struct {
	Value float64   `json:"value"`
	Date  time.Time `json:"date"`
}

type RamResponse struct {
	TotalRam     int64 `json:"totalRam"`
	MemoriaEnUso int64 `json:"memoriaEnUso"`
	Porcentaje   int   `json:"porcentaje"`
	Libre        int64 `json:"libre"`
}

type ProcessChild struct {
	PID      int            `json:"pid"`
	Name     string         `json:"name"`
	State    int            `json:"state"`
	PidPadre int            `json:"pidPadre"`
	Child    []ProcessChild `json:"child"`
}

type Process struct {
	PID      int            `json:"pid"`
	Name     string         `json:"name"`
	State    int            `json:"state"`
	Children []ProcessChild `json:"child"`
}

type CpuResponse struct {
	Percentage   float64   `json:"percentage"`
	TotalUsage   float64   `json:"total_usage"`
	TotalTimeCpu float64   `json:"total_time_cpu"`
	Processes    []Process `json:"processes"`
}

type ProcessState string

const (
	Start ProcessState = "start"
	Stop  ProcessState = "stop"
	Ready ProcessState = "ready"
	Kill  ProcessState = "kill"
)

func dbConnection() {
	var errDb error
	initDB.Do(func() {
		// for develop use just docker container db
		db, errDb = sql.Open("mysql", "root:root@tcp(db:3306)/proyecto1")
		// db, errDb = sql.Open("mysql", "root:root@tcp(localhost:3306)/proyecto1")
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
	ramInfo, err := getRamInfoAsJson()
	if err != nil {
		http.Error(w, "Error al obtener la información de la RAM", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(ramInfo)
}

func infoCpuHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(
		map[string]interface{}{
			"cpu": getCpuInfoAsFloat(),
		},
	)
}

func getTableData(tableName string) ([]DbState, error) {
	rows, err := db.Query("SELECT value, date FROM " + tableName + " ORDER BY date DESC LIMIT 100")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var state []DbState
	for rows.Next() {
		var s DbState
		var dateDb []uint8

		if err := rows.Scan(&s.Value, &dateDb); err != nil {
			return nil, err
		}

		date, _ := time.Parse("2006-01-02 15:04:05", string(dateDb))

		s.Date = date
		state = append(state, s)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return state, nil
}

func historicalDataHandler(w http.ResponseWriter, r *http.Request) {
	cpuState, err := getTableData("cpu_state")
	if err != nil {
		http.Error(w, "Error al obtener la información de la CPU", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	ramState, err := getTableData("ram_state")
	if err != nil {
		http.Error(w, "Error al obtener la información de la RAM", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"cpu": cpuState, "ram": ramState})
}

func treeProcessHandler(w http.ResponseWriter, r *http.Request) {
	cpuInfo, err := getCpuInfoAsJson()
	if err != nil {
		http.Error(w, "Error al obtener la información de la CPU", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(cpuInfo)
}

func StartProcess() (int, error) {
	cmd := exec.Command("sleep", "infinity")
	err := cmd.Start()
	if err != nil {
		return 0, fmt.Errorf("error al iniciar el proceso: %v", err)
	}

	return cmd.Process.Pid, nil
}

func StopProcess(pid int) error {

	// Enviar señal SIGSTOP al proceso con el PID proporcionado
	cmd := exec.Command("kill", "-SIGSTOP", strconv.Itoa(pid))
	err := cmd.Run()
	if err != nil {
		return fmt.Errorf("error al detener el proceso con PID %d", pid)
	}

	return nil
}

func ResumeProcess(pid int) error {

	// Enviar señal SIGCONT al proceso con el PID proporcionado
	cmd := exec.Command("kill", "-SIGCONT", strconv.Itoa(pid))
	err := cmd.Run()
	if err != nil {
		return fmt.Errorf("error al reanudar el proceso con PID %d", pid)
	}

	return nil
}

func KillProcess(pid int) error {
	// Enviar señal SIGCONT al proceso con el PID proporcionado
	cmd := exec.Command("kill", "-9", strconv.Itoa(pid))
	err := cmd.Run()
	if err != nil {
		return fmt.Errorf("error al finalizar el proceso con PID %d", pid)
	}

	return nil
}

func processHandler(w http.ResponseWriter, r *http.Request) {
	state := ProcessState(strings.TrimPrefix(r.URL.Path, "/api/state/"))
	var pid int
	var err error

	if state != Start {
		pidStr := r.URL.Query().Get("pid")
		if pidStr == "" {
			http.Error(w, "El parámetro 'pid' es requerido", http.StatusBadRequest)
			return
		}
		pid, err = strconv.Atoi(pidStr)
		if err != nil {
			http.Error(w, "PID inválido", http.StatusBadRequest)
			return
		}
	}

	var statusCode int
	var responseData interface{}

	switch state {
	case Start:
		pid, err := StartProcess()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		statusCode = http.StatusCreated
		responseData = map[string]interface{}{"pid": pid}

	case Stop:
		err := StopProcess(pid)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		statusCode = http.StatusOK
		responseData = map[string]interface{}{"pid": pid}

	case Ready:
		err := ResumeProcess(pid)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		statusCode = http.StatusOK
		responseData = map[string]interface{}{"pid": pid}

	case Kill:
		err := KillProcess(pid)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		statusCode = http.StatusOK
		responseData = map[string]interface{}{"pid": pid}

	default:
		http.Error(w, "Estado no válido", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(responseData)
}

func setupRoutes() {
	initAPI.Do(func() {
		http.HandleFunc("/api/ram", infoRamHandler)
		http.HandleFunc("/api/cpu", infoCpuHandler)
		http.HandleFunc("/api/historical", historicalDataHandler)
		http.HandleFunc("/api/tree", treeProcessHandler)
		http.HandleFunc("/api/state/", processHandler)
	})
}

func getCpuInfoAsFloat() float64 {
	cpuInfo, _ := execCommand("mpstat | awk 'NR==4 {print $NF}'")
	cpuInfo = strings.ReplaceAll(cpuInfo, ",", ".")
	cpuInfoValue, _ := strconv.ParseFloat(strings.TrimSpace(cpuInfo), 64)
	return cpuInfoValue
}

func insertData(value float64, tableName string) {
	_, err := db.Exec("INSERT INTO "+tableName+" (value, date) VALUES (?, ?)", value, time.Now())
	if err != nil {
		fmt.Println("Error al insertar datos en "+tableName+":", err)
	}
}

func getInfoAsJson(filePath string, data interface{}) error {
	output, err := execCommand("cat " + filePath)
	if err != nil {
		return fmt.Errorf("error al obtener la información: %v", err)
	}
	if err := json.Unmarshal([]byte(output), &data); err != nil {
		return fmt.Errorf("error al deserializar la información: %v", err)
	}
	return nil
}

func getRamInfoAsJson() (RamResponse, error) {
	var ramResponse RamResponse
	if err := getInfoAsJson("/proc/ram_so1_1s2024", &ramResponse); err != nil {
		return RamResponse{}, err
	}
	return ramResponse, nil
}

func getCpuInfoAsJson() (CpuResponse, error) {
	var cpuResponse CpuResponse
	if err := getInfoAsJson("/proc/cpu_so1_1s2024", &cpuResponse); err != nil {
		return CpuResponse{}, err
	}
	return cpuResponse, nil
}

func insertDataPeriodically() {
	for {

		ramInfo, err := getRamInfoAsJson()
		if err != nil {
			fmt.Println("Error al obtener la información de la RAM:", err)
			continue
		}

		ramUsedValue := float64(ramInfo.MemoriaEnUso)

		insertData(ramUsedValue, "ram_state")

		cpuInfoValue := getCpuInfoAsFloat()

		insertData(cpuInfoValue, "cpu_state")

		// Esperar 500 milisegundos antes de la próxima inserción
		time.Sleep(500 * time.Millisecond)
	}
}

func main() {
	go dbConnection()           // Iniciar la conexión a la base de datos en una goroutine
	go insertDataPeriodically() // Iniciar la inserción de datos en una goroutine

	// Configurar las rutas HTTP solo una vez
	setupRoutes()

	// Iniciar el servidor web
	fmt.Println("Servidor iniciado en http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
