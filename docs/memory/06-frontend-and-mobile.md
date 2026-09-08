# 06 · Frontend, mobile and the traps

The things a green build will happily lie about. Every item here shipped broken and looked fine in review.

← [README](README.md) · related: [02 Repo map](02-repo-map.md) · [10 History and lessons](10-history-and-lessons.md)

---

## The motion shim

`src/lib/motion.tsx` is a **custom shim, not framer-motion**. Understanding it prevents a whole class of invisible bug.

**How it works.** A Proxy on `motion.*` returns a per-tag cached component. `getAnimType()` (line 57) picks a CSS animation class by looking at the **shape of `initial`** or `variants.hidden`: it reads `.y/.x/.scale/.opacity/.rotate` and maps to `fade-up`, `fade-scale-up`, `scale-in`, `fade-rotate`, `fade-in` or `slide-in`. The only inline styles it ever writes are `animationDuration` and `animationDelay`. `whileInView` is a real IntersectionObserver. `whileHover` and `whileTap` become `data-motion-hover-*` attributes for CSS to pick up.

**What it silently ignores.** The numeric values inside an object `animate` prop are **never read**. `animate={{rotate: 180}}` does not rotate anything. `animate={{width: '60%'}}` sets no width. `height: 'auto'` does nothing. Also ignored: `layout`, `layoutId`, all drag props, `exit`, and `staggerChildren`. `AnimatePresence` is a no-op passthrough.

The relevant line, `motion.tsx:176`:

```ts
const hasObjectAnimate = props.animate != null && typeof props.animate !== 'string'
  && Object.keys(props.animate as object).length > 0;
```

That flag only decides **whether** to apply the class already chosen from `initial`. The values are discarded.

**So the rule is:** anything that moves in response to state uses CSS keyframes or an inline style. Object-style `animate` is only ever decorative, and only works at all when a matching `initial` implies the animation.

**Where it has bitten.** The CostMeter fill, the MonthlyChart bars, a scan line and a spinner all rendered nothing for weeks. The booking progress bar was stuck at 100% on step 1 of 4 (`63e75a7`). All were replaced with CSS keyframes (`meter-fill`, `scan-sweep`, `spin-slow`, `chart-bar`) or inline width.

> ⚠️ **Two live instances, still broken.** Both are chevrons that are supposed to flip when a panel opens and do not, because they have no `initial` for the shim to key off:
> - `src/components/solar/WhySolar.tsx:482`: `animate={{ rotate: expanded ? 180 : 0 }}`
> - `src/components/solar/FAQ.tsx:190`: `animate={{ rotate: isOpen ? 180 : 0 }}`
>
> The other 44 `animate={{` hits in the codebase are all paired with a matching `initial` and work as intended.

**The other bug in this file, already fixed.** The Proxy used to return a **new component type on every access**, so React remounted whole subtrees on every render: inputs lost focus per keystroke, site-wide. The `motionComponentCache` at line 276 is what stops that. Do not remove it.

`motion.tsx` also exports a genuine little RAF tween engine (`MotionValue`, `useMotionValue`, `useTransform`, `animate`) used for counters. That part is real and works.

---

## The mobile bottom layer

Four things want the bottom-right corner of a phone screen. `src/lib/bottomLayer.ts` is how they agree.

**The mechanism.** `setCookieBannerVisible(visible)` sets `document.body.dataset.sigCookieBanner` and dispatches a `sig:cookie-banner` CustomEvent. `useCookieBannerVisible()` reads the flag on mount, then listens. Same-tab pub/sub, no state library.

**The layer map:**

| Element | Position | z |
|---|---|---|
| `ScrollProgress` | `fixed top-0`, 2px bar | 100 |
| Skip link (keyboard focus only) | `focus:fixed` | 200 |
| `ExitIntent` modal | `fixed inset-0` | 100 |
| Cookie consent sheet | `fixed bottom-0 left-0 right-0` | 60 |
| Navbar mobile panel | `fixed inset-x-0 top-0` | 60 |
| Navbar bar | `fixed top-0` | 30 |
| Cookie settings FAB | `fixed bottom-24 right-6` | 45 |
| Chat FAB / notification / panel | `fixed bottom-6 right-6` · `bottom-40 right-6` · panel | 50 |
| `MobileStickyCTA` | `fixed bottom-0 left-0 right-[5.5rem]` | 40 |

Two separate mechanisms keep these apart, and both matter:

1. **Vertical stand-down.** `MobileStickyCTA` (line 48) and `WhatsAppChat` (lines 251, 613) both read `useCookieBannerVisible()` and hide themselves while the consent sheet is up. Before this existed, the cookie banner covered 432px of a 375px-wide screen and buried both (`5cd5c28`).
2. **Horizontal clearance.** `MobileStickyCTA` is `right-[5.5rem]`, an explicit gap so it never runs under the chat FAB's corner even though both are visible at once.

`MobileStickyCTA` also only appears when: scrolled past 90% of viewport height, the analyser section is not on screen, you are not within 360px of the page bottom, and the cookie banner is down. It is `lg:hidden`, so desktop never sees it.

`ExitIntent` suppresses itself while `body.dataset.sigChatOpen === '1'`, set by the chat. It fires on desktop mouseleave past the top, tab-hidden-then-visible, a sharp mobile scroll-up past 900px, or a 60s idle fallback, and never inside the first 25 seconds.

---

## The chat panel on a phone

`WhatsAppChat.tsx` is where most of Cal's mobile complaints landed. His words are the spec:

> *"the reply is literally a block of text that falls of the screen and you have to drag across just to read it"*
> *"its like i can zoom in and out on the screen which isnt right"*
> *"mobile is zoomed of the screen when i clicked out of the chatbot"*

