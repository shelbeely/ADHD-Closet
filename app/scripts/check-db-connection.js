#!/usr/bin/env node

/**
 * Database Connection Diagnostic Tool
 * 
 * Checks database connectivity and diagnoses common issues including:
 * - Environment variable configuration
 * - DNS resolution (IPv4/IPv6)
 * - Network connectivity
 * - Database authentication
 * - Schema status
 */

require('dotenv').config();
const dns = require('dns').promises;
const { URL } = require('url');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`${title}`, 'bright');
  log('='.repeat(60), 'cyan');
}

async function checkEnvironment() {
  section('1. Environment Configuration Check');
  
  const requiredVars = ['DATABASE_URL', 'REDIS_URL'];
  const optionalVars = ['OPENROUTER_API_KEY', 'AI_ENABLED', 'NODE_ENV'];
  
  let allPresent = true;
  
  log('\nRequired Environment Variables:', 'bright');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      log(`  ✓ ${varName}: Set (${value.substring(0, 30)}...)`, 'green');
    } else {
      log(`  ✗ ${varName}: NOT SET`, 'red');
      allPresent = false;
    }
  }
  
  log('\nOptional Environment Variables:', 'bright');
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      log(`  ✓ ${varName}: ${value.substring(0, 50)}`, 'green');
    } else {
      log(`  - ${varName}: Not set`, 'yellow');
    }
  }
  
  return allPresent;
}

async function checkDNS() {
  section('2. DNS Resolution Check');
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    log('DATABASE_URL not set, skipping DNS check', 'red');
    return null;
  }
  
  let parsed;
  try {
    parsed = new URL(dbUrl);
  } catch (e) {
    log(`Invalid DATABASE_URL format: ${e.message}`, 'red');
    return null;
  }
  
  const hostname = parsed.hostname;
  log(`\nHostname: ${hostname}`, 'bright');
  log(`Port: ${parsed.port}`, 'bright');
  
  const dnsInfo = {
    hostname,
    ipv4: [],
    ipv6: [],
    hasIpv4: false,
    hasIpv6: false,
  };
  
  // Check IPv4
  try {
    const ipv4 = await dns.resolve4(hostname);
    dnsInfo.ipv4 = ipv4;
    dnsInfo.hasIpv4 = ipv4.length > 0;
    log(`IPv4 addresses: ${ipv4.join(', ')}`, 'green');
  } catch (e) {
    log(`IPv4 addresses: None (${e.code})`, 'yellow');
  }
  
  // Check IPv6
  try {
    const ipv6 = await dns.resolve6(hostname);
    dnsInfo.ipv6 = ipv6;
    dnsInfo.hasIpv6 = ipv6.length > 0;
    log(`IPv6 addresses: ${ipv6.join(', ')}`, dnsInfo.hasIpv6 ? 'green' : 'yellow');
  } catch (e) {
    log(`IPv6 addresses: None (${e.code})`, 'yellow');
  }
  
  // Warn if IPv6-only
  if (!dnsInfo.hasIpv4 && dnsInfo.hasIpv6) {
    log('\n⚠️  WARNING: Database hostname resolves to IPv6 only!', 'red');
    log('   GitHub Actions runners do not have IPv6 connectivity.', 'red');
    log('   This will cause connection failures in CI/CD environments.', 'red');
  }
  
  return dnsInfo;
}

async function checkPostgresConnection() {
  section('3. PostgreSQL Connection Check');
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    log('DATABASE_URL not set, skipping connection check', 'red');
    return false;
  }
  
  try {
    const { Pool } = require('pg');
    
    log('\nAttempting direct PostgreSQL connection...', 'bright');
    const pool = new Pool({
      connectionString: dbUrl,
      connectionTimeoutMillis: 10000,
    });
    
    const client = await pool.connect();
    log('✓ Connection successful!', 'green');
    
    // Get database info
    const result = await client.query(`
      SELECT 
        version() as version,
        current_database() as database,
        current_schema() as schema,
        NOW() as server_time
    `);
    
    const info = result.rows[0];
    log(`\nDatabase Information:`, 'bright');
    log(`  Version: ${info.version.split('\n')[0]}`);
    log(`  Database: ${info.database}`);
    log(`  Schema: ${info.schema}`);
    log(`  Server Time: ${info.server_time}`);
    
    client.release();
    await pool.end();
    
    return true;
  } catch (error) {
    log(`✗ Connection failed: ${error.message}`, 'red');
    if (error.code) {
      log(`  Error code: ${error.code}`, 'red');
    }
    
    // Provide helpful diagnosis
    if (error.code === 'ENETUNREACH') {
      log('\n  DIAGNOSIS: Network unreachable (likely IPv6 issue)', 'yellow');
    } else if (error.code === 'ENOTFOUND') {
      log('\n  DIAGNOSIS: DNS resolution failed', 'yellow');
    } else if (error.code === 'ETIMEDOUT') {
      log('\n  DIAGNOSIS: Connection timeout (firewall or network issue)', 'yellow');
    } else if (error.code === '28P01') {
      log('\n  DIAGNOSIS: Authentication failed (check credentials)', 'yellow');
    }
    
    return false;
  }
}

