const { spawn } = require('child_process');
const fs = require('fs');

const log = fs.openSync('/tmp/next-server.log', 'a');
const child = spawn('npx', ['next', 'start', '-p', '3000', '-H', '0.0.0.0'], {
  cwd: '/home/z/my-project',
  detached: true,
  stdio: ['ignore', log, log],
  env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=1024' }
});

child.unref();

fs.appendFileSync('/tmp/next-server.log', `[${new Date().toISOString()}] Started PID: ${child.pid}\n`);
console.log(`Server started with PID: ${child.pid}`);
