# Universidad de San Carlos de Guatemala
# Facultad de Ingeniería
# Escuela de Ciencias y Sistemas
# Sistemas Operativos 1

# Proyecto 2
# Daniel Estuardo Cuque Ruíz
# 202112145


### Introducción

El proyecto "Sistema Distribuido de Votaciones" tiene como objetivo principal implementar un sistema para un concurso de bandas de música guatemalteca. Utilizando tecnologías distribuidas y microservicios en Kubernetes, se busca enviar tráfico de votaciones a través de archivos hacia distintos servicios, encolar los datos utilizando sistemas de mensajería y visualizar los resultados en tiempo real mediante dashboards. Este documento proporciona una visión detallada de la arquitectura, tecnologías utilizadas, implementaciones en Kubernetes y un ejemplo de funcionamiento.

### Objetivos

Los objetivos del proyecto son los siguientes:

- Implementar un sistema distribuido utilizando microservicios en Kubernetes.

- Utilizar sistemas de mensajería para encolar distintos servicios.

- Visualizar los resultados en tiempo real mediante dashboards utilizando Grafana.

### Tecnologías

#### Locust

Locust es una herramienta de prueba de carga escrita en Python. Permite definir escenarios de prueba y simular múltiples usuarios que acceden a una aplicación web al mismo tiempo. En este proyecto, se utiliza Locust para simular el tráfico de votaciones hacia el servicio de votaciones.

#### Kubernetes

Kubernetes es una plataforma de código abierto para automatizar la implementación, escalado y administración de aplicaciones en contenedores. En este proyecto, se utiliza Kubernetes para orquestar los distintos servicios y desplegarlos en un clúster.

#### Grafana

Grafana es una plataforma de análisis y visualización de métricas. Permite crear dashboards y visualizar datos en tiempo real. En este proyecto, se utiliza Grafana para visualizar los resultados de las votaciones en tiempo real.

#### MongoDB

MongoDB es una base de datos NoSQL orientada a documentos. En este proyecto, se utiliza MongoDB para almacenar los datos de las votaciones.

#### Cloud Run

Cloud Run es un servicio completamente administrado que permite ejecutar contenedores en la nube. En este proyecto, se utiliza Cloud Run para desplegar los servicios de votaciones y resultados.

#### Vue.js

Vue.js es un framework progresivo para construir interfaces de usuario. En este proyecto, se utiliza Vue.js para construir la interfaz de usuario del sistema de votaciones.

#### Ingress

Ingress es un recurso de Kubernetes que permite exponer servicios HTTP y HTTPS desde fuera del clúster. En este proyecto, se utiliza Ingress para exponer los servicios de votaciones y resultados.


#### gRPC

gRPC es un framework de comunicación remota de código abierto desarrollado por Google. En este proyecto, se utiliza gRPC para definir los servicios de votaciones y resultados.

#### Rust

Rust es un lenguaje de programación de sistemas que se enfoca en la seguridad y el rendimiento. En este proyecto, se utiliza Rust para implementar los servicios de votaciones y resultados.

#### Redis

Redis es un almacén de estructura de datos en memoria de código abierto. En este proyecto, se utiliza Redis para encolar los datos de las votaciones.

#### Kafka

Kafka es una plataforma de transmisión distribuida de código abierto. En este proyecto, se utiliza Kafka para encolar los datos de las votaciones.

### Deployments

### Funcionamiento


### Conclusiones

- Se logró implementar un sistema distribuido de votaciones utilizando microservicios en Kubernetes.

- La utilización de sistemas de mensajería como Kafka permitió la comunicación eficiente entre los diferentes componentes del sistema.

- La visualización en tiempo real de los contadores de votaciones mediante Grafana proporciona una forma efectiva de monitorear el sistema.

- Cloud Run facilitó el despliegue de las aplicaciones web para la visualización de logs de MongoDB, garantizando escalabilidad y disponibilidad.