async function checkPrismaConnection() {
  section('4. Prisma Connection Check');
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const { PrismaPg } = require('@prisma/adapter-pg');
    const { Pool } = require('pg');
    
    log('\nAttempting Prisma connection with adapter...', 'bright');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 10000,
    });
    
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    
    await prisma.$connect();
    log('✓ Prisma connection successful!', 'green');
    
    // Check for tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    log(`\nDatabase Tables: ${tables.length} found`, 'bright');
    if (tables.length > 0) {
      log('  ' + tables.map(t => t.table_name).join(', '));
      
      // Try to count records
      try {
        const itemCount = await prisma.item.count();
        const outfitCount = await prisma.outfit.count();
        const tagCount = await prisma.tag.count();
        const jobCount = await prisma.aIJob.count();
        
        log(`\nRecord Counts:`, 'bright');
        log(`  Items: ${itemCount}`);
        log(`  Outfits: ${outfitCount}`);
        log(`  Tags: ${tagCount}`);
        log(`  AI Jobs: ${jobCount}`);
      } catch (err) {
        log(`\n⚠️  Could not query models: ${err.message}`, 'yellow');
      }
    } else {
      log('\n⚠️  No tables found. Run migrations:', 'yellow');
      log('  npx prisma db push', 'cyan');
    }
    
    await prisma.$disconnect();
    await pool.end();
    
    return true;
  } catch (error) {
    log(`✗ Prisma connection failed: ${error.message}`, 'red');
    return false;
  }
}

async function provideRecommendations(envOk, dnsInfo, pgConnected, prismaConnected) {
  section('5. Recommendations');
  
  if (!envOk) {
    log('\n❌ Missing required environment variables', 'red');
    log('   Action: Set DATABASE_URL in .env or as environment variable', 'cyan');
    return;
  }
  
  if (dnsInfo && !dnsInfo.hasIpv4 && dnsInfo.hasIpv6) {
    log('\n❌ IPv6-only database hostname detected', 'red');
    log('   Problem: GitHub Actions runners do not support IPv6', 'yellow');
    log('\n   Solutions:', 'bright');
    log('   1. Use Supabase Connection Pooler (port 6543):', 'cyan');
    log('      postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true', 'cyan');
    log('   2. Contact Supabase support for IPv4 endpoint', 'cyan');
    log('   3. Use a proxy or tunnel service with IPv4', 'cyan');
    log('   4. Test locally where IPv6 may be available', 'cyan');
    return;
  }
  
  if (!pgConnected) {
    log('\n❌ PostgreSQL connection failed', 'red');
    log('   Action: Check DATABASE_URL credentials and network access', 'cyan');
    return;
  }
  
  if (!prismaConnected) {
    log('\n⚠️  PostgreSQL works but Prisma fails', 'yellow');
    log('   Action: Regenerate Prisma Client:', 'cyan');
    log('   npx prisma generate', 'cyan');
    return;
  }
  
  log('\n✅ All checks passed!', 'green');
  log('   Database connection is working correctly.', 'green');
}

async function main() {
  log('\n' + '█'.repeat(60), 'blue');
  log('  DATABASE CONNECTION DIAGNOSTIC TOOL', 'bright');
  log('  ADHD-Closet Wardrobe App', 'blue');
  log('█'.repeat(60) + '\n', 'blue');
  
  const envOk = await checkEnvironment();
  const dnsInfo = await checkDNS();
  const pgConnected = await checkPostgresConnection();
  const prismaConnected = await checkPrismaConnection();
  
  await provideRecommendations(envOk, dnsInfo, pgConnected, prismaConnected);
  
  section('Summary');
  log(`\nEnvironment: ${envOk ? '✓' : '✗'}`, envOk ? 'green' : 'red');
  log(`DNS Resolution: ${dnsInfo ? '✓' : '✗'}`, dnsInfo ? 'green' : 'red');
  log(`PostgreSQL: ${pgConnected ? '✓' : '✗'}`, pgConnected ? 'green' : 'red');
  log(`Prisma: ${prismaConnected ? '✓' : '✗'}`, prismaConnected ? 'green' : 'red');
  
  const allPassed = envOk && pgConnected && prismaConnected;
  log(`\nOverall Status: ${allPassed ? 'PASS ✓' : 'FAIL ✗'}`, allPassed ? 'green' : 'red');
  
  process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
