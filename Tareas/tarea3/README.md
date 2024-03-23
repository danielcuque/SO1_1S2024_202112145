# Tarea 3

[Link al video](https://drive.google.com/file/d/1Izj-OlamhRByW8H4kkB8IPQ2OuP9hTYD/view?usp=sharing)

### Comandos

Instancia MemoryStore

Ip: 10.246.157.227:6379

VM Pub:

NodeJs

```bash
sudo apt-get update
sudo apt-get install nodejs
sudo apt-get install npm
```
Crear directorio servidor

```bash
mkdir pub
cd pub
npm init -y
npm install express ioredis
touch index.js
node index.js
```


VM Sub:

Python

```bash
sudo apt-get update
sudo apt-get install python3
sudo apt-get install python3-pip
pip3 install redis
```

Crear directorio cliente

```bash
mkdir sub
cd sub
touch sub.py
python3 sub.py
```

