#!/bin/bash

# Directorio base donde se encuentran los directorios de los módulos
base_dir="$(dirname "$0")"

# Definir nombres de los módulos y sus ubicaciones de Makefile (relativas al directorio base)
module_info=(
    ["ram_so1_1s2024"]="Proyectos/Proyecto1/procs/ram"
    ["cpu_so1_1s2024"]="Proyectos/Proyecto1/procs/cpu"
)

# Ejecutar Makefile para compilar los módulos
for module_name in "${!module_info[@]}"; do
    make -C "$base_dir/${module_info[$module_name]}" all
    if [ $? -ne 0 ]; then
        echo "Error de compilación para el módulo $module_name en ${module_info[$module_name]}. Abortando carga de módulos y eliminación de archivos."
        exit 1
    fi
done

echo "Compilación exitosa. Cargando los módulos..."

# Cargar los módulos
for module_name in "${!module_info[@]}"; do
    sudo insmod "$base_dir/${module_info[$module_name]}/${module_name}.ko"
    if [ $? -ne 0 ]; then
        echo "Error al cargar el módulo $module_name. Abortando eliminación de archivos."
        exit 1
    fi
done

echo "Módulos cargados correctamente. Eliminando archivos..."

# Eliminar archivos generados
for module_name in "${!module_info[@]}"; do
    make -C "$base_dir/${module_info[$module_name]}" clean
done

echo "Proceso completado."
