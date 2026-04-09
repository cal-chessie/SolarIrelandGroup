const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG = '/tmp/solar-prod.log';
const PORT = 3000;

function start() {
  const logStream = fs.openSync(LOG, 'a');
  const server = spawn('npx', ['next', 'start', '-p', String(PORT), '-H', '0.0.0.0'], {
    cwd: '/home/z/my-project',
    detached: true,
    stdio: ['ignore', logStream, logStream],
    env: { ...process.env }
  });
  
  server.unref();
  console.log(`Daemon started with PID ${server.pid}`);
  fs.writeFileSync('/tmp/solar-server.pid', String(server.pid));
}

// Check if already running
try {
  const pid = parseInt(fs.readFileSync('/tmp/solar-server.pid', 'utf8'), 10);
  if (pid && !isNaN(pid)) {
    try { process.kill(pid, 0); console.log(`Already running as PID ${pid}`); process.exit(0); } 
    catch(e) { /* dead, restart */ }
  }
} catch(e) {}

start();
