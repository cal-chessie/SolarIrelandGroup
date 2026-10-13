'use client';

import IntakeApp from './IntakeApp';
import type { IntakeOpenOptions } from '@/lib/intake/open';

/** The intake as a page: a cold load or refresh of /estimate, and /book-survey. */
export default function IntakePage({ initial }: { initial: IntakeOpenOptions & { stepRaw?: string | null } }) {
  return <IntakeApp variant="page" initial={initial} />;
}
