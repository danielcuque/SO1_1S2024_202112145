#!/bin/bash

# Verificar si se proporcionó al menos un nombre de módulo como argumento
if [ $# -lt 1 ]; then
    echo "Uso: $0 <nombre_del_modulo1> [<nombre_del_modulo2> ...]"
    exit 1
fi

# Nombres de los módulos proporcionados como argumentos
module_names=("$@")

# Ejecutar Makefile para compilar los módulos
make all

# Verificar si la compilación fue exitosa
if [ $? -eq 0 ]; then
    echo "Compilación exitosa. Cargando los módulos..."

    # Cargar los módulos
    for module_name in "${module_names[@]}"; do
        sudo insmod "$module_name.ko"
        
        # Verificar si el módulo se cargó correctamente
        if [ $? -ne 0 ]; then
            echo "Error al cargar el módulo $module_name. Abortando eliminación de archivos."
            exit 1
        fi
    done

    echo "Módulos cargados correctamente. Eliminando archivos..."
    
    # Eliminar archivos generados
    make clean
    
    echo "Proceso completado."
else
    echo "Error de compilación. Abortando carga de módulos y eliminación de archivos."
fi
