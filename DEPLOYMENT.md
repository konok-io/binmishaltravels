# 🚀 Hostinger VPS Deployment Guide

## Bin Mishal Travels - Complete Deployment

এই গাইড আপনাকে Hostinger VPS তে পুরো প্রজেক্ট deploy করতে সাহায্য করবে।

---

## 📋 Prerequisites

- Hostinger VPS (Ubuntu 22.04)
- Domain name (optional but recommended)
- SSH access to VPS

---

## 📁 Project Structure on Server

```
/var/www/binmishaltravels/
├── frontend/          # Built React app
├── server/           # Node.js API
└── data/             # MongoDB data (if local)
```

---

## 🚀 Quick Deployment

### Step 1: SSH to Your VPS

```bash
ssh root@your-vps-ip
```

### Step 2: Run Auto Setup Script

```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/konok-io/binmishaltravels/main/scripts/deploy.sh | bash
```

অথবা manually setup করতে নিচের ধাপগুলো অনুসরণ করুন।

---

## 📝 Manual Setup (Step by Step)

### Step 1: System Update

```bash
apt update && apt upgrade -y
```

### Step 2: Install Node.js 20

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify installation
node -v  # Should show v20.x.x
npm -v
```

### Step 3: Install PM2 (Process Manager)

```bash
npm install -g pm2
```

### Step 4: Install MongoDB

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
apt-get update
apt-get install -y mongodb-org

# Start and enable MongoDB
systemctl start mongod
systemctl enable mongod
```

### Step 5: Install Nginx

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### Step 6: Create Project Directory

```bash
mkdir -p /var/www/binmishaltravels
cd /var/www/binmishaltravels
```

### Step 7: Clone Project from GitHub

```bash
git clone https://github.com/konok-io/binmishaltravels.git .
cd server
npm install
```

### Step 8: Create Environment File

```bash
cd /var/www/binmishaltravels/server
nano .env
```

নিচের content paste করুন:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/binmishaltravels
JWT_SECRET=your-very-long-random-secret-key-change-this
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com
```

### Step 9: Build and Seed Database

```bash
# Build server
npm run build

# Seed database with initial data
npm run seed
```

### Step 10: Start Server with PM2

```bash
pm2 start dist/index.js --name "binmishal-api"

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup
```

### Step 11: Configure Nginx

```bash
nano /etc/nginx/sites-available/binmishaltravels
```

নিচের content paste করুন (আপনার domain দিন):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (Static files)
    location / {
        root /var/www/binmishaltravels/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/binmishaltravels /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 12: SSL Certificate (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal setup
certbot renew --dry-run
```

### Step 13: Firewall Setup

```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp    # HTTPS
ufw enable
```

---

## 🗂️ Frontend Build & Deploy

### Build Frontend

```bash
cd /var/www/binmishaltravels

# Install frontend dependencies
npm install

# Build for production
npm run build

# Copy build to nginx root
rm -rf dist
cp -r dist /var/www/binmishaltravels/
```

### Update API URL

আপনার domain অনুযায়ী `.env.production` তৈরি করুন:

```bash
cd /var/www/binmishaltravels
nano .env.production
```

```env
VITE_API_URL=https://yourdomain.com/api/v1
```

তারপর আবার build করুন।

---

## 🔄 Update/Deploy New Changes

```bash
cd /var/www/binmishaltravels

# Pull latest changes
git pull origin main

# Update server
cd server
npm install
npm run build
pm2 restart binmishal-api

# Update frontend
cd ..
npm install
npm run build
cp -r dist /var/www/binmishaltravels/

# Restart nginx
systemctl restart nginx
```

---

## 📊 Useful Commands

| Command | Description |
|---------|-------------|
| `pm2 status` | Check API server status |
| `pm2 logs binmishal-api` | View API logs |
| `pm2 restart binmishal-api` | Restart API |
| `systemctl status mongod` | Check MongoDB status |
| `nginx -t` | Test Nginx config |
| `certbot renew` | Renew SSL certificate |

---

## 🔐 Default Login Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@binmishaltravels.com | admin123 | Super Admin |
| manager.riyadh@binmishaltravels.com | manager123 | Branch Manager |
| staff.riyadh@binmishaltravels.com | staff123 | Branch Staff |

---

## 🆘 Troubleshooting

### API not responding?
```bash
pm2 logs binmishal-api
pm2 restart binmishal-api
```

### MongoDB connection error?
```bash
systemctl status mongod
systemctl restart mongod
```

### Nginx 502 error?
```bash
# Check if API is running
curl http://localhost:5000/api/v1/health

# Check nginx logs
tail -f /var/log/nginx/error.log
```

### SSL certificate issues?
```bash
certbot renew --force-renewal
```

---

## 💰 Cost Estimate (Hostinger)

| Item | Plan | Cost |
|------|------|------|
| VPS | VPS S (2GB RAM, 1 vCPU) | ~$4.99/month |
| Domain | .com | ~$10/year |
| SSL | Free (Let's Encrypt) | Free |

**Total: ~$5-6/month**

---

## 📞 Support

কোনো সমস্যা হলে:
1. `pm2 logs binmishal-api` দিয়ে logs দেখুন
2. MongoDB running কিনা যাচাই করুন
3. Nginx error logs চেক করুন

---

**Happy Deploying! 🎉**
