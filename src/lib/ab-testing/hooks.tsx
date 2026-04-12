'use client';

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════
   VISITOR ID — persistent, anonymous identifier
   ═══════════════════════════════════════════════════════ */
function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('ab_visitor_id');
  if (!id) {
    id = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('ab_visitor_id', id);
  }
  return id;
}

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */
interface VariantAssignment {
  variantId: string;
  variantName: string;
}

interface ABTestContextValue {
  visitorId: string;
  getVariant: (experimentId: string) => string | null;
  getVariantName: (experimentId: string) => string;
  isControl: (experimentId: string) => boolean;
  trackConversion: (experimentId: string, type: string, metadata?: Record<string, unknown>) => void;
  loaded: boolean;
}

const ABTestContext = createContext<ABTestContextValue | null>(null);

/* ═══════════════════════════════════════════════════════
   PROVIDER
   ═══════════════════════════════════════════════════════ */
export function ABTestProvider({ children }: { children: ReactNode }) {
  const [visitorId, setVisitorId] = useState('');
  const [assignments, setAssignments] = useState<Record<string, VariantAssignment>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const vid = getVisitorId();
    setVisitorId(vid);

    // Fetch all active experiment assignments in one request
    fetch('/api/ab/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: vid }),
    })
      .then((r) => r.json())
      .then((data: Record<string, VariantAssignment>) => {
        setAssignments(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const getVariant = useCallback(
    (experimentId: string) => assignments[experimentId]?.variantId || null,
    [assignments]
  );

  const getVariantName = useCallback(
    (experimentId: string) => assignments[experimentId]?.variantName || 'Control',
    [assignments]
  );

  const isControl = useCallback(
    (experimentId: string) => {
      const vid = assignments[experimentId]?.variantId;
      // Convention: control variant IDs end with '-a'
      return !vid || vid.endsWith('-a');
    },
    [assignments]
  );

  const trackConversion = useCallback(
    (experimentId: string, type: string, metadata?: Record<string, unknown>) => {
      if (!visitorId) return;
      fetch('/api/ab/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experimentId, visitorId, type, metadata }),
      }).catch(() => {});
    },
    [visitorId]
  );

  return (
    <ABTestContext.Provider
      value={{ visitorId, getVariant, getVariantName, isControl, trackConversion, loaded }}
    >
      {children}
    </ABTestContext.Provider>
  );
}

/* ═══════════════════════════════════════════════════════
   HOOK
   ═══════════════════════════════════════════════════════ */
export function useABTest(experimentId: string) {
  const ctx = useContext(ABTestContext);
  if (!ctx) throw new Error('useABTest must be used within <ABTestProvider>');

  return {
    variant: ctx.getVariant(experimentId),
    variantName: ctx.getVariantName(experimentId),
    isControl: ctx.isControl(experimentId),
    trackConversion: (type: string, metadata?: Record<string, unknown>) =>
      ctx.trackConversion(experimentId, type, metadata),
    loaded: ctx.loaded,
  };
}
