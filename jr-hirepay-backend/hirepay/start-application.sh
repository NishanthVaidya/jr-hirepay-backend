#!/bin/bash

echo "Starting HirePay Application..."
echo "This will automatically create the scope tables using Hibernate DDL auto-update"

# Navigate to the project directory
cd "$(dirname "$0")"

# Check if Maven is available
if command -v mvn &> /dev/null; then
    echo "Using Maven to start the application..."
    ./mvnw spring-boot:run
elif command -v ./mvnw &> /dev/null; then
    echo "Using Maven wrapper to start the application..."
    ./mvnw spring-boot:run
else
    echo "Error: Maven is not installed or mvnw is not available"
    echo "Please install Maven or ensure mvnw is executable"
    exit 1
fi

