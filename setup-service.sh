#!/bin/bash
set -e

JAVA_PATH=$(which java || echo "/usr/bin/java")
USER_NAME="admin"
BACKEND_DIR="/home/$USER_NAME/flame-crust/backend"
SERVICE_PATH="/etc/systemd/system/flame-crust.service"

echo "================================================="
echo "🔥 Setting up Flame Crust Backend 24/7 Automation"
echo "================================================="
echo "Java Path: $JAVA_PATH"
echo "Backend Dir: $BACKEND_DIR"

# Stop existing standalone background nohup java processes
echo "Stopping any existing manual java processes..."
pkill -f "java.*flame-crust" || true

# Write systemd service file
echo "Writing $SERVICE_PATH..."
sudo bash -c "cat << EOF > $SERVICE_PATH
[Unit]
Description=Flame Crust Spring Boot Backend API (24/7 Auto-Restart)
After=network.target

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$BACKEND_DIR
EnvironmentFile=-$BACKEND_DIR/.env
EnvironmentFile=-$BACKEND_DIR/src/main/resources/.env
Environment="BAKONG_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiOTYzZjdiMDAxMTZjNDgxNCJ9LCJpYXQiOjE3ODc4MzE2NTcsImV4cCI6MTc5NTYwNzY1N30.WByYtYb4p6zAMEqTKOrRXOx4xPcLK1G2m_30KZOh660"
ExecStart=$JAVA_PATH -XX:+UseSerialGC -Xms64m -Xmx256m -XX:MaxMetaspaceSize=160m -jar $BACKEND_DIR/target/flame-crust-api-1.0.0.jar
Restart=always
RestartSec=10
StandardOutput=append:$BACKEND_DIR/backend.log
StandardError=append:$BACKEND_DIR/backend.log
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
EOF"

# Reload systemd
echo "Reloading systemd daemon..."
sudo systemctl daemon-reload

# Enable service on boot
echo "Enabling flame-crust service on system boot..."
sudo systemctl enable flame-crust

# Start service
echo "Starting flame-crust service..."
sudo systemctl restart flame-crust

echo ""
echo "✅ Flame Crust service is now running 24/7!"
echo "Status check:"
sudo systemctl status flame-crust --no-pager
