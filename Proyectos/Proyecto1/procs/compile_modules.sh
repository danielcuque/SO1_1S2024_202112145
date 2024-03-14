#!/bin/bash
# Script para compilar los modulos y limpiarlos despues de insertarlos en /ram y /cpu

cd ram/
make all
sudo insmod ram_so1_1s2024.ko
make clean

cd ..

cd cpu/
make all
sudo insmod cpu_so1_1s2024
make clean
