# Deployment Guide

This guide covers deploying Wardrobe AI Closet to production.

## Deployment Options

Choose the deployment method that best fits your needs:

- **[Free Tier Services](FREE-TIER.md)** - Deploy for $0-5/month using Vercel, Neon, Supabase, Upstash (recommended for personal use)
- **[Cloudflare](CLOUDFLARE.md)** - Edge-native deployment with global CDN ($10-35/month, recommended for production)
- **[Docker](#docker-deployment)** - Self-hosted containerized deployment
- **[VPS](#vps-deployment)** - Traditional server deployment
- **[Other Cloud Platforms](#cloud-platforms)** - Vercel, Railway, Fly.io

## Table of Contents
1. [Docker Deployment](#docker-deployment)
2. [VPS Deployment (Ubuntu/Debian)](#vps-deployment)
3. [Cloud Platforms](#cloud-platforms)
4. [Environment Variables](#environment-variables)
5. [SSL/HTTPS Setup](#sslhttps-setup)
6. [Backup Strategies](#backup-strategies)

---

## Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 2GB+ RAM, 10GB+ disk space

### Step 1: Create Dockerfile
Create `app/Dockerfile`:

```dockerfile
FROM oven/bun:1.3 AS base

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Generate Prisma Client
RUN bunx prisma generate

# Build Next.js
RUN bun run build

# Production image
FROM oven/bun:1.3-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built app
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["bun", "run", "server.js"]
```

### Step 2: Update docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: wardrobe
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: wardrobe
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U wardrobe"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: ./app
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://wardrobe:${POSTGRES_PASSWORD}@postgres:5432/wardrobe
      REDIS_URL: redis://redis:6379
      OPENROUTER_API_KEY: ${OPENROUTER_API_KEY}
      DATA_DIR: /data
    volumes:
      - app_data:/data
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

volumes:
  postgres_data:
  redis_data:
  app_data:
```

### Step 3: Create .env file
```bash
POSTGRES_PASSWORD=your_secure_password
OPENROUTER_API_KEY=your_openrouter_key
```

### Step 4: Deploy
```bash
# Build and start
docker-compose up -d

# Run migrations
docker-compose exec app bunx prisma migrate deploy

# Check logs
docker-compose logs -f app

# Access at http://localhost:3000
```

### Step 5: Updates
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Run new migrations
docker-compose exec app bunx prisma migrate deploy
```

---

## VPS Deployment (Ubuntu/Debian)

### Prerequisites
- Ubuntu 22.04+ or Debian 12+
- 2GB+ RAM, 20GB+ disk
- Root or sudo access

### Step 1: Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Nginx (for reverse proxy)
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Step 2: Setup Database
```bash
# Create database user and database
sudo -u postgres psql
CREATE USER wardrobe WITH PASSWORD 'your_secure_password';
CREATE DATABASE wardrobe OWNER wardrobe;
\q
```

### Step 3: Clone and Setup App
```bash
# Create app directory
sudo mkdir -p /var/www/wardrobe
sudo chown $USER:$USER /var/www/wardrobe

# Clone repository
cd /var/www/wardrobe
git clone https://github.com/yourusername/ADHD-Closet.git .

# Install dependencies
cd app
bun install

# Setup environment
cp .env.example .env
nano .env  # Edit with your values
```

### Step 4: Configure Environment
```bash
# /var/www/wardrobe/app/.env
DATABASE_URL="postgresql://wardrobe:your_secure_password@localhost:5432/wardrobe"
REDIS_URL="redis://localhost:6379"
OPENROUTER_API_KEY="your_openrouter_key"
DATA_DIR="/var/www/wardrobe/data"
NODE_ENV="production"
PORT="3000"
```

### Step 5: Build and Run
```bash
# Generate Prisma client
bunx prisma generate

# Run migrations
bunx prisma migrate deploy

# Build app
bun run build

# Test run
bun run start
# Ctrl+C to stop
```

### Step 6: Setup systemd Service
Create `/etc/systemd/system/wardrobe.service`:

```ini
[Unit]
Description=Wardrobe AI Closet
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/wardrobe/app
Environment="NODE_ENV=production"
EnvironmentFile=/var/www/wardrobe/app/.env
ExecStart=/home/YOUR_USER/.bun/bin/bun run start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Set permissions
sudo chown -R www-data:www-data /var/www/wardrobe

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable wardrobe
sudo systemctl start wardrobe
sudo systemctl status wardrobe
```

### Step 7: Configure Nginx
Create `/etc/nginx/sites-available/wardrobe`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/wardrobe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Cloud Platforms

### Vercel

**Pros**: Easy deployment, automatic SSL, global CDN
**Cons**: Requires PostgreSQL external host (Neon, Supabase, etc.)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd app
vercel

# Set environment variables in Vercel dashboard
# - DATABASE_URL
# - REDIS_URL (Upstash)
# - OPENROUTER_API_KEY
# - DATA_DIR=/tmp (note: ephemeral!)
```

**Note**: Vercel's filesystem is read-only. Use S3 or Cloudflare R2 for images.

### Railway

**Pros**: Simple, includes PostgreSQL and Redis
**Cons**: Paid only

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create project
railway init

# Add services
railway add --database postgres
railway add --database redis

# Deploy
railway up

# Set environment variables in dashboard
```

### Fly.io

**Pros**: Full control, persistent volumes, global deployment
**Cons**: More complex setup

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Create app
fly launch

# Add PostgreSQL
fly postgres create

# Add Redis
fly redis create

# Deploy
fly deploy

# Set secrets
fly secrets set OPENROUTER_API_KEY=xxx
```

---

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string (for BullMQ)
- `OPENROUTER_API_KEY`: OpenRouter API key for AI features

### Optional
- `DATA_DIR` (default: `./data`): Directory for storing images
- `PORT` (default: `3000`): Server port
- `NODE_ENV` (default: `development`): Environment mode

### OpenRouter Models (Optional)
- `OPENROUTER_IMAGE_MODEL`: Model for image generation
- `OPENROUTER_VISION_MODEL`: Model for image inference
- `OPENROUTER_TEXT_MODEL`: Model for outfit generation

---

## SSL/HTTPS Setup

### Using Certbot (Let's Encrypt)
```bash
# For Nginx
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

### Using Cloudflare
1. Add your domain to Cloudflare
2. Set DNS A record to your server IP
3. Enable "Proxied" status
4. SSL/TLS → Full (strict)
5. Done! Cloudflare handles SSL

---

## Backup Strategies

### 1. Database Backups
```bash
# Create backup script: /var/www/wardrobe/backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/wardrobe"
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
pg_dump -U wardrobe wardrobe | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup images
tar -czf $BACKUP_DIR/images_$DATE.tar.gz /var/www/wardrobe/data/images

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

# Make executable
chmod +x /var/www/wardrobe/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /var/www/wardrobe/backup.sh
```

### 2. App Export Feature
Use the built-in export feature:
- Go to Settings → Export Wardrobe
- Download ZIP backup
- Store in multiple locations:
  - External hard drive
  - Cloud storage (Google Drive, Dropbox)
  - Another computer

### 3. Cloud Backups
```bash
# Install rclone for cloud backups
curl https://rclone.org/install.sh | sudo bash

# Configure cloud storage
rclone config

# Sync backups to cloud
rclone sync /var/backups/wardrobe remote:wardrobe-backups
```

---

## Monitoring

### Check Service Status
```bash
# App status
sudo systemctl status wardrobe

# Database status
sudo systemctl status postgresql

# Redis status
sudo systemctl status redis

# Nginx status
sudo systemctl status nginx
```

### View Logs
```bash
# App logs
sudo journalctl -u wardrobe -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Disk Space
```bash
# Check disk usage
df -h

# Check data directory size
du -sh /var/www/wardrobe/data
```

---

## Troubleshooting

See [TROUBLESHOOTING.md](../user-guides/TROUBLESHOOTING.md) for common issues and solutions.

---

## Mobile Apps

For information about installing the app as a PWA or building native Android/iOS apps, see [Mobile Apps Guide](MOBILE-APPS.md).

