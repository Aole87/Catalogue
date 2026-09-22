/**
 * MOBEX Automotive Catalog - Production Node.js Server Entrypoint
 * Used by Plesk Node.js extension, PM2, or direct execution: `node server.js`
 */

const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || '3000';
const HOST = process.env.HOST || '0.0.0.0';

console.log(`[MOBEX] Launching API Server on ${HOST}:${PORT}...`);

const tsxPath = path.join(__dirname, 'node_modules', '.bin', 'tsx');
const serverTsPath = path.join(__dirname, 'apps', 'api', 'src', 'server.ts');

const child = spawn(tsxPath, [serverTsPath], {
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
