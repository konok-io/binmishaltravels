#!/bin/bash

# Bin Mishal Travels - Auto Deploy Script
# Run on fresh Ubuntu 22.04 VPS

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Banner
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║     Bin Mishal Travels - Auto Deploy Script        ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root: sudo bash deploy.sh${NC}"
    exit 1
fi

# Configuration
PROJECT_DIR="/var/www/binmishaltravels"
GITHUB_REPO="https://github.com/konok-io/binmishaltravels.git"
DOMAIN=""
EMAIL=""

# Get user input
echo ""
read -p "Enter your domain (e.g., example.com): " DOMAIN
read -p "Enter your email for SSL: " EMAIL

# Step 1: System Update
echo -e "${YELLOW}[1/12] Updating system...${NC}"
apt update && apt upgrade -y

# Step 2: Install Node.js
echo -e "${YELLOW}[2/12] Installing Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node -v

# Step 3: Install PM2
echo -e "${YELLOW}[3/12] Installing PM2...${NC}"
npm install -g pm2
pm2 install promise

# Step 4: Install MongoDB
echo -e "${YELLOW}[4/12] Installing MongoDB 7.0...${NC}"
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update
apt-get install -y mongodb-org
systemctl start mongod
systemctl enable mongod
echo -e "${GREEN}MongoDB started!${NC}"

# Step 5: Install Nginx & Certbot
echo -e "${YELLOW}[5/12] Installing Nginx and Certbot...${NC}"
apt install -y nginx certbot python3-certbot-nginx
systemctl start nginx
systemctl enable nginx

# Step 6: Create Project Directory
echo -e "${YELLOW}[6/12] Creating project directory...${NC}"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Step 7: Clone Project
echo -e "${YELLOW}[7/12] Cloning from GitHub...${NC}"
git clone $GITHUB_REPO .
cd server
npm install
cd ..

# Step 8: Create Environment File
echo -e "${YELLOW}[8/12] Creating environment file...${NC}"
cat > $PROJECT_DIR/server/.env << EOF
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/binmishaltravels
JWT_SECRET=$(openssl rand -base64 64)
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://$DOMAIN
EOF

# Step 9: Build Server
echo -e "${YELLOW}[9/12] Building server...${NC}"
cd $PROJECT_DIR/server
npm run build
npm run seed

# Step 10: Start Server with PM2
echo -e "${YELLOW}[10/12] Starting server with PM2...${NC}"
pm2 start dist/index.js --name "binmishal-api"
pm2 save
pm2 startup

# Step 11: Configure Nginx
echo -e "${YELLOW}[11/12] Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/binmishaltravels << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    root $PROJECT_DIR/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
}
EOF

ln -sf /etc/nginx/sites-available/binmishaltravels /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# Step 12: SSL Certificate
echo -e "${YELLOW}[12/12] Getting SSL certificate...${NC}"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --noninteractive --agree-tos -m $EMAIL

# Final Message
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗"
echo "║                  Deployment Complete!                    ║"
echo "╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "🌐 Website: https://$DOMAIN"
echo -e "📊 API: https://$DOMAIN/api/v1"
echo ""
echo -e "${YELLOW}Default Login Credentials:${NC}"
echo -e "  Admin: admin@binmishaltravels.com / admin123"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  pm2 status           - Check server status"
echo -e "  pm2 logs binmishal-api  - View logs"
echo -e "  pm2 restart binmishal-api - Restart server"
echo ""
echo -e "${GREEN}Happy Coding! 🚀${NC}"
