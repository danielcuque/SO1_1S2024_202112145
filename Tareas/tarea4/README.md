# Tarea 4 - Sistemas operativos 1

## Daniel Estuardo Cuque Ruíz
## 202112145

[Video](https://drive.google.com/file/d/1_uWKO69GDTWlQ_eQsoaWJ3AummQvq8tp/view?usp=sharing)

### Comandos para proto

```bash
protoc --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative proto/protos.proto
```

### Comandos para correr el servidor

```bash
go run server/main.go
```

### Comandos para correr el cliente

```bash
go run client/main.go
```