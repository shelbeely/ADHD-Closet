# Troubleshooting Guide

Common issues and solutions for Wardrobe AI Closet.

## Table of Contents
1. [Database Connection Issues](#database-connection-issues)
2. [Bun vs npm Issues](#bun-vs-npm-issues)
3. [OpenRouter API Errors](#openrouter-api-errors)
4. [Performance Issues](#performance-issues)
5. [Image Upload Failures](#image-upload-failures)
6. [Build Errors](#build-errors)
7. [Redis/Queue Issues](#redisqueue-issues)

---

## Database Connection Issues

### Error: "Can't reach database server"

**Cause**: PostgreSQL not running or wrong connection string

**Solution**:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if stopped
sudo systemctl start postgresql

# Test connection
psql -U wardrobe -d wardrobe -h localhost

# Check .env DATABASE_URL format:
# postgresql://username:password@host:port/database
DATABASE_URL="postgresql://wardrobe:password@localhost:5432/wardrobe"
```

### Error: "Password authentication failed"

**Solution**:
```bash
# Reset database password
sudo -u postgres psql
ALTER USER wardrobe WITH PASSWORD 'new_password';
\q

# Update .env with new password
```

### Error: "Prisma Client not generated"

**Solution**:
```bash
cd app
bunx prisma generate
# or
npx prisma generate
```

---

## Bun vs npm Issues

### "Bun is not installed"

**Solution**:
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Or use npm instead
npm install
npm run build
npm start
```

### "Package lockfile mismatch"

**Solution**:
```bash
# If using Bun
rm bun.lockb
bun install

# If using npm
rm package-lock.json
npm install
```

### "Module not found" with Bun

**Cause**: Some packages don't work with Bun

**Solution**:
```bash
# Use npm for development
npm install
npm run dev

# Use Bun only for production builds
bun run build
```

---

## OpenRouter API Errors

### Error: "API key invalid"

**Solution**:
1. Check your API key at https://openrouter.ai/keys
2. Verify `.env` has correct key:
   ```bash
   OPENROUTER_API_KEY=sk-or-v1-xxxxx
   ```
3. Restart the app after changing `.env`

### Error: "Insufficient credits"

**Solution**:
1. Check balance at https://openrouter.ai/account
2. Add credits to your OpenRouter account
3. Costs per request:
   - Image generation: ~$0.02-0.10
   - Vision inference: ~$0.01-0.05
   - Outfit generation: ~$0.01-0.03

### Error: "Rate limit exceeded"

**Solution**:
- OpenRouter has default rate limits
- Wait a few minutes before retrying
- Consider upgrading OpenRouter tier
- Check AI job queue: some jobs may be stuck retrying

### AI Jobs Stuck in "Running"

**Solution**:
```bash
# Check Redis is running
redis-cli ping

# Clear stuck jobs (caution: only if truly stuck)
redis-cli FLUSHDB

# Restart app
sudo systemctl restart wardrobe
```

---

## Performance Issues

### "App is slow on first load"

**Cause**: Next.js compiles pages on first request (dev mode)

**Solution**:
- In production, use `bun run build && bun start`
- Enable Turbopack in dev: `bun run dev --turbo`

### "Image loading is slow"

**Solution**:
1. Check if thumbnails are generated:
   - Images should have `kind: "thumbnail"` entries
2. Regenerate thumbnails:
   - Go to item → AI jobs → Regenerate catalog images
3. Optimize original images:
   ```bash
   # Install ImageMagick
   sudo apt install imagemagick
   
   # Batch optimize (from data directory)
   find images -name "*.jpg" -exec mogrify -quality 85 {} \;
   ```

### "Database queries are slow"

**Solution**:
```bash
# Check database size
du -sh /var/lib/postgresql/data

# Analyze slow queries
sudo -u postgres psql wardrobe
EXPLAIN ANALYZE SELECT * FROM items WHERE state = 'available';

# Vacuum database
VACUUM ANALYZE;
```

### "High Memory Usage"

**Cause**: Image processing, AI jobs, or memory leaks

**Solution**:
```bash
# Check memory usage
free -h
htop

# Restart app
sudo systemctl restart wardrobe

# Limit memory (systemd service)
# Add to /etc/systemd/system/wardrobe.service:
[Service]
MemoryMax=2G
MemoryHigh=1.5G
```

---

## Image Upload Failures

### Error: "File too large"

**Solution**:
1. Check Nginx config (if using):
   ```nginx
   client_max_body_size 50M;
   ```
2. Restart Nginx:
   ```bash
   sudo systemctl reload nginx
   ```
3. Check disk space:
   ```bash
   df -h
   ```

### Error: "Invalid file type"

**Cause**: Only certain image types are supported

**Solution**:
- Supported: `.jpg`, `.jpeg`, `.png`, `.webp`
- Convert images using online tools or:
  ```bash
  # Convert HEIC to JPG (iPhone photos)
  heif-convert photo.heic photo.jpg
  ```

### Images Upload but Don't Display

**Solution**:
1. Check file permissions:
   ```bash
   ls -la /var/www/wardrobe/data/images
   # Should be readable by app user
   sudo chown -R www-data:www-data /var/www/wardrobe/data
   ```
2. Check image paths in database:
   ```bash
   sudo -u postgres psql wardrobe
   SELECT id, file_path FROM image_assets LIMIT 5;
   ```
3. Verify `DATA_DIR` in `.env` matches actual directory

### "Corrupt image" after upload

**Cause**: Upload interrupted or disk full

**Solution**:
1. Re-upload the image
2. Check disk space: `df -h`
3. Delete corrupt image:
   - Go to item detail page
   - Delete the broken image
   - Upload again

---

## Build Errors

### Error: "Module not found: Can't resolve..."

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules .next
bun install
# or
npm install

# Rebuild
bun run build
```

### Error: "Prisma Client different version"

**Solution**:
```bash
# Regenerate Prisma Client
bunx prisma generate

# Clear Next.js cache
rm -rf .next

# Rebuild
bun run build
```

### TypeScript Errors During Build

**Solution**:
1. Check for syntax errors in `.ts`/`.tsx` files
2. Run type check:
   ```bash
   npx tsc --noEmit
   ```
3. Fix reported errors
4. If stuck, temporarily disable strict mode in `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "strict": false
     }
   }
   ```

### "Out of memory" during build

**Solution**:
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" bun run build

# Or add to package.json:
"scripts": {
  "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
}
```

---

## Redis/Queue Issues

### Error: "Could not connect to Redis"

**Solution**:
```bash
# Check Redis is running
sudo systemctl status redis

# Start Redis
sudo systemctl start redis

# Test connection
redis-cli ping
# Should return "PONG"

# Check REDIS_URL in .env
REDIS_URL="redis://localhost:6379"
```

### AI Jobs Not Processing

**Solution**:
1. Check Redis is running: `redis-cli ping`
2. Check queue worker is running:
   ```bash
   # If using systemd, check worker service
   sudo systemctl status wardrobe-worker
   ```
3. Manually clear queue (caution):
   ```bash
   redis-cli
   FLUSHALL
   ```
4. Restart app

### "Too many jobs in queue"

**Solution**:
```bash
# Check queue size
redis-cli LLEN bull:ai-jobs:wait

# Clear failed jobs
redis-cli DEL bull:ai-jobs:failed

# Clear completed jobs
redis-cli DEL bull:ai-jobs:completed
```

---

## General Tips

### Enable Debug Logging
Add to `.env`:
```bash
DEBUG=true
LOG_LEVEL=debug
```

### Check Service Logs
```bash
# App logs (systemd)
sudo journalctl -u wardrobe -f

# Docker logs
docker-compose logs -f app

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Reset to Fresh State
**CAUTION**: This deletes all data!

```bash
# Stop app
sudo systemctl stop wardrobe

# Drop database
sudo -u postgres psql
DROP DATABASE wardrobe;
CREATE DATABASE wardrobe OWNER wardrobe;
\q

# Clear Redis
redis-cli FLUSHALL

# Clear images
rm -rf /var/www/wardrobe/data/images/*

# Run migrations
cd /var/www/wardrobe/app
bunx prisma migrate deploy

# Start app
sudo systemctl start wardrobe
```

---

## Getting Help

### Check These First
1. Application logs
2. Browser console (F12)
3. Network tab (F12 → Network)
4. Database connection
5. Redis connection
6. Disk space
7. OpenRouter balance

### Provide This Info When Asking for Help
```bash
# App version
cat /var/www/wardrobe/app/package.json | grep version

# Environment
uname -a
node --version
bun --version
postgres --version
redis-server --version

# Recent logs
sudo journalctl -u wardrobe --since "10 minutes ago"

# Disk space
df -h
```

### Where to Get Help
- GitHub Issues: https://github.com/yourusername/ADHD-Closet/issues
- Check README.md for community links
- Review ARCHITECTURE.md for system understanding
