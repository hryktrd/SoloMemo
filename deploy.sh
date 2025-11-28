#!/bin/bash

# SoloMemo Deployment Script for solo.pontium.org
# This script should be run on the server (ubuntu@mypetpaw.net)

set -e

echo "======================================"
echo "SoloMemo Deployment Script"
echo "Domain: solo.pontium.org"
echo "======================================"

# Configuration
DOMAIN="solo.pontium.org"
PROJECT_DIR="$HOME/SoloMemo"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
EMAIL="your-email@example.com"  # Change this to your email

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as ubuntu user
if [ "$USER" != "ubuntu" ]; then
    print_warn "This script should be run as 'ubuntu' user"
fi

# Step 1: Update system packages
print_info "Updating system packages..."
sudo apt update

# Step 2: Install required packages
print_info "Installing required packages..."
sudo apt install -y git docker.io docker-compose nginx certbot python3-certbot-nginx

# Step 3: Enable and start Docker
print_info "Enabling Docker service..."
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu

# Step 4: Clone or update repository
if [ -d "$PROJECT_DIR" ]; then
    print_info "Project directory exists. Pulling latest changes..."
    cd "$PROJECT_DIR"
    git pull origin main
else
    print_info "Cloning repository..."
    cd $HOME
    # Update this URL to your actual repository
    read -p "Enter your Git repository URL: " REPO_URL
    git clone "$REPO_URL" SoloMemo
    cd "$PROJECT_DIR"
fi

# Step 5: Set up production environment file
print_info "Setting up production environment..."
if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
    cp "$PROJECT_DIR/.env.production.example" "$PROJECT_DIR/backend/.env"
    
    # Generate random passwords
    DB_PASSWORD=$(openssl rand -base64 32)
    DB_ROOT_PASSWORD=$(openssl rand -base64 32)
    
    # Update passwords in .env
    sed -i "s/CHANGE_THIS_PASSWORD_TO_STRONG_ONE/$DB_PASSWORD/g" "$PROJECT_DIR/backend/.env"
    sed -i "s/CHANGE_THIS_ROOT_PASSWORD_TO_STRONG_ONE/$DB_ROOT_PASSWORD/g" "$PROJECT_DIR/backend/.env"
    
    print_info "Generated secure database passwords"
    print_warn "Please edit $PROJECT_DIR/backend/.env and set APP_KEY (will be generated later)"
else
    print_info "Using existing .env file"
fi

# Step 6: Install backend dependencies
print_info "Installing backend dependencies..."
cd "$PROJECT_DIR/backend"
docker run --rm -v "$(pwd):/app" composer:latest install --no-dev --optimize-autoloader --no-interaction

# Step 7: Generate application key
print_info "Generating application key..."
cd "$PROJECT_DIR"
docker-compose -f docker-compose.prod.yml up -d app
sleep 5
docker-compose -f docker-compose.prod.yml exec -T app php artisan key:generate --force
docker-compose -f docker-compose.prod.yml down

# Step 8: Install frontend dependencies and build
print_info "Building frontend..."
cd "$PROJECT_DIR/frontend"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_info "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

npm install
npm run build

print_info "Frontend built successfully"

# Step 9: Start Docker containers
print_info "Starting Docker containers..."
cd "$PROJECT_DIR"
docker-compose -f docker-compose.prod.yml up -d

# Wait for database to be ready
print_info "Waiting for database to be ready..."
sleep 10

# Step 10: Run database migrations
print_info "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T app php artisan migrate --force

# Step 11: Optimize Laravel
print_info "Optimizing Laravel..."
docker-compose -f docker-compose.prod.yml exec -T app php artisan config:cache
docker-compose -f docker-compose.prod.yml exec -T app php artisan route:cache
docker-compose -f docker-compose.prod.yml exec -T app php artisan view:cache

# Step 12: Set up Nginx virtual host
print_info "Setting up Nginx virtual host..."
sudo cp "$PROJECT_DIR/nginx-vhost.conf" "$NGINX_CONF"

# Enable the site
sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/

# Test Nginx configuration
print_info "Testing Nginx configuration..."
sudo nginx -t

# Step 13: Obtain SSL certificate
print_info "Obtaining SSL certificate with Let's Encrypt..."
read -p "Enter your email for Let's Encrypt notifications [$EMAIL]: " INPUT_EMAIL
if [ ! -z "$INPUT_EMAIL" ]; then
    EMAIL="$INPUT_EMAIL"
fi

# Reload Nginx first
sudo systemctl reload nginx

# Get certificate
sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$EMAIL" || {
    print_warn "SSL certificate installation failed. You may need to run certbot manually."
    print_info "Run: sudo certbot --nginx -d $DOMAIN"
}

# Step 14: Reload Nginx
print_info "Reloading Nginx..."
sudo systemctl reload nginx

# Step 15: Set up log rotation for Docker
print_info "Setting up log rotation..."
sudo tee /etc/logrotate.d/solomemo > /dev/null <<EOF
/home/ubuntu/SoloMemo/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
EOF

# Step 16: Create backup script
print_info "Creating backup script..."
sudo tee /usr/local/bin/solomemo-backup.sh > /dev/null <<'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups/solomemo"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

# Backup database
cd /home/ubuntu/SoloMemo
docker-compose -f docker-compose.prod.yml exec -T db mysqldump -u root -p"${DB_ROOT_PASSWORD}" solomemo_prod > "$BACKUP_DIR/db_${DATE}.sql"

# Compress backup
gzip "$BACKUP_DIR/db_${DATE}.sql"

# Remove backups older than 30 days
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: db_${DATE}.sql.gz"
EOF

sudo chmod +x /usr/local/bin/solomemo-backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/solomemo-backup.sh") | crontab -

print_info "Backup script created and scheduled (daily at 2 AM)"

# Step 17: Display status
echo ""
echo "======================================"
print_info "Deployment completed successfully!"
echo "======================================"
echo ""
print_info "Application URL: https://$DOMAIN"
print_info "Project directory: $PROJECT_DIR"
echo ""
print_info "Useful commands:"
echo "  - View logs: cd $PROJECT_DIR && docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Restart: cd $PROJECT_DIR && docker-compose -f docker-compose.prod.yml restart"
echo "  - Stop: cd $PROJECT_DIR && docker-compose -f docker-compose.prod.yml down"
echo "  - Backup: /usr/local/bin/solomemo-backup.sh"
echo ""
print_info "Container status:"
cd "$PROJECT_DIR"
docker-compose -f docker-compose.prod.yml ps

echo ""
print_warn "IMPORTANT: Please update your email in the backup script if needed"
print_warn "Edit: /usr/local/bin/solomemo-backup.sh"
echo ""
