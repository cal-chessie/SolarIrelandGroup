const { createServer } = require('http');
const httpProxy = require('http-proxy');

const TARGET = 'http://127.0.0.1:3001';
const PORT = 3000;

const proxy = httpProxy.createProxyServer({ target: TARGET, changeOrigin: true });

// Log proxy errors but don't crash
proxy.on('error', (err, _req, res) => {
  console.error('[proxy] error:', err.message);
  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
  }
  res.end('Bad Gateway');
});

const server = createServer((req, res) => {
  proxy.web(req, res, {}, (err) => {
    if (err) {
      console.error('[proxy] web error:', err.message);
      if (!res.headersSent) {
        res.writeHead(502);
      }
      res.end('Bad Gateway');
    }
  });
});

// Strip aggressive s-maxage from Next.js 16
proxy.on('proxyRes', (proxyRes, _req, _res) => {
  const raw = proxyRes.headers['cache-control'] || '';
  if (raw.includes('s-maxage')) {
    const parts = raw.split(',').map((p) => p.trim()).filter((p) => {
      return !p.startsWith('s-maxage');
    });
    proxyRes.headers['cache-control'] = parts.join(', ');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[proxy] listening on :${PORT} -> proxying to ${TARGET}`);
});
