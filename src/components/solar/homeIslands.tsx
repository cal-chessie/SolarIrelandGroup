'use client';

import { lazyIsland } from '@/components/LazyIsland';

// Below-the-fold sections (home and /solar-calculator), hydrated only near the viewport (see
// src/components/LazyIsland.tsx). Server HTML is unchanged.
export const BillAnalyserIsland = lazyIsland(() => import('./BillAnalyser'));
export const GrantInfoIsland = lazyIsland(() => import('./GrantInfo'));
export const CustomerInstallsIsland = lazyIsland(() => import('./CustomerInstalls'));
export const FAQIsland = lazyIsland(() => import('./FAQ'));
// The footer is not an island: as the last boundary in the document its
// streamed HTML can land after hydration has started, and React then drops it
// until the island wakes. It stays a normal client component.
