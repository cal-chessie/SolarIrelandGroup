import { intakeMode } from '@/lib/intake/mode';

/**
 * POST /api/intake/handoff  (form field "code")
 *
 * STUB ONLY: stands in for the portal host's hand-off receiver
 * (backend-spec 4.4, `https://aisolar.ie/h`). In live mode the confirmation's
 * "Open your project page" posts the single-use code straight to the portal
 * host, never through this site, and this route answers 404.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE = `<!doctype html><html lang="en-IE"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Project page (stub)</title>
<style>body{margin:0;background:#0a0a0a;color:#fff;font:16px/24px system-ui,-apple-system,"Segoe UI",sans-serif;display:grid;place-items:center;min-height:100vh;padding:16px;box-sizing:border-box}main{max-width:480px}p{color:#99a1af}a{color:#fff}</style></head>
<body><main><h1 style="font-size:24px;line-height:30px;margin:0 0 8px">Stub hand-off received</h1><p>In live mode this button opens the homeowner's own project page on the portal, signed in by a single-use code. Nothing was sent anywhere.</p><p><a href="/">Back to the site</a></p></main></body></html>`;

export async function POST() {
  if (intakeMode() !== 'stub') return new Response('Not found', { status: 404 });
  return new Response(PAGE, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
}
