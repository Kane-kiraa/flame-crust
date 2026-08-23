#!/bin/bash

# Kill any existing processes to prevent port conflicts
echo "🧹 Cleaning up old processes..."
pkill -f "spring-boot:run"
pkill -f "cloudflared"

# Start the Spring Boot Backend in the background
echo "🚀 Starting Spring Boot Backend (Port 8080)..."
cd backend
./mvnw spring-boot:run > /dev/null 2>&1 &
cd ..

echo "⏳ Waiting 15 seconds for backend to start up..."
sleep 15

# Run Cloudflared and extract the URL
echo "🌐 Starting Cloudflare Tunnel..."
echo "--------------------------------------------------------"
echo "👇 COPY THIS LINK AND PUT IT IN CLOUDFLARE PAGES 👇"
echo "--------------------------------------------------------"

# Run cloudflared, filter stderr for the trycloudflare link, and print it in green
./frontend/cloudflared tunnel --url http://localhost:8080 2>&1 | grep --color=always -o 'https://[a-zA-Z0-9-]*\.trycloudflare\.com'

# Note: cloudflared keeps running in the foreground, so the user sees the link and leaves it open.
