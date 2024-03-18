## Universidad de San Carlos de Guatemala

### Facultad de Ingeniería

### Escuela de Ciencias y Sistemas

### Sistemas Operativos 1

### Daniel Estuardo Cuque Ruíz

### 202112145

### API REST

El paquete `main` de este archivo contiene el backend de la aplicación, que proporciona endpoints HTTP para monitorear recursos del sistema y controlar procesos.

- **Endpoints HTTP**:
  - `/api/ram`: Este endpoint devuelve información sobre el estado de la memoria RAM del sistema, incluyendo la cantidad total de RAM, la cantidad utilizada, el porcentaje de uso y la cantidad libre.
  - `/api/cpu`: Este endpoint devuelve información sobre el estado de la CPU del sistema, incluyendo el porcentaje de uso y el tiempo total de uso de la CPU.
  - `/api/historical`: Este endpoint devuelve datos históricos sobre el uso de la CPU y la RAM, limitados a los últimos 100 registros.
  - `/api/tree`: Este endpoint devuelve una representación de la jerarquía de procesos del sistema.
  - `/api/state/{state}`: Este endpoint permite iniciar, detener, reanudar o matar procesos en el sistema, dependiendo del estado proporcionado en la URL.

- **Funciones Principales**:
  - `setupRoutes()`: Esta función configura las rutas HTTP para los diferentes endpoints, utilizando el paquete `net/http`.
  - `processHandler()`: Esta función maneja las solicitudes relacionadas con el inicio, detención, reanudación y matanza de procesos. Dependiendo del estado proporcionado en la URL, realiza acciones como iniciar un nuevo proceso, detener un proceso en ejecución, reanudar un proceso pausado o matar un proceso.
  - `infoRamHandler()`, `infoCpuHandler()`, `historicalDataHandler()` y `treeProcessHandler()`: Estas funciones manejan las solicitudes de información sobre la RAM, la CPU, los datos históricos y la jerarquía de procesos, respectivamente. Utilizan funciones auxiliares para obtener la información necesaria del sistema y devolverla al cliente.

### Frontend

Este archivo contiene interfaces TypeScript y funciones utilizadas en el frontend de la aplicación.

- **Interfaces**:
  - `ProcessChild`, `Process`, `CpuResponse` y `GraphProps`: Estas interfaces definen la estructura de los datos utilizados en el frontend, como la información sobre procesos, respuestas de la CPU y propiedades de los grafos.

- **Funciones Principales**:
  - `getInfo()`: Esta función realiza solicitudes HTTP al backend para obtener datos, utilizando la función `fetch` de JavaScript. Se encarga de manejar la respuesta del servidor y devolver los datos solicitados al cliente.
  - `convertToGb()`: Esta función convierte valores de bytes a gigabytes, lo que facilita la visualización de la información sobre la RAM en el frontend.
  - `buildDot()`, `buildDotChild()`, `buildDotFromProcess()` y `buildDotFromTree()`: Estas funciones construyen archivos DOT a partir de los datos recibidos del backend, permitiendo la representación gráfica de la jerarquía de procesos y otros elementos en el frontend.

### Módulos del Kernel (ram_modulo.c y cpu_modulo.c)

Estos archivos contienen el código fuente de los módulos del kernel de Linux que proporcionan información sobre la RAM y la CPU del sistema.

- **Funciones Principales**:
  - `write_a_proc()`: Esta función es llamada cuando un proceso intenta leer del archivo en `/proc` correspondiente al módulo. Escribe la información sobre la RAM o la CPU en el archivo para que pueda ser leída por el proceso.
  - `abrir_aproc()`: Esta función se encarga de abrir el archivo en `/proc` para lectura cuando un proceso solicita acceder a él.
  - `modulo_init()`: Esta función se llama cuando se carga el módulo del kernel. Inicializa el módulo y crea el archivo en `/proc` para que los procesos puedan acceder a la información sobre la RAM o la CPU.
  - `modulo_cleanup()`: Esta función se llama cuando se descarga el módulo del kernel. Limpia los recursos utilizados por el módulo y elimina el archivo en `/proc`.
