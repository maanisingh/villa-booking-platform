# 🚀 Deployment Guide - Villa Booking Platform

This guide will help you deploy the Villa Booking Platform to a production server.

## 📋 Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Node.js 16+ and npm
- MongoDB 4.4+
- Nginx (for serving frontend)
- PM2 (for process management)
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

## 🔧 Installation Steps

### 1. System Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### 2. Clone and Setup Repository

```bash
# Clone the repository
cd /opt
sudo git clone <your-repo-url> villa-booking-platform
cd villa-booking-platform
sudo chown -R $USER:$USER .
```

### 3. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
nano .env
```

**Configure .env:**
```env
MONGO_URI=mongodb://localhost:27017/villa_booking
PORT=9000
JWT_SECRET=generate-a-strong-random-key-here
JWT_EXPIRES_IN=7d
```

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Start backend with PM2:**
```bash
pm2 start Server.js --name villa-backend
pm2 save
pm2 startup
# Follow the instructions from the startup command
```

### 4. Frontend Setup

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Create .env.production
nano .env.production
```

**Configure .env.production:**
```env
VITE_API_URL=https://yourdomain.com
```

**Build frontend:**
```bash
npm run build
```

### 5. Nginx Configuration

```bash
# Create nginx config
sudo nano /etc/nginx/sites-available/villa-booking
```

**Add this configuration:**
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (configure with certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend - Serve static files
    location / {
        root /opt/villa-booking-platform/frontend/dist;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads (if you have file uploads)
    location /uploads {
        alias /opt/villa-booking-platform/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/villa-booking /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate with Let's Encrypt

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
# Test renewal:
sudo certbot renew --dry-run
```

### 7. Firewall Configuration

```bash
# Allow necessary ports
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 8. MongoDB Security (Optional but Recommended)

```bash
# Create admin user
mongosh
```

In MongoDB shell:
```javascript
use admin
db.createUser({
  user: "admin",
  pwd: "strong-password-here",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

use villa_booking
db.createUser({
  user: "villa_user",
  pwd: "another-strong-password",
  roles: [ { role: "readWrite", db: "villa_booking" } ]
})
exit
```

Enable authentication:
```bash
sudo nano /etc/mongod.conf
```

Add:
```yaml
security:
  authorization: enabled
```

Restart MongoDB:
```bash
sudo systemctl restart mongod
```

Update backend .env:
```env
MONGO_URI=mongodb://villa_user:another-strong-password@localhost:27017/villa_booking
```

Restart backend:
```bash
pm2 restart villa-backend
```

## 🎯 Post-Deployment

### 1. Verify Installation

**Test backend:**
```bash
curl http://localhost:9000/api/v1/villas/stats
```

**Test frontend:**
```bash
curl https://yourdomain.com
```

### 2. Create Admin Account

The default admin credentials are:
- Email: admin@gmail.com
- Password: 123

**Important:** Change these in production by modifying `backend/Controller/Login.Controller.js:23-24`

### 3. Monitor Logs

```bash
# Backend logs
pm2 logs villa-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 4. Setup Monitoring

```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Monitor resources
pm2 monit
```

## 🔄 Updating the Application

### Update Backend

```bash
cd /opt/villa-booking-platform
git pull origin main
cd backend
npm install
pm2 restart villa-backend
```

### Update Frontend

```bash
cd /opt/villa-booking-platform
git pull origin main
cd frontend
npm install
npm run build
sudo systemctl reload nginx
```

## 🐛 Troubleshooting

### Backend not starting

```bash
pm2 logs villa-backend --lines 100
```

Common issues:
- MongoDB not running: `sudo systemctl status mongod`
- Port 9000 already in use: `sudo lsof -i :9000`
- Environment variables missing: Check backend/.env

### Frontend not loading

```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

Common issues:
- Build files missing: Run `npm run build` again
- Wrong API URL: Check frontend/.env.production
- Nginx config errors: Check syntax with `nginx -t`

### API calls failing

Check CORS configuration in `backend/Server.js`:
```javascript
cors({
  origin: ["https://yourdomain.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
})
```

## 📊 Performance Optimization

### Enable Gzip Compression

Add to nginx config:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### PM2 Cluster Mode

For better performance:
```bash
pm2 delete villa-backend
pm2 start Server.js --name villa-backend -i max
pm2 save
```

### Database Indexing

Connect to MongoDB and create indexes:
```javascript
use villa_booking

// Villa indexes
db.villas.createIndex({ owner: 1 })
db.villas.createIndex({ status: 1 })
db.villas.createIndex({ createdAt: -1 })

// Login indexes
db.logins.createIndex({ email: 1 }, { unique: true })
db.logins.createIndex({ role: 1 })
```

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] Enable MongoDB authentication
- [ ] Use strong JWT_SECRET
- [ ] Enable SSL/HTTPS
- [ ] Configure firewall (ufw)
- [ ] Regular backups
- [ ] Keep system updated
- [ ] Monitor logs regularly
- [ ] Limit SSH access
- [ ] Use fail2ban for SSH protection

## 💾 Backup Strategy

### Automated Daily Backups

Create backup script:
```bash
sudo nano /opt/backup-villa-db.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/backups/villa-booking"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
mongodump --db villa_booking --out $BACKUP_DIR/mongodb_$DATE
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

Make executable and schedule:
```bash
sudo chmod +x /opt/backup-villa-db.sh
sudo crontab -e
```

Add:
```
0 2 * * * /opt/backup-villa-db.sh
```

## 📞 Support

For issues:
1. Check logs: `pm2 logs villa-backend`
2. Review this guide
3. Check MongoDB status: `sudo systemctl status mongod`
4. Verify Nginx config: `sudo nginx -t`

---

**Deployment complete! Your Villa Booking Platform is now live! 🎉**
