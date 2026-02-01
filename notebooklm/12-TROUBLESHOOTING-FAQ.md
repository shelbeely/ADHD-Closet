# Wardrobe AI Closet - Troubleshooting & FAQ

## Common Issues & Solutions

### Installation & Setup Issues

#### Issue: "Cannot find module '@prisma/client'"

**Cause**: Prisma Client not generated after schema changes.

**Solution**:
```bash
cd app
npm run prisma:generate
```

**Prevention**: Always run `prisma:generate` after:
- Cloning the repository
- Pulling schema changes
- Modifying `schema.prisma`

---

#### Issue: "Connection refused" to PostgreSQL

**Symptoms**:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions**:

1. **Check Docker services are running**:
```bash
docker compose ps
# Should show postgres and redis running
```

2. **Verify PostgreSQL is ready**:
```bash
docker exec wardrobe-postgres pg_isready -U wardrobe
# Should return: "accepting connections"
```

3. **Restart PostgreSQL**:
```bash
docker compose restart postgres
# Wait 5 seconds
docker exec wardrobe-postgres pg_isready -U wardrobe
```

4. **Check DATABASE_URL**:
```bash
# .env should have:
DATABASE_URL="postgresql://wardrobe:password@localhost:5432/wardrobe_closet"
```

---

#### Issue: Bun crashes in VM/CI environments

**Symptoms**:
```
Segmentation fault (core dumped)
```

**Cause**: Bun compatibility issues in some virtualized environments.

**Solution**: Use npm as fallback:
```bash
npm install
npm run dev
```

**See**: `app/BUN_SETUP.md` for detailed workarounds.

---

#### Issue: "Port 3000 already in use"

**Solution**:

1. **Find process using port**:
```bash
lsof -i :3000
# or
netstat -tulpn | grep 3000
```

2. **Kill process**:
```bash
kill -9 <PID>
```

3. **Or use different port**:
```bash
PORT=3001 npm run dev
```

---

### Development Issues

#### Issue: Changes not reflecting in browser

**Solutions**:

1. **Hard refresh**: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

2. **Clear Next.js cache**:
```bash
rm -rf .next
npm run dev
```

3. **Clear browser cache**: DevTools → Application → Clear storage

4. **Check hot reload is working**:
- Look for "[HMR] connected" in console
- Try adding `console.log('test')` to see if it updates

---

#### Issue: TypeScript errors after database schema change

**Cause**: Prisma Client out of sync with schema.

**Solution**:
```bash
npm run prisma:generate
# Restart TypeScript server in your IDE
```

In VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

---

#### Issue: Build fails with "Module not found"

**Solutions**:

1. **Clean install**:
```bash
rm -rf node_modules
rm -rf .next
npm install
```

2. **Regenerate Prisma Client**:
```bash
npm run prisma:generate
```

3. **Check import paths**:
```typescript
// ✅ Correct
import { prisma } from '@/lib/prisma';

// ❌ Wrong
import { prisma } from '../../../lib/prisma';
```

---

### Database Issues

#### Issue: Migration fails with "relation already exists"

**Cause**: Database state doesn't match migrations.

**Solutions**:

1. **Development**: Reset database (**WARNING: deletes all data**):
```bash
npx prisma migrate reset
```

2. **Production**: Fix manually:
```bash
# Connect to database
psql -U wardrobe wardrobe_closet

# Check existing tables
\dt

# Drop problematic table
DROP TABLE IF EXISTS problem_table CASCADE;

# Re-run migration
npx prisma migrate deploy
```

---

#### Issue: Database locked or connection pool exhausted

**Symptoms**:
```
Error: Can't reach database server
Too many connections
```

**Solutions**:

1. **Restart database**:
```bash
docker compose restart postgres
```

2. **Check connection pool settings**:
```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=5',
    },
  },
});
```

3. **Close connections in code**:
```typescript
// Always disconnect in scripts
await prisma.$disconnect();
```

---

#### Issue: Slow queries

