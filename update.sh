#!/bin/bash

# SoloMemo Update Script
# Quick update script for pushing changes to production

set -e

PROJECT_DIR="$HOME/SoloMemo"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

cd "$PROJECT_DIR"

print_info "Pulling latest changes..."
git pull origin main

print_info "Rebuilding frontend..."
cd frontend
npm install
npm run build

print_info "Updating backend dependencies..."
cd ../backend
docker run --rm -v "$(pwd):/app" composer:latest install --no-dev --optimize-autoloader --no-interaction

print_info "Restarting containers..."
cd ..
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

print_info "Waiting for services to start..."
sleep 10

print_info "Running migrations..."
docker-compose -f docker-compose.prod.yml exec -T app php artisan migrate --force

print_info "Clearing and caching..."
docker-compose -f docker-compose.prod.yml exec -T app php artisan config:clear
docker-compose -f docker-compose.prod.yml exec -T app php artisan cache:clear
docker-compose -f docker-compose.prod.yml exec -T app php artisan config:cache
docker-compose -f docker-compose.prod.yml exec -T app php artisan route:cache
docker-compose -f docker-compose.prod.yml exec -T app php artisan view:cache

print_info "Update completed!"
print_info "Container status:"
docker-compose -f docker-compose.prod.yml ps
