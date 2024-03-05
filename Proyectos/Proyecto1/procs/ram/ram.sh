#!/bin/bash

# Ejecutar Makefile para compilar el módulo
make all

# Verificar si la compilación fue exitosa
if [ $? -eq 0 ]; then
    echo "Compilación exitosa. Cargando el módulo..."
    
    # Cargar el módulo
    sudo insmod ram_so1_1s2024.ko
    
    # Verificar si el módulo se cargó correctamente
    if [ $? -eq 0 ]; then
        echo "Módulo cargado correctamente. Eliminando archivos..."
        
        # Eliminar archivos generados
        make clean
        
        echo "Proceso completado."
    else
        echo "Error al cargar el módulo. Abortando eliminación de archivos."
    fi
else
    echo "Error de compilación. Abortando carga de módulo y eliminación de archivos."
fi
