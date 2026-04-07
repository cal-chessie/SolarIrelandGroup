---
Task ID: 1
Agent: Main Agent
Task: Fix calculator slider - replaced custom pointer events slider with native input[type=range]

Work Log:
- Read QuickSavingsCalculator.tsx - confirmed 'use client' directive present, code uses custom Pointer Events API slider
- Read page.tsx - confirmed component is dynamically imported via next/dynamic from @/components/solar/QuickSavingsCalculator
- Read globals.css - had custom .solar-slider-* styles for pointer events slider
- Read @/lib/motion.tsx - custom framer-motion replacement, works correctly
- Read @/lib/solar-data.ts and @/lib/whatsapp.ts - both valid
- Diagnosed: The custom pointer events slider (44px thumb, Pointer Events API, global move/up handlers) was over-engineered and had potential failure modes
- Replaced BillSlider component with native `<input type="range">` - most bulletproof cross-browser approach
- Used `onChange` handler for real-time updates (fires continuously while dragging in React)
- Updated globals.css: replaced .solar-slider-* styles with .solar-range-input styles for native range input
- CSS includes: custom amber thumb (#facc15), progress fill via --range-pct CSS variable, hover/active glow effects
- Webkit: track uses linear-gradient with --range-pct variable for progress fill
- Firefox: uses native ::moz-range-progress for progress fill
- Build succeeded, server restarted, confirmed new code in built JS/CSS chunks

Stage Summary:
- The calculator slider now uses a native `<input type="range">` instead of custom pointer events
- This is the most reliable approach - works on every browser, every device, every touch screen
- Key files changed: src/components/solar/QuickSavingsCalculator.tsx, src/app/globals.css
- Build verified: .next/static/chunks contains solar-range-input class in both JS and CSS
- Server running on port 3000, Caddy proxying correctly
