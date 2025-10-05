# Load UID & GID của user hiện tại (vd: autechbox)
export UID=$(id -u)
export GID=$(id -g)

# Load biến môi trường từ .env (nếu có)
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "Running Docker Compose with UID=$UID and GID=$GID..."
docker compose up -d