**Diagnosis**:
```sql
-- Enable query logging
ALTER DATABASE wardrobe_closet SET log_statement = 'all';

-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC LIMIT 10;
```

**Solutions**:

1. **Add indexes**:
```sql
CREATE INDEX idx_items_category_state ON items(category, state);
CREATE INDEX idx_items_updated ON items(updated_at DESC);
```

2. **Optimize Prisma queries**:
```typescript
// ❌ Bad - fetches all relations
const items = await prisma.item.findMany({
  include: { images: true, tags: true, aiJobs: true }
});

// ✅ Good - selective includes
const items = await prisma.item.findMany({
  include: {
    images: {
      where: { kind: 'ai_catalog' },
      take: 1,
    },
  },
});
```

3. **Vacuum database**:
```bash
psql -U wardrobe wardrobe_closet -c "VACUUM ANALYZE;"
```

---

### AI Integration Issues

#### Issue: AI jobs stuck in "queued" state

**Diagnosis**:
```bash
# Check Redis
docker exec wardrobe-redis redis-cli ping

# Check queue
docker exec wardrobe-redis redis-cli KEYS "bull:ai-jobs:*"

# Check database
psql -U wardrobe wardrobe_closet -c "SELECT * FROM ai_jobs WHERE status='queued' ORDER BY created_at DESC LIMIT 5;"
```

**Solutions**:

1. **Verify worker is running**:
```bash
# Check logs
docker compose logs worker

# Restart worker
docker compose restart worker
```

2. **Clear stuck jobs**:
```bash
docker exec wardrobe-redis redis-cli FLUSHDB
```

3. **Check OpenRouter API key**:
```bash
# Test API key
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

---

#### Issue: AI job fails with "RATE_LIMIT" error

**Cause**: Too many requests to OpenRouter API.

**Solutions**:

1. **Check rate limits**:
- Free tier: 10 requests/minute
- Paid tier: Higher limits

2. **Reduce concurrency**:
```typescript
// lib/ai/worker.ts
const worker = new Worker('ai-jobs', processJob, {
  concurrency: 1,  // Reduce from 3 to 1
  limiter: {
    max: 5,        // Max 5 jobs per minute
    duration: 60000,
  },
});
```

3. **Add retry delays**:
```typescript
const job = await queue.add('process', data, {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000,  // Start with 5 second delay
  },
});
```

---

#### Issue: Generated catalog images look wrong

**Possible causes & solutions**:

1. **Model not suitable**:
```bash
# Try different model
OPENROUTER_IMAGE_MODEL="dall-e-3"
```

2. **Prompt needs adjustment**:
```typescript
// Modify prompt in lib/ai/prompts.ts
const prompt = `Create a professional catalog-style product photo...
- Ensure item is centered
- Use consistent lighting
- Maintain original colors
- Plain white/light gray background`;
```

3. **Input image quality too low**:
- Minimum 512x512 recommended
- Good lighting
- Clear focus on item

---

### Image Issues

#### Issue: Images not displaying

**Diagnosis**:
```bash
# Check image exists
ls -lh data/images/[itemId]/[imageId].jpg

# Check image served correctly
curl http://localhost:3000/api/images/[imageId]
```

**Solutions**:

1. **Check file permissions**:
```bash
sudo chown -R $USER:$USER data/
chmod -R 755 data/
```

2. **Verify ImageAsset record**:
```sql
SELECT * FROM image_assets WHERE id = '[imageId]';
```

3. **Check MIME type**:
```typescript
// Should return correct Content-Type header
const response = await fetch('/api/images/[imageId]');
console.log(response.headers.get('content-type'));
```

---

#### Issue: Upload fails with "File too large"

**Solutions**:

1. **Increase Next.js limit**:
```typescript
// next.config.ts
export default {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};
```

2. **Increase Nginx limit** (if using):
```nginx
client_max_body_size 50M;
```

3. **Compress images before upload**:
```typescript
// Frontend compression
const compressed = await sharp(buffer)
  .resize(2048, 2048, { fit: 'inside' })
  .jpeg({ quality: 85 })
  .toBuffer();
