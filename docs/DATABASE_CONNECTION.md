# Database Connection Guide

## Overview

This document explains database connectivity for the ADHD-Closet wardrobe app, common issues, and solutions. The app uses **Supabase** (hosted PostgreSQL) with **Prisma 7** ORM.

## Quick Diagnostic

Run the database connection diagnostic tool:

```bash
cd app
npm run db:check
```

This comprehensive tool checks:
- Environment variable configuration
- DNS resolution (IPv4/IPv6)
- PostgreSQL connectivity
- Prisma Client functionality
- Database schema status

## Environment Configuration

### Required Variables

The app needs `DATABASE_URL` set in one of these locations:

1. **Copilot Environment Secrets** (for GitHub Copilot agent)
   - Set via [GitHub Copilot environment settings](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/customize-the-agent-environment#setting-environment-variables-in-copilots-environment)
   - Automatically injected during agent sessions

2. **Local `.env` file** (for local development)
   ```bash
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   REDIS_URL="redis://localhost:6379"
   ```

3. **GitHub Actions secrets** (for CI/CD)
   - Repository Settings → Secrets and variables → Actions
   - Add `DATABASE_URL` as a repository secret

### Getting Your Supabase DATABASE_URL

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Settings → Database**
4. Find **Connection string → URI**
5. Copy the connection string (replace `[YOUR-PASSWORD]` with your actual password)

## Known Issue: IPv6 Connectivity

### The Problem

**Supabase database hostnames currently resolve to IPv6 addresses only.** GitHub Actions runners and many CI/CD environments **do not support IPv6 connectivity**, causing connection failures with error:

```
ENETUNREACH 2600:1f18:...:5432 - Local (:::0)
```

### Impact

- ✅ **Local development**: Usually works (most modern systems support IPv6)
- ❌ **GitHub Actions/Copilot**: Fails (no IPv6 support)
- ❌ **Many CI/CD platforms**: Fails (limited IPv6 support)

### Solutions

#### Option 1: Use Supabase Connection Pooler (Recommended)

Supabase provides a connection pooler (PgBouncer) on **port 6543** which may have better IPv4 support:

```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true"
```

**Important Notes:**
- Use port `6543` instead of `5432`
- Add `?pgbouncer=true` query parameter
- Some Prisma features may be limited with connection pooling
- For migrations, you may need the direct connection (port 5432)

**Using both connection types:**

```env
# In .env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

Update `app/prisma.config.ts`:

```typescript
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use direct URL for migrations, pooled URL for runtime
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
```

#### Option 2: Request IPv4 Endpoint from Supabase

Contact Supabase support and request an IPv4 endpoint for your project. This is the most reliable long-term solution.

#### Option 3: Use a Proxy/Tunnel Service

Set up a proxy service with IPv4 connectivity:

- **Cloudflare Argo Tunnel**
- **ngrok** (paid plans)
- **SSH tunnel** through an IPv4-enabled server

#### Option 4: Test Locally Only

If CI/CD isn't critical yet, continue development locally where IPv6 typically works.

## Prisma 7 Architecture

The app uses **Prisma 7** which has a different architecture than previous versions:

### Key Changes

1. **No `url` in schema.prisma**
   ```prisma
   datasource db {
     provider = "postgresql"
     // No url = env("DATABASE_URL") here!
   }
   ```

2. **Connection managed via prisma.config.ts**
   - `prisma.config.ts` handles connection URL configuration
   - Supports separate URLs for migrations vs runtime

3. **Database adapter pattern**
   - Runtime uses `@prisma/adapter-pg` with `pg` driver
   - See `app/app/lib/prisma.ts` for implementation

### Example: Prisma Client with Adapter

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create adapter
const adapter = new PrismaPg(pool);

// Create Prisma Client
const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});
```

## Troubleshooting

### Connection Fails with ENETUNREACH

**Cause**: IPv6-only hostname, no IPv6 connectivity

**Solutions**:
1. Try connection pooler (port 6543)
2. Check if running in environment without IPv6
3. Test locally to confirm credentials work

### "Prisma Client not generated"

**Cause**: Missing Prisma Client generation step

**Solution**:
```bash
npm run prisma:generate
```

### "Invalid datasource URL"

**Cause**: Malformed DATABASE_URL

**Check**:
- Starts with `postgresql://` or `postgres://`
- Contains username, password, host, port, and database name
- Special characters in password are URL-encoded

**Format**:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

### Tables Don't Exist

**Cause**: Database schema not created

**Solution**:
```bash
cd app
npx prisma db push    # Push schema to database
# OR
npx prisma migrate dev  # Create and run migration
```

### Slow Queries or Timeouts

**Cause**: Connection pooler limits, network latency

**Solutions**:
- Use direct connection (port 5432) if possible
- Increase connection timeout in `Pool` configuration
- Check Supabase database metrics in dashboard

## Database Management Commands

```bash
# Check connection status
npm run db:check

# Generate Prisma Client (required after schema changes)
npm run prisma:generate

# Push schema to database (development)
npx prisma db push

# Create migration (production-ready)
npm run prisma:migrate

# Open Prisma Studio (GUI for database)
npm run prisma:studio

# Check schema sync status
npx prisma db pull
```

## Environment-Specific Setup

### Local Development

1. Copy `.env.example` to `.env`
2. Add your Supabase DATABASE_URL
3. Run `docker compose up -d redis` (for background jobs)
4. Run `npm run prisma:generate`
5. Run `npx prisma db push` (first time only)
6. Start dev server: `npm run dev`

### GitHub Copilot Agent

Database connection is automatically configured via:
- `.github/workflows/copilot-setup-steps.yml`
- DATABASE_URL from Copilot environment secrets
- Auto-runs Prisma generation and schema push

**Note**: Currently fails due to IPv6 issue. Use connection pooler URL as a workaround.

### GitHub Actions CI/CD

Add `DATABASE_URL` as a repository secret, then use in workflow:

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}

steps:
  - name: Check database connection
    run: npm run db:check
```

## Security Best Practices

1. **Never commit `.env` to git** - it contains sensitive credentials
2. **Use different databases** for development, staging, and production
3. **Rotate credentials regularly** in Supabase dashboard
4. **Use read-only credentials** for analytics/reporting queries
5. **Enable SSL** (Supabase enforces this by default)

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma 7 Documentation](https://www.prisma.io/docs)
- [Prisma Adapter Documentation](https://www.prisma.io/docs/orm/more/database-drivers)
- [GitHub Copilot Environment Configuration](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/customize-the-agent-environment)

## Support

If you encounter database issues not covered here:

1. Run `npm run db:check` and share the output
2. Check Supabase dashboard for database health
3. Review Prisma error messages carefully
4. Open an issue in the repository with diagnostic output