What fixed each:

- **iOS zoom-stick**: viewport `maximum-scale=1` plus every chat input at 16px (`text-base`). Under 16px, iOS zooms on focus and does not zoom back (`bf9a173`).
- **Keyboard resize**: `window.visualViewport` resize and scroll listeners drive the panel height, under `max-width: 639px` only (lines 351-365).
- **Body scroll lock**: `position: fixed` with scrollY restore while open, under 639px (lines 370-392). The scroll-behind was Cal's first complaint of the session.
- **`inert`**: on the closed panel (`inert={!isOpen}`) and on the notification bubble. A closed panel used to stay in the tab order.
- **Minimize**: kept the full 812px sheet geometry, so minimising painted a full black screen. Now a 90px bottom bar (`63e75a7`).
- **Text wrapping**: reply bubbles wrap. That was the block-of-text-off-the-screen.
- **Colour**: chat bubbles and the Start Chat button are brand **yellow**. WhatsApp stays green. Cal spotted that a green chat button reads as WhatsApp and sends the wrong signal.
- **Notification toast**: auto-dismisses, and moved to `bottom-40` so it stops covering the cookie settings button.

---

## The daylight track

`DaylightTrack.tsx` draws today's real daylight arc over Ireland with the sun where it actually is: NOAA equation of time and declination at 53.42, -7.94 (Athlone), recomputed every minute. In December the arc is visibly short; in June it stretches.

It is **client-only by design** and returns `null` until its first effect runs, so its absence from the SSR HTML is correct, not a bug. It claims nothing about output: daylight is a fact, what a roof makes from it is the survey's job.

It lives in a dark glass pill because the first version was a 14% white hairline with 11px grey text over a photographic hero. Cal: *"you have completely fucked the sun setting icon. you can barely see it."* Stroke weights doubled, a three-layer glowing dot, text at 13px white and 12px at 65%.

---

## Verification discipline

Every one of these rules exists because I broke it and Cal caught the result.

**Restart the server after every rebuild.** `preview_stop` then `preview_start`. I screenshotted stale builds repeatedly and reported fixes that had not shipped.

**Render it and look at it.** A PDF space guard silently dropped rows twice, off by 1pt and then by 7pt. Nothing but rendering to PNG and looking caught either. A build passing tells you the types line up, nothing more.

**Re-audit after your own sweep.** Two adversarial re-audit waves after the build waves each found real shipped bugs that grep had missed: blog-index schema leaking onto every article via `layout.tsx`, duplicate `@id`s, an invisible duplicate FAQPage, and a literal `{depositPercent}` reaching users because a template literal used single quotes.

**An empty result is not a pass.** A workflow once returned `{}` because all six of its agents had died on a session limit, and I nearly reported that as all-clear. Read the journal before believing a clean result.

**Measure at real widths.** The headless Chrome CDP harness (bun plus a WebSocket to the DevTools protocol) measures real layout when the browser pane is hidden. Sweeps run at 375, 390, 768, 1024, 1280 and 1440. The 1024-1099px band in particular has broken twice: the navbar switches to desktop layout at 1024 but its content needed 1100px.

---

## Component quick reference

`src/components/solar/`

| Component | Where | Lead source | Notes |
|---|---|---|---|
| `BillAnalyser` | home, `/solar-calculator` | `bill_analyser`, `website_qualified` | The centrepiece. Upload, camera capture, or manual entry. `<section id="calculator">` |
| `Hero` | home | none | Three CTAs: `#calculator`, WhatsApp, `/book-survey` |
| `StatsBar` | home | none | **`hidden sm:block`, invisible on mobile** |
| `HowItWorks` | home | none | Step 2 says "Book Free Survey", links to WhatsApp |
| `WhySolar` | home | none | Broken chevron rotate at :482 |
| `CustomerInstalls` | home | none | Gallery with lightbox at z-60, swipeable |
| `GrantInfo` | home | none | Eligibility quiz. "Book Free Survey" button links to WhatsApp |
| `FAQ` | home, financing, calculator | none | Broken chevron rotate at :190 |
| `ExitIntent` | home | `exit_intent` | To be replaced by Cal's 5-step onboarding form |
| `WhatsAppChat` | 15 pages | `website_chat` | The AI chat, not WhatsApp |
| `MobileStickyCTA` | global | none | Scrolls to `#calculator` |
| `DaylightTrack` | inside Hero | none | Client-only |
| `Navbar` `Footer` `ScrollProgress` `BumblebeeMascot` | global | none | |

`src/components/`: `CookieConsent` (owns the bottom-layer signal), `HomeSchema` (JSON-LD), `LeadSourceTracker` (global click listener for `whatsapp_click` and book-survey events), `PostHogProvider`.

---

## The CTA problem

Cal's direction: *"you should be able to book a survey on the website before we lose the lead to an estimate and them leaving the site. if we send the estimate to quick we lose them to email."*

Against that, the site currently pushes visitors to WhatsApp from roughly 25 places, and **three of them are labelled as booking a survey while linking to WhatsApp**:

- `HowItWorks.tsx:47`: "Book Free Survey"
- `GrantInfo.tsx:272-283`: "Book Free Survey", on the eligible outcome, the highest-intent moment on the page
- `services/ServicesClient.tsx:708`: "book a free home survey"

Real `/book-survey` links exist in `Hero.tsx:150`, `Navbar` (desktop and mobile), `Footer.tsx:77`, `ExitIntent.tsx:342`, `BillAnalyser.tsx:1111` (`?src=analyser`) and `SolarCalculatorClient.tsx:285`.

This is written up as work, not done, in [09 Open items](09-open-items.md).
