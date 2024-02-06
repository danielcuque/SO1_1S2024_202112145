#!/bin/bash

# Detener y eliminar contenedores
if [ "$(docker ps -aq)" ]; then
    docker stop $(docker ps -aq)
    docker rm $(docker ps -aq)
else
    echo "No hay contenedores para detener y eliminar."
fi

# Eliminar imágenes
if [ "$(docker images -q)" ]; then
    docker rmi $(docker images -q)
else
    echo "No hay imágenes para eliminar."
fi

# Eliminar volúmenes
docker volume prune -f