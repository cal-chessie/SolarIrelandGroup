'use client';

import { lazyIsland } from '@/components/LazyIsland';
// The Bill Analyser's sheet rides on the route's own CSS, which next.config
// inlines into the HTML. Imported only behind the island's dynamic import it
// shipped as a file fetched when the island woke, and the door sat unstyled
// until it landed (13 Nov). It is the whole intake.css, never a subset plus a
// late full sheet: a sheet that lands after first paint re-orders the cascade
// and restyled the door on a tap (14 Nov, see BillAnalyser.tsx).
import '@/components/intake/intake.css';

// Below-the-fold sections (home and /solar-calculator), hydrated only near the viewport (see
// src/components/LazyIsland.tsx). Server HTML is unchanged.
export const BillAnalyserIsland = lazyIsland(() => import('./BillAnalyser'));
export const GrantInfoIsland = lazyIsland(() => import('./GrantInfo'));
export const CustomerInstallsIsland = lazyIsland(() => import('./CustomerInstalls'));
export const FAQIsland = lazyIsland(() => import('./FAQ'));
// The footer is not an island: as the last boundary in the document its
// streamed HTML can land after hydration has started, and React then drops it
// until the island wakes. It stays a normal client component.
