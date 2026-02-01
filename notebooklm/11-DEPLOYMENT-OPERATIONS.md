# Wardrobe AI Closet - Deployment & Operations Guide

## Overview

Comprehensive guide for deploying, configuring, monitoring, and maintaining Wardrobe AI Closet in production environments.

## Deployment Options

### Option 1: Docker Compose (Recommended for Self-Hosting)

**Prerequisites**:
- Docker ≥20.10
- Docker Compose ≥2.0
- 4GB RAM minimum
- 20GB+ disk space

**Setup**:

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: ./app
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://wardrobe:${DB_PASSWORD}@postgres:5432/wardrobe_closet
      - REDIS_URL=redis://redis:6379
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - PUBLIC_BASE_URL=${PUBLIC_BASE_URL}
    volumes:
      - ./data:/app/data
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
  
  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=wardrobe
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=wardrobe_closet
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
  
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
  
  # Optional: Reverse proxy with SSL
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

**Dockerfile**:

```dockerfile
# app/Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Create data directory
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**Deploy**:

```bash
# 1. Set environment variables
export DB_PASSWORD="your-secure-password"
export OPENROUTER_API_KEY="your-api-key"
export PUBLIC_BASE_URL="https://yourdomain.com"

# 2. Build and start
docker-compose -f docker-compose.prod.yml up -d

# 3. Run migrations
docker-compose exec app npx prisma migrate deploy

# 4. Check logs
docker-compose logs -f app
```

---

### Option 2: VPS Deployment (Ubuntu 22.04)

**Prerequisites**:
- Ubuntu 22.04 LTS
- Root or sudo access
- Domain name (optional, recommended)

**Setup Script**:

```bash
#!/bin/bash
# deploy-vps.sh

set -e

echo "Installing dependencies..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql redis-server nginx certbot python3-certbot-nginx

echo "Installing Bun..."
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

echo "Setting up PostgreSQL..."
sudo -u postgres psql <<EOF
CREATE USER wardrobe WITH PASSWORD 'your-secure-password';
CREATE DATABASE wardrobe_closet OWNER wardrobe;
GRANT ALL PRIVILEGES ON DATABASE wardrobe_closet TO wardrobe;
EOF

echo "Cloning repository..."
cd /opt
sudo git clone https://github.com/shelbeely/ADHD-Closet.git
sudo chown -R $USER:$USER ADHD-Closet
cd ADHD-Closet/app

echo "Installing application..."
bun install
npx prisma migrate deploy
npm run prisma:generate

echo "Building application..."
npm run build

echo "Setting up systemd service..."
sudo tee /etc/systemd/system/wardrobe.service > /dev/null <<EOF
[Unit]
Description=Wardrobe AI Closet
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/ADHD-Closet/app
Environment="NODE_ENV=production"
Environment="DATABASE_URL=postgresql://wardrobe:your-secure-password@localhost:5432/wardrobe_closet"
Environment="REDIS_URL=redis://localhost:6379"
Environment="OPENROUTER_API_KEY=your-api-key"
Environment="PUBLIC_BASE_URL=https://yourdomain.com"
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
EOF

echo "Starting service..."
sudo systemctl daemon-reload
sudo systemctl enable wardrobe
sudo systemctl start wardrobe

echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/wardrobe > /dev/null <<'EOF'
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/wardrobe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "Setting up SSL with Let's Encrypt..."
sudo certbot --nginx -d yourdomain.com --non-interactive --agree-tos -m your@email.com

echo "Deployment complete!"
echo "Visit: https://yourdomain.com"
```

---

### Option 3: Vercel + External Database

**Not Recommended** due to:
- Serverless limitations for BullMQ workers
- File storage constraints
- Higher costs for AI processing

Use Docker or VPS deployment instead.

---

## Environment Configuration

### Production .env Template

```bash
# app/.env.production

# Environment
NODE_ENV=production

# Database
DATABASE_URL="postgresql://wardrobe:password@localhost:5432/wardrobe_closet"

# Redis (for job queue)
REDIS_URL="redis://localhost:6379"

# AI Provider (REQUIRED)
OPENROUTER_API_KEY="sk-or-v1-..."

# AI Models (Optional, defaults provided)
OPENROUTER_IMAGE_MODEL="black-forest-labs/flux-1.1-pro"
OPENROUTER_VISION_MODEL="google/gemini-2.0-flash-exp:free"
OPENROUTER_TEXT_MODEL="google/gemini-2.0-flash-exp:free"

# Application
PUBLIC_BASE_URL="https://yourdomain.com"
DATA_DIR="/app/data"

# Features
AI_ENABLED="true"

# Monitoring (Optional)
SENTRY_DSN=""
LOG_LEVEL="info"

# Security
SESSION_SECRET="generate-random-secret-here"
```

### Generating Secrets

```bash
# Generate random secret
openssl rand -base64 32

# Generate strong password
openssl rand -base64 24 | tr -d "=+/" | cut -c1-20
```

---

## SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal (runs twice daily)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

### Nginx SSL Configuration

```nginx
# /etc/nginx/sites-available/wardrobe
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy settings
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # File upload size
    client_max_body_size 50M;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Monitoring & Logging

### Application Logs

```bash
# Docker Compose
docker-compose logs -f app

# Systemd
sudo journalctl -u wardrobe -f

# Log files (if configured)
tail -f /var/log/wardrobe/app.log
```

### Database Monitoring

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Connect to database
psql -U wardrobe wardrobe_closet

# Check database size
SELECT pg_size_pretty(pg_database_size('wardrobe_closet'));

# Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Redis Monitoring

