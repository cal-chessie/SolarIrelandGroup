'use client';

/**
 * What the Bill Analyser hands the manual side (Road 2) when a read fails,
 * is partial, or the visitor chooses to type it in (CALL-FUNNEL-PLAN: every
 * failure lands on Road 2 carrying what was read).
 *
 * It travels in this tab's sessionStorage only, because it can hold the name,
 * Eircode and MPRN read off the bill, which never go in a URL. The intake
 * reads it once on open and removes it.
 */
import type { AnalyserRead, Segment } from '@/lib/intake/contract';

export const CARRY_KEY = 'si-analyser-carry-v1';

export interface AnalyserCarry {
  v: 1;
  /** Why the visitor came over: a failure reason, or "no_bill". */
  from: string;
  segment: Segment;
  read: Partial<AnalyserRead> | null;
  at: number;
}

/** Read and remove the carry; anything older than 30 minutes is ignored. */
export function takeCarry(): AnalyserCarry | null {
  try {
    const raw = sessionStorage.getItem(CARRY_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(CARRY_KEY);
    const c = JSON.parse(raw) as AnalyserCarry;
    if (!c || c.v !== 1 || Date.now() - c.at > 30 * 60_000) return null;
    return c;
  } catch {
    return null;
  }
}
