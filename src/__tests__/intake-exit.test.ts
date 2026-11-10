import { beforeEach, describe, expect, it } from 'vitest';
import { INTAKE_EXIT_DEFAULT, intakeExitPath, rememberIntakeEntry, safeReturnPath } from '@/lib/intake/open';

describe('leaving the intake goes back where they came from', () => {
  beforeEach(() => sessionStorage.clear());

  it('defaults to the homepage analyser', () => {
    expect(INTAKE_EXIT_DEFAULT).toBe('/#calculator');
    expect(intakeExitPath()).toBe('/#calculator');
  });

  it('returns to the page the door was opened from', () => {
    window.history.replaceState(null, '', '/blog/solar-panels-cost?x=1#faq');
    rememberIntakeEntry();
    expect(intakeExitPath()).toBe('/blog/solar-panels-cost?x=1#faq');
  });

  it('never leaves the site and never loops back into the intake', () => {
    for (const bad of ['https://evil.example/', '//evil.example/x', '/estimate', '/estimate?step=time', 'javascript:alert(1)', '/\\evil']) {
      expect(safeReturnPath(bad)).toBeNull();
    }
    sessionStorage.setItem('si-intake-entry', '//evil.example');
    expect(intakeExitPath()).toBe('/#calculator');
  });
});
