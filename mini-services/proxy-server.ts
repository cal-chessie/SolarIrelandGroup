// @ts-nocheck
import { createServer, IncomingMessage, ServerResponse } from 'http';
import httpProxy from 'http-proxy';
import { parse } from 'url';

const TARGET = 'http://127.0.0.1:3001';
const PORT = 3000;

const proxy = httpProxy.createProxyServer({ target: TARGET, changeOrigin: true });

// Log proxy errors but don't crash
proxy.on('error', (err: Error, _req: IncomingMessage, res: ServerResponse) => {
  console.error('[proxy] error:', err.message);
  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
  }
  res.end('Bad Gateway');
});

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  // Pipe the request to Next.js, but strip dangerous cache headers on the way back
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

// Intercept the response headers coming from Next.js to strip aggressive caching
proxy.on('proxyRes', (proxyRes: httpProxy.IncomingMessage, _req: IncomingMessage, _res: ServerResponse) => {
  // Next.js 16 sets s-maxage=31536000 (1 year!) on HTML pages.
  // This causes CDN / gateway caches to serve stale content forever.
  // Strip it so our no-cache headers from next.config take effect.
  const raw = proxyRes.headers['cache-control'] || '';
  if (raw.includes('s-maxage')) {
    const parts = raw.split(',').map((p) => p.trim()).filter((p) => {
      return !p.startsWith('s-maxage');
    });
    proxyRes.headers['cache-control'] = parts.join(', ');
    console.log(`[proxy] stripped s-maxage from: ${raw}`);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[proxy] listening on :${PORT} → proxying to ${TARGET}`);
});