```

---

### Performance Issues

#### Issue: Slow page loads

**Diagnosis**:
```javascript
// Add to page
console.time('page-load');
// ... page content
console.timeEnd('page-load');
```

**Solutions**:

1. **Enable Next.js caching**:
```typescript
// Increase revalidation time
export const revalidate = 3600; // 1 hour
```

2. **Optimize images**:
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/api/images/[id]"
  width={300}
  height={300}
  loading="lazy"
/>
```

3. **Reduce bundle size**:
```bash
# Analyze bundle
npm run build
# Check .next/analyze
```

4. **Add loading states**:
```typescript
const { item, loading } = useItem(id);

if (loading) {
  return <LoadingState />;
}
```

---

#### Issue: High memory usage

**Diagnosis**:
```bash
# Docker
docker stats

# System
free -h
top
```

**Solutions**:

1. **Increase memory limits**:
```yaml
# docker-compose.yml
services:
  app:
    mem_limit: 2g
```

2. **Optimize image processing**:
```typescript
// Process in batches
for (const batch of chunks(images, 10)) {
  await Promise.all(batch.map(processImage));
}
```

3. **Clear old jobs**:
```typescript
// BullMQ cleanup
const worker = new Worker('ai-jobs', processJob, {
  removeOnComplete: { age: 86400 },  // 24 hours
  removeOnFail: { age: 604800 },     // 7 days
});
```

---

## Frequently Asked Questions

### General

**Q: Is this a multi-user application?**

A: No, Wardrobe AI Closet is designed as a single-user, self-hosted application. There is no authentication system or user management. If you need multi-user support, significant changes would be required.

---

**Q: Can I use this without AI features?**

A: Yes! Set `AI_ENABLED=false` in your `.env` file. The app remains fully functional for manual wardrobe management. You'll need to:
- Manually categorize items
- Skip catalog image generation
- Use manual outfit creation

---

**Q: What AI models should I use?**

A: Recommended configuration (as of Feb 2024):
```bash
OPENROUTER_IMAGE_MODEL="black-forest-labs/flux-1.1-pro"
OPENROUTER_VISION_MODEL="google/gemini-2.0-flash-exp:free"
OPENROUTER_TEXT_MODEL="google/gemini-2.0-flash-exp:free"
```

