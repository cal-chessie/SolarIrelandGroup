const { spawn } = require('child_process');
const { createServer } = require('http');
const fs = require('fs');

const NEXT_PORT = 3001;
const PROXY_PORT = 3000;
const logFd = fs.openSync('/tmp/next-server.log', 'a');

// Start Next.js on internal port
const nextProcess = spawn('npx', ['next', 'start', '-p', String(NEXT_PORT), '-H', '0.0.0.0'], {
  cwd: '/home/z/my-project',
  stdio: ['ignore', logFd, logFd],
  env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=1024' }
});

nextProcess.on('exit', (code) => {
  fs.appendFileSync('/tmp/next-server.log', `[${new Date().toISOString()}] Next.js exited with code ${code}, shutting down proxy\n`);
  process.exit(code || 1);
});

fs.appendFileSync('/tmp/next-server.log', `[${new Date().toISOString()}] Next.js PID: ${nextProcess.pid} on :${NEXT_PORT}\n`);

// Create proxy server that strips aggressive cache headers
const proxy = createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${NEXT_PORT}`);
  const opts = {
    hostname: '127.0.0.1',
    port: NEXT_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = require('http').request(opts, (proxyRes) => {
    const headers = { ...proxyRes.headers };
    const path = url.pathname.toLowerCase();
    const isStaticAsset = path.startsWith('/_next/static') ||
                          path.startsWith('/_next/image') ||
                          /\.(woff2?|png|jpg|jpeg|gif|webp|svg|ico)$/i.test(path);

    if (!isStaticAsset) {
      // HTML pages: no caching at all
      delete headers['x-nextjs-cache'];
      delete headers['x-nextjs-prerender'];
      delete headers['x-nextjs-stale-time'];
      headers['cache-control'] = 'no-cache, no-store, must-revalidate, proxy-revalidate';
      headers['pragma'] = 'no-cache';
      headers['expires'] = '0';
      headers['surrogate-control'] = 'no-store';
    } else {
      // Static assets: short cache
      delete headers['x-nextjs-cache'];
      delete headers['x-nextjs-prerender'];
      const cc = headers['cache-control'] || '';
      if (cc.includes('immutable') || cc.includes('s-maxage=31536000') || cc.includes('max-age=31536000')) {
        headers['cache-control'] = 'public, max-age=300, must-revalidate';
      }
    }

    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    fs.appendFileSync('/tmp/next-server.log', `[${new Date().toISOString()}] Proxy error: ${err.message}\n`);
    if (!res.headersSent) res.writeHead(502);
    res.end('Bad Gateway');
  });

  req.pipe(proxyReq);
});

proxy.listen(PROXY_PORT, '0.0.0.0', () => {
  fs.appendFileSync('/tmp/next-server.log', `[${new Date().toISOString()}] Proxy on :${PROXY_PORT} -> :${NEXT_PORT}\n`);
  console.log(`Proxy on :${PROXY_PORT} -> Next.js on :${NEXT_PORT}`);
});
