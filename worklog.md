---
Task ID: 1
Agent: Main Agent
Task: Fix jumpy/flashing animations and broken pages across Solar Ireland site

Work Log:
- Diagnosed root cause: `motion-hidden` CSS class was applied to ALL animated elements during SSR, making entire pages invisible. When client JS hydrated, everything popped in simultaneously causing mass flash/jump.
- Fixed `src/lib/motion.tsx` MotionElement: Changed className logic to NOT apply `motion-hidden` during SSR. Now content renders fully visible during server render. After mount: immediate animations play via CSS `both` fill-mode; scroll-triggered elements get `motion-hidden` only after mount when not yet in view.
- Fixed `getAnimType()` function: Added type check for `hidden` variants (could be string "hidden" not an object).
- Reduced animation distances in `globals.css`: `translateY(24px)` → `translateY(16px)` for subtler motion, `translateX(-24px)` → `translateX(-16px)`, `scale(0.95)` → `scale(0.97)`.
- Increased `motion-hidden` fallback timeout from 3s to 8s (only used for scroll-triggered elements after mount).
- Reduced `glass-card` transition from 0.3s to 0.25s and removed box-shadow transition for smoother hover.
- Fixed SEAI TMY graph: Same root cause — chart container was hidden by `motion-hidden` during SSR, preventing bars from being visible.
- Fixed Services, About, Contact, Blog pages: Same root cause — all content was hidden by `motion-hidden` during SSR.
- Rebuilt project and restarted server on port 3000.

Stage Summary:
- Key fix: motion.tsx no longer applies `motion-hidden` during SSR — content is now visible immediately for SEO and no flash
- All 6 previously broken areas (Services, Blog, About, Contact, SEAI TMY graph, Price chart) should now be working
- Animations are subtler (16px vs 24px travel distance) reducing perceived jumpiness
- Server running on port 3000, Caddy proxying from port 81
