import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Cal, 10 Nov: "it should fit the screen". The real proof is the CDP
// measurement at 375x560, 390x664 and 430x740; this guards the CSS contract
// that makes it true so a later sweep cannot quietly undo it.
const css = readFileSync(join(process.cwd(), 'src/components/intake/intake.css'), 'utf8');

describe('Bill Analyser start card fits one phone screen', () => {
  it('lands every #calculator door under the fixed navbar', () => {
    expect(css).toMatch(/--si-nav-h:\s*73px/);
    expect(css).toMatch(/--si-nav-h:\s*81px/);
    expect(css).toMatch(/scroll-margin-top:\s*var\(--si-nav-h\)/);
  });
  it('sizes the phone start section to the small visible viewport, with a vh fallback', () => {
    expect(css).toMatch(/min-height:\s*calc\(100vh - var\(--si-nav-h\)\);\s*min-height:\s*calc\(100svh - var\(--si-nav-h\)\)/);
  });
  it('keeps the trust chips on one line on phones', () => {
    const phone = css.slice(css.indexOf('@media (max-width: 1023px) {\n  .si-an-door .si-an-trust'));
    expect(phone).toMatch(/flex-wrap:\s*nowrap/);
    expect(phone).toMatch(/overflow-x:\s*auto/);
  });
  it('keeps the switch and privacy line at 44px tap targets', () => {
    expect(css).toMatch(/\.si-an-door \.si-an-seg label \{\s*min-height:\s*44px/);
    expect(css).toMatch(/\.si-an-priv__line \{\s*min-height:\s*44px/);
  });
});
