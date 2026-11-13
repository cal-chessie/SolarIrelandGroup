'use client';

import { lazyIsland } from '@/components/LazyIsland';
// The Bill Analyser's door sheet rides on the route's own CSS, which
// next.config inlines into the HTML. Imported only inside BillAnalyser (behind
// the island's dynamic import) it shipped as a separate file fetched when the
// island woke, so the door's server HTML sat unstyled (raw radios, file
// inputs, 528px tall) until it landed and the section jumped to its real
// height mid-scroll (Cal, 13 Nov: "scrolling into the section glitches").
import '@/components/intake/analyser-door.css';

// Below-the-fold sections (home and /solar-calculator), hydrated only near the viewport (see
// src/components/LazyIsland.tsx). Server HTML is unchanged.
export const BillAnalyserIsland = lazyIsland(() => import('./BillAnalyser'));
export const GrantInfoIsland = lazyIsland(() => import('./GrantInfo'));
export const CustomerInstallsIsland = lazyIsland(() => import('./CustomerInstalls'));
export const FAQIsland = lazyIsland(() => import('./FAQ'));
// The footer is not an island: as the last boundary in the document its
// streamed HTML can land after hydration has started, and React then drops it
// until the island wakes. It stays a normal client component.
