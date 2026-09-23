/**
 * MOBEX Automotive Catalog - Production Node.js Server Entrypoint
 * Used by Plesk Node.js extension, PM2, or direct execution: `node server.js`
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure .env is loaded
try {
  require('dotenv').config();
} catch (_) {}

// Default to autoparts-postgres container configuration if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://autoparts_user:autoparts_secure_pass123@localhost:5432/car_parts_catalog?schema=public';
}

const PORT = process.env.PORT || '3000';
const HOST = process.env.HOST || '0.0.0.0';

console.log(`[MOBEX] Launching API Server on ${HOST}:${PORT}...`);
console.log(`[MOBEX] Database URL: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);

const distServer = path.join(__dirname, 'dist-server', 'index.js');

if (fs.existsSync(distServer)) {
  console.log('[MOBEX] Loading pre-compiled production server bundle...');
  require(distServer);
} else {
  console.log('[MOBEX] Running via tsx runtime...');
  const { spawn } = require('child_process');
  const localTsx = path.join(__dirname, 'node_modules', '.bin', 'tsx');
  const serverTsPath = path.join(__dirname, 'apps', 'api', 'src', 'server.ts');

  let execCmd = fs.existsSync(localTsx) ? localTsx : 'npx';
  let execArgs = fs.existsSync(localTsx) ? [serverTsPath] : ['tsx', serverTsPath];

  const child = spawn(execCmd, execArgs, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT,
      HOST,
      NODE_ENV: process.env.NODE_ENV || 'production',
    },
    shell: true,
  });

  child.on('error', (err) => {
    console.error('[MOBEX] Failed to start API process:', err);
  });

  child.on('close', (code) => {
    console.log(`[MOBEX] API process exited with code ${code}`);
    if (code !== 0) {
      process.exit(code || 1);
    }
  });
}