See [Model Selection Guide](https://shelbeely.github.io/ADHD-Closet/features/MODEL_SELECTION/) for alternatives.

---

**Q: How much does AI processing cost?**

A: Approximate costs per month (for 100 items):
- Catalog generation: $8 (200 images × $0.04)
- Item inference: $1 (100 items × $0.01)
- Label extraction: $0.50 (50 labels × $0.01)
- Outfit generation: $0.30 (300 outfits × $0.001)

**Total: ~$10/month** for active use.

---

**Q: Can I import from other wardrobe apps?**

A: Not directly. You can:
1. Export data from other app (CSV if available)
2. Use import API to bulk-add items
3. Or add items manually with photos

Future feature: Import from common formats.

---

### Technical

**Q: Can I use a different database?**

A: Currently only PostgreSQL is supported due to:
- Prisma schema optimized for Postgres
- JSON field features
- Full-text search capabilities

SQLite or MySQL would require schema changes.

---

**Q: Can I deploy to Vercel/Netlify?**

A: Not recommended due to:
- Serverless limitations for BullMQ workers
- File storage constraints
- Background job processing needs

Use Docker or VPS deployment instead.

---

**Q: How do I backup my data?**

A: Three components to backup:
1. **Database**: `pg_dump -U wardrobe wardrobe_closet > backup.sql`
2. **Images**: `tar -czf images.tar.gz data/images/`
3. **Config**: `cp .env .env.backup`

Or use the built-in export feature (ZIP format).

---

**Q: Can I use Bun in production?**

A: Yes, but:
- Bun is still evolving (v1.x)
- npm is more stable for production
- Full test coverage needed before production Bun use

Current recommendation: npm for production, Bun for development.

---

### Features

**Q: Can I track when I last wore an item?**

A: Yes! The `Item` model includes:
- `lastWornDate`
- `currentWears`
- `wearsBeforeWash`
- `lastWashedDate`

Wearing items via outfits automatically updates these fields.

---

**Q: Does it support NFC tags?**

A: Yes, on:
- Native iOS app (via Capacitor)
- Native Android app (via Capacitor)
- Chrome/Edge on Android (via Web NFC API)

Safari doesn't support Web NFC. See [NFC Tag Support](https://shelbeely.github.io/ADHD-Closet/features/NFC_TAG_SUPPORT/).

---

**Q: Can I customize the categories?**

A: Categories are defined in the database schema as an enum. To add categories:
1. Edit `app/prisma/schema.prisma`
2. Add new category to `Category` enum
3. Run `npx prisma migrate dev`
4. Regenerate client: `npm run prisma:generate`

---

**Q: Does it work offline?**

A: As PWA:
- View existing items: ✅ Yes (cached)
- Add items: ❌ No (requires backend)
- Generate outfits: ❌ No (requires AI)
- Edit items: ⚠️ Partial (syncs when online)

For full offline support, use native apps with local caching.

---

### ADHD-Specific

**Q: What makes this ADHD-friendly?**

A: Key features:
- **Auto-save**: No "Did I save?" anxiety
- **Minimal steps**: Add item in ~30 seconds
- **Clear CTAs**: Obvious next actions
- **Time estimates**: Know how long things take
- **Panic Pick**: Instant outfit when rushed
- **Progressive disclosure**: Complexity hidden until needed
- **Visual clarity**: High contrast, obvious focus

See [ADHD Improvements](https://shelbeely.github.io/ADHD-Closet/features/ADHD_IMPROVEMENTS/) for full list.

---

**Q: Can I change the ADHD optimizations?**

A: Most are built into the UI design, but you can adjust:
- Disable auto-save (add manual save buttons)
- Change timeout durations
- Adjust choice limits (3-5 max recommended)
- Modify time estimates

Changes should maintain ADHD-first philosophy.

---

## Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide**
2. **Review error logs**:
   ```bash
   # Docker
   docker compose logs app
   
   # Systemd
   sudo journalctl -u wardrobe -n 100
   ```
3. **Search existing issues**: https://github.com/shelbeely/ADHD-Closet/issues
4. **Check documentation**: https://shelbeely.github.io/ADHD-Closet/

### How to Ask for Help

When opening an issue, include:

1. **Environment**:
   - OS and version
   - Node/Bun version
   - Database version
   - Deployment method (Docker/VPS/etc.)

2. **Steps to reproduce**:
   - What did you do?
   - What did you expect?
   - What actually happened?

3. **Relevant logs**:
   ```bash
   # Include last 50 lines
   docker compose logs --tail=50 app
   ```

4. **Configuration** (redact sensitive data):
   ```bash
   # .env (REDACTED)
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   OPENROUTER_API_KEY=sk-***
   ```

### Support Channels

- **GitHub Issues**: https://github.com/shelbeely/ADHD-Closet/issues
- **GitHub Discussions**: https://github.com/shelbeely/ADHD-Closet/discussions
- **Documentation**: https://shelbeely.github.io/ADHD-Closet/

---

## External Resources

- **Next.js Debugging**: https://nextjs.org/docs/debugging
- **Prisma Troubleshooting**: https://www.prisma.io/docs/guides/database/troubleshooting
- **Docker Logs**: https://docs.docker.com/config/containers/logging/
- **PostgreSQL Troubleshooting**: https://www.postgresql.org/docs/current/admin.html
- **Redis Debugging**: https://redis.io/docs/management/
- **Repository**: https://github.com/shelbeely/ADHD-Closet
- **Full Documentation**: https://shelbeely.github.io/ADHD-Closet/
