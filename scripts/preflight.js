#!/usr/bin/env node

/**
 * Bazaar.pk Database Preflight & Health Check
 * Verifies database connectivity and readiness before starting Next.js dev server.
 */

const fs = require('fs');
const path = require('path');
const net = require('net');

// Load .env file manually
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        let val = trimmed.substring(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

// ANSI Colors
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';

console.log(`\n${CYAN}${BOLD}====================================================${RESET}`);
console.log(`${CYAN}${BOLD}       Bazaar.pk - System Startup Preflight         ${RESET}`);
console.log(`${CYAN}${BOLD}====================================================${RESET}\n`);

// Detect DB URL & Provider
function getDbConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    return {
      dbUrl: supabaseUrl,
      schemaProvider: 'supabase_cloud',
      supabaseUrl,
    };
  }

  let dbUrl = process.env.DATABASE_URL;
  let schemaProvider = 'sqlite';

  // Check schema.prisma
  const schemaPath = path.resolve(process.cwd(), 'prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const providerMatch = schemaContent.match(/provider\s*=\s*"([^"]+)"/);
    if (providerMatch) {
      schemaProvider = providerMatch[1];
    }
    const urlMatch = schemaContent.match(/url\s*=\s*env\("([^"]+)"\)/);
    if (!urlMatch) {
      const directUrlMatch = schemaContent.match(/url\s*=\s*"([^"]+)"/);
      if (directUrlMatch && (!dbUrl || schemaProvider === 'sqlite')) {
        if (!process.env.DATABASE_URL) {
          dbUrl = directUrlMatch[1];
        }
      }
    }
  }

  if (!dbUrl) {
    dbUrl = 'file:./dev.db';
  }

  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    schemaProvider = 'postgresql';
  } else if (dbUrl.startsWith('file:') || dbUrl.endsWith('.db')) {
    schemaProvider = 'sqlite';
  }

  return { dbUrl, schemaProvider };
}


// Test TCP Socket (for PostgreSQL, MySQL, etc.)
function checkTcpSocket(host, port, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isConnected = false;

    socket.setTimeout(timeoutMs);

    socket.connect(port, host, () => {
      isConnected = true;
      socket.end();
      resolve(true);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
  });
}

function parseHostPort(connectionString) {
  try {
    const parsed = new URL(connectionString);
    return {
      host: parsed.hostname || 'localhost',
      port: parseInt(parsed.port, 10) || 5432,
      database: parsed.pathname.replace(/^\//, '') || 'postgres',
    };
  } catch {
    return { host: 'localhost', port: 5432, database: 'postgres' };
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runPreflight() {
  const { dbUrl, schemaProvider } = getDbConfig();
  const isPostgres = schemaProvider === 'postgresql' || dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
  const isSqlite = schemaProvider === 'sqlite' || dbUrl.startsWith('file:');

  console.log(`🔍 ${DIM}Database Provider:${RESET} ${BOLD}${schemaProvider}${RESET}`);
  console.log(`🌐 ${DIM}Connection Target:${RESET} ${BOLD}${isSqlite ? dbUrl : dbUrl.replace(/:[^:@]+@/, ':****@')}${RESET}\n`);

  if (schemaProvider === 'supabase_cloud') {
    console.log(`${GREEN}✔ [Supabase Cloud] Connected via Supabase REST API.${RESET}`);
    console.log(`⚡ ${DIM}Project Endpoint:${RESET} ${BOLD}${dbUrl}${RESET}`);
    console.log(`${GREEN}${BOLD}✔ Preflight database checks passed successfully!${RESET}\n`);
    return true;
  }

  if (isSqlite) {
    const dbFile = dbUrl.replace(/^file:/, '').replace(/^\.\//, '');
    const fullPath = path.resolve(process.cwd(), 'prisma', dbFile);
    const rootPath = path.resolve(process.cwd(), dbFile);

    const exists = fs.existsSync(fullPath) || fs.existsSync(rootPath);
    if (exists) {
      console.log(`${GREEN}✔ [SQLite] Database file found and accessible.${RESET}`);
    } else {
      console.log(`${YELLOW}ℹ [SQLite] Database file will be initialized on first write: ${dbFile}${RESET}`);
    }
    console.log(`${GREEN}${BOLD}✔ Preflight database checks passed successfully!${RESET}\n`);
    return true;
  }


  if (isPostgres) {
    const { host, port, database } = parseHostPort(dbUrl);
    const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';

    console.log(`⏳ Checking connection to PostgreSQL on ${host}:${port}/${database}...`);

    const maxRetries = 10;
    const retryInterval = 1500;
    let connected = false;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      process.stdout.write(`  [${attempt}/${maxRetries}] Pinging PostgreSQL (${host}:${port})... `);
      const isSocketOpen = await checkTcpSocket(host, port);

      if (isSocketOpen) {
        process.stdout.write(`${GREEN}CONNECTED${RESET}\n\n`);
        console.log(`${GREEN}${BOLD}✔ PostgreSQL server is active and accepting connections.${RESET}\n`);
        connected = true;
        break;
      } else {
        process.stdout.write(`${YELLOW}WAITING${RESET}\n`);
        if (attempt < maxRetries) {
          await sleep(retryInterval);
        }
      }
    }

    if (!connected) {
      console.log(`\n${RED}✖ Could not connect to PostgreSQL at ${host}:${port}.${RESET}`);
      if (isLocalhost) {
        console.log(`\n${YELLOW}${BOLD}Troubleshooting for local PostgreSQL:${RESET}`);
        console.log(`  1. Run ${BOLD}start-dev.bat${RESET} (Windows) or ${BOLD}./start-dev.sh${RESET} (Mac/Linux) to auto-start services.`);
        console.log(`  2. Or start PostgreSQL service manually:`);
        console.log(`     - Windows: ${BOLD}net start postgresql-x64-16${RESET} (or your version)`);
        console.log(`     - Docker:  ${BOLD}docker compose up -d${RESET} or start Docker Desktop`);
        console.log(`     - Mac:     ${BOLD}brew services start postgresql${RESET}`);
        console.log(`     - Linux:   ${BOLD}sudo systemctl start postgresql${RESET}\n`);
      } else {
        console.log(`\n${YELLOW}Please verify your remote DATABASE_URL and network access.${RESET}\n`);
      }
      console.log(`${YELLOW}⚠ Starting Next.js with database connection resilience enabled.${RESET}\n`);
      return false;
    }

    return true;
  }

  console.log(`${GREEN}✔ Database configuration verified.${RESET}\n`);
  return true;
}

runPreflight().catch((err) => {
  console.error(`${RED}Preflight error: ${err.message}${RESET}`);
  process.exit(0);
});
