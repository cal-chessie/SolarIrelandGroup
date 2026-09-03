/* ═══════════════════════════════════════════════════════════════
   CSP VIOLATION COLLECTOR
   ═══════════════════════════════════════════════════════════════
   Receives Content-Security-Policy-Report-Only violation reports during the
   rollout and logs them so they show up in the platform logs. Browsers send
   two shapes:
     - report-uri  -> application/csp-report:   { "csp-report": {...} }
     - report-to   -> application/reports+json:  [ { type, body: {...} }, ... ]
   Once the logs are quiet, flip ENFORCE_IN_PRODUCTION in src/middleware.ts.
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
// Reports arrive after any static optimisation; keep this handler dynamic.
export const dynamic = "force-dynamic";

type CspFields = {
  "blocked-uri"?: string;
  blockedURL?: string;
  "violated-directive"?: string;
  effectiveDirective?: string;
  "document-uri"?: string;
  documentURL?: string;
  disposition?: string;
};

function summarise(report: CspFields) {
  return {
    blocked: report["blocked-uri"] ?? report.blockedURL ?? "unknown",
    directive:
      report["violated-directive"] ?? report.effectiveDirective ?? "unknown",
    document: report["document-uri"] ?? report.documentURL ?? "unknown",
    disposition: report.disposition ?? "report",
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload: unknown = await request.json();
    // report-to sends an array of { type, body }; report-uri sends one object.
    const items = Array.isArray(payload) ? payload : [payload];
    for (const item of items) {
      const record = item as { "csp-report"?: CspFields; body?: CspFields };
      const report = record["csp-report"] ?? record.body ?? (item as CspFields);
      console.warn("[csp-report]", JSON.stringify(summarise(report)));
    }
  } catch {
    // Malformed or empty report bodies are ignored - never error a beacon.
  }
  // 204: browsers ignore the response body for reports.
  return new NextResponse(null, { status: 204 });
}
