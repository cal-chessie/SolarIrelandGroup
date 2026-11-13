import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Cal, 11 Nov, on his phone: "you are not using the screen properly and it
// all looks cramped". The start state IS the phone screen: full bleed under
// the fixed navbar, three zones spread down the visible height, every line
// inside the visible viewport. The real proof is the CDP measurement
// (INTAKE/shots/apple-start, privacy text bottom vs viewport, Home and
// Business): 375x560 549/559 of 560, 390x664 653/664, 430x740 728/740,
// 768x1024 643/686, 1440x900 693/718. These tests guard the CSS contract
// that makes it true so a later sweep cannot quietly undo it.
// 13 Nov, Cal on his iPhone, reversing the phone spread: about 100px of empty
// black above and below Home | Business, and with the control centred the
// grant line it rewrites sat off the top, so a tap looked dead. On a phone the
// door is now one content-sized stack: headline, Home | Business, the grant
// line directly under it, then both roads.
const css = readFileSync(join(process.cwd(), 'src/components/intake/intake.css'), 'utf8');
const tsx = readFileSync(join(process.cwd(), 'src/components/solar/BillAnalyser.tsx'), 'utf8');
const block = (open: string) => {
  const at = css.indexOf(open);
  expect(at, open).toBeGreaterThan(-1);
  let depth = 0;
  for (let i = css.indexOf('{', at); i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    if (css[i] === '}' && --depth === 0) return css.slice(at, i + 1);
  }
  return '';
};
const phone = block('@media (max-width: 767px) {\n  .si-an--section');
const rule = (sel: string) => {
  const m = phone.match(new RegExp(`${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`));
  return m ? m[1] : '';
};
const short = block('@media (max-width: 767px) and (max-height: 620px)');

describe('Bill Analyser start state fits one phone screen', () => {
  it('lands every #calculator door under the fixed navbar', () => {
    expect(css).toMatch(/--si-nav-h:\s*73px/);
    expect(css).toMatch(/--si-nav-h:\s*81px/);
    expect(css).toMatch(/scroll-margin-top:\s*var\(--si-nav-h\)/);
  });

  it('sizes the phone door to its content, never to the screen height', () => {
    expect(phone).not.toMatch(/min-height:\s*calc\(100s?vh/);
    expect(phone).not.toMatch(/justify-content:\s*space-between/);
    expect(phone.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/svh/);
  });

  it('puts the grant line directly under Home | Business on a phone', () => {
    expect(phone).toMatch(/background:\s*transparent/);
    expect(phone).toMatch(/box-shadow:\s*none/);
    expect(phone).toMatch(/\.si-an-door__pitch,\s*\.si-an-door \.si-an-door__mid \{\s*display:\s*contents/);
    const order = (sel: string) => Number(rule(sel).match(/order:\s*(\d+)/)?.[1]);
    const title = order('.si-an-door .si-an-door__title');
    const seg = order('.si-an-door .si-an-seg');
    const sub = order('.si-an-door .si-an-door__sub');
    const act = order('.si-an-door .si-an-door__act');
    expect(title).toBeLessThan(seg);
    expect(seg).toBeLessThan(sub);
    expect(sub).toBeLessThan(act);
    // DOM order unchanged: reading order stays message, control, roads.
    expect(tsx).toMatch(/si-an-door__pitch[\s\S]*si-an-door__mid[\s\S]*si-an-door__act/);
  });

  it('keeps the headline at 28px or more and the body at 15px or more on the shortest phone', () => {
    expect(phone).toMatch(/\.si-an-door__title \{\s*font-size:\s*clamp\(28px, [\d.]+vw, \d+px\)/);
    // Never sized by height: the toolbar collapsing mid-scroll changes the
    // height and reflowed the headline from two lines to three.
    expect(short).not.toMatch(/\.si-an-door__title \{[^}]*font-size/);
    expect(short).toMatch(/\.si-an-door__sub \{[^}]*font-size:\s*15px/);
  });

  it('keeps every start-state tap target at 44px or more', () => {
    expect(css).toMatch(/\.si-an-door \.si-an-seg label \{\s*min-height:\s*44px/);
    expect(css).toMatch(/\.si-an-priv__line \{[^}]*min-height:\s*44px/);
    expect(phone).toMatch(/\.si-an-road \{[^}]*min-height:\s*56px/);
    expect(short).toMatch(/\.si-an-road \{\s*min-height:\s*48px/);
    expect(short).not.toMatch(/label \{\s*min-height:\s*(\d|[1-3]\d|4[0-3])px/);
  });

  it('slides the segment thumb and respects reduced motion', () => {
    expect(tsx).toMatch(/si-an-seg__thumb/);
    expect(css).toMatch(/\.si-an-seg\[data-at='1'\] \.si-an-seg__thumb \{\s*transform:\s*translateX\(100%\)/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.si-an-seg__thumb \{\s*transition:\s*none/);
  });

  it('is a two-column composition from 768, not a floating card', () => {
    const wide = block('@media (min-width: 768px) {\n  .si-analyser');
    expect(wide).toMatch(/grid-template-areas:\s*'pitch mid' 'pitch act'/);
    expect(css).toMatch(/min-height:\s*min\(80svh, 760px\)/);
  });
});
