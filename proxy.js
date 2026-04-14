const http = require('http');
const httpProxy = require('http-proxy');

const TARGET = 'http://127.0.0.1:3001';
const PORT = 3000;

const proxy = httpProxy.createProxyServer({ target: TARGET, changeOrigin: true });

proxy.on('error', (err, _req, res) => {
  console.error('[proxy] error:', err.message);
  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
  }
  res.end('Bad Gateway');
});

// Strip Next.js 16's aggressive s-maxage=31536000 from HTML responses
proxy.on('proxyRes', (proxyRes, _req, _res) => {
  const raw = proxyRes.headers['cache-control'] || '';
  if (raw.includes('s-maxage')) {
    const cleaned = raw
      .split(',')
      .map(p => p.trim())
      .filter(p => !p.startsWith('s-maxage'))
      .join(', ');
    proxyRes.headers['cache-control'] = cleaned;
    console.log('[proxy] stripped s-maxage from: ' + raw);
  }
});

const server = http.createServer((req, res) => {
  proxy.web(req, res, {}, (err) => {
    console.error('[proxy] web error:', err.message);
    if (!res.headersSent) res.writeHead(502);
    res.end('Bad Gateway');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('[proxy] listening on :' + PORT + ' -> ' + TARGET);
});
