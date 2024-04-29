# Use the official Golang image
FROM golang:1.17-alpine AS builder

# Set necessary environment variables
ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Copy the source code into the container
COPY . .

# Build the Go app
RUN go build -o grpc-server .

# Start a new stage from scratch
FROM alpine:latest  

# Set necessary environment variables
ENV MYSQL_USER=user \
    MYSQL_PASSWORD=password \
    MYSQL_HOST=localhost \
    MYSQL_PORT=3306 \
    MYSQL_DB=database

# Copy the Pre-built binary file from the previous stage
COPY --from=builder /app/grpc-server /grpc-server

# Expose port 3001 to the outside world
EXPOSE 3001

# Command to run the executable
CMD ["/grpc-server"]