```bash
# Check Redis status
redis-cli ping

# Monitor commands
redis-cli monitor

# Check memory usage
redis-cli info memory

# Check queue stats
redis-cli KEYS "bull:ai-jobs:*"
```

### System Resources

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check Docker stats
docker stats
```

---

## Backup & Recovery

### Database Backups

```bash
# Manual backup
pg_dump -U wardrobe wardrobe_closet > backup_$(date +%Y%m%d).sql

# Automated daily backups (crontab)
0 2 * * * pg_dump -U wardrobe wardrobe_closet | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Restore from backup
psql -U wardrobe wardrobe_closet < backup_20240127.sql
```

### Image Backups

```bash
# Backup images directory
tar -czf images_backup_$(date +%Y%m%d).tar.gz /app/data/images

# Sync to remote storage (example: AWS S3)
aws s3 sync /app/data/images s3://your-bucket/images/

# Restore images
tar -xzf images_backup_20240127.tar.gz -C /app/data/
```

### Complete System Backup

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Database
pg_dump -U wardrobe wardrobe_closet | gzip > $BACKUP_DIR/database.sql.gz

# Images
tar -czf $BACKUP_DIR/images.tar.gz /app/data/images

# Configuration
cp /app/.env $BACKUP_DIR/env.backup

# Redis data (if needed)
redis-cli --rdb $BACKUP_DIR/dump.rdb

echo "Backup complete: $BACKUP_DIR"

# Cleanup old backups (keep last 30 days)
find /backups -type d -mtime +30 -exec rm -rf {} \;
```

---

## Scaling Considerations

### Vertical Scaling (Increase Resources)

**For 1,000-10,000 items**:
- CPU: 2-4 cores
- RAM: 4-8GB
- Disk: 50-100GB SSD

**For 10,000-50,000 items**:
- CPU: 4-8 cores
- RAM: 8-16GB
- Disk: 100-500GB SSD

### Horizontal Scaling (Multiple Workers)

```yaml
# docker-compose.scale.yml
services:
  app:
    # ... app config
  
  # Add separate worker service
  worker:
    build: ./app
    command: node worker.js
    environment:
      # Same as app
    scale: 3  # Run 3 worker instances
    depends_on:
      - postgres
      - redis
```

### Database Optimization

```sql
-- Create indexes for common queries
CREATE INDEX idx_items_category_state ON items(category, state);
CREATE INDEX idx_items_updated_at ON items(updated_at DESC);
CREATE INDEX idx_images_item_kind ON image_assets(item_id, kind);
CREATE INDEX idx_tags_name ON tags(name);

-- Vacuum and analyze
VACUUM ANALYZE;
```

---

## Security Hardening

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Fail2ban for SSH protection
sudo apt install fail2ban
```

### Basic Auth (Optional)

For additional security before full auth implementation:

```nginx
# Install htpasswd
sudo apt install apache2-utils

# Create password file
sudo htpasswd -c /etc/nginx/.htpasswd username

# Add to Nginx config
location / {
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://localhost:3000;
}
```

### Environment Variables Security

```bash
# Never commit .env files
# Use secrets management (e.g., HashiCorp Vault, AWS Secrets Manager)

# Set proper file permissions
chmod 600 .env

# Use encrypted storage for backups
gpg --encrypt backup.tar.gz
```

---

## Maintenance Tasks

### Weekly Tasks

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean old logs
sudo journalctl --vacuum-time=7d

# Check disk space
df -h

# Verify backups
ls -lh /backups/
```

### Monthly Tasks

```bash
# Database maintenance
psql -U wardrobe wardrobe_closet -c "VACUUM FULL ANALYZE;"

# Review AI job failures
psql -U wardrobe wardrobe_closet -c "SELECT * FROM ai_jobs WHERE status='failed' ORDER BY created_at DESC LIMIT 10;"

# Check SSL certificate expiry
sudo certbot certificates

# Review error logs
sudo journalctl -u wardrobe --since "1 month ago" | grep ERROR
```

### Quarterly Tasks

```bash
# Review and clean old data
# - Delete old AI job logs
# - Archive old outfits
# - Clean up orphaned images

# Performance audit
# - Check slow queries
# - Review image storage
# - Optimize database

# Security audit
# - Update dependencies
# - Review access logs
# - Check for vulnerabilities
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker-compose logs app
# or
sudo journalctl -u wardrobe -n 50

# Common issues:
# - Database connection failed → Check DATABASE_URL
# - Redis connection failed → Check REDIS_URL
# - Port already in use → Check for conflicting services
# - Permission denied → Check file ownership
```

### Database Issues

```bash
# Reset database (WARNING: deletes all data)
docker-compose exec app npx prisma migrate reset

# Force unlock migrations
psql -U wardrobe wardrobe_closet -c "DELETE FROM _prisma_migrations WHERE migration_name LIKE '%pending%';"
```

### Redis Queue Issues

```bash
# Clear stuck jobs
redis-cli FLUSHDB

# Restart Redis
docker-compose restart redis
# or
sudo systemctl restart redis
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Analyze slow queries
psql -U wardrobe wardrobe_closet
\x
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

# Check image disk usage
du -sh /app/data/images
```

---

## External Resources

- **Docker Documentation**: https://docs.docker.com/
- **PostgreSQL Administration**: https://www.postgresql.org/docs/current/admin.html
- **Redis Administration**: https://redis.io/docs/management/
- **Nginx Configuration**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/docs/
- **Repository**: https://github.com/shelbeely/ADHD-Closet
- **Full Documentation**: https://shelbeely.github.io/ADHD-Closet/
