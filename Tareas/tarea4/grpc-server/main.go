package main

import (
	"context"
	"log"
	"net"

	"data"

	"google.golang.org/grpc"
)

type server struct{}

func (s *server) SendData(ctx context.Context, data *data.Data) (*data.Data, error) {
    log.Printf("Received data: %v", data)
    // Aquí deberías almacenar los datos en la base de datos
    return data, nil
}

func main() {
    listener, err := net.Listen("tcp", ":50051")
    if err != nil {
        log.Fatalf("Failed to listen: %v", err)
    }

    srv := grpc.NewServer()
    data.RegisterDataServiceServer(srv, &server{})

    log.Println("Server running on port :50051")
    if err := srv.Serve(listener); err != nil {
        log.Fatalf("Failed to serve: %v", err)
    }
}
