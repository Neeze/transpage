#!/bin/bash
# ==========================================================
# Chạy Docker Compose với UID/GID user hiện tại
# ==========================================================

# Load UID & GID của user hiện tại (vd: autechbox)
export LOCAL_UID=$(id -u)
export LOCAL_GID=$(id -g)

# Load biến môi trường từ .env (nếu có)
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "Running Docker Compose with LOCAL_UID=$LOCAL_UID and LOCAL_GID=$LOCAL_GID..."
docker compose up -d
