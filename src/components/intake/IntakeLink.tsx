'use client';

/**
 * A link that opens the intake. A real <a href="/estimate?..."> so it works
 * without JavaScript and in a new tab; a plain click opens the layer instead.
 */
import type { ReactNode } from 'react';
import { intakeHref, openIntake, type IntakeOpenOptions } from '@/lib/intake/open';

export default function IntakeLink({
  opts,
  className,
  children,
  onOpen,
  ariaLabel,
}: {
  opts: IntakeOpenOptions;
  className?: string;
  children: ReactNode;
  onOpen?: () => void;
  ariaLabel?: string;
}) {
  return (
    <a
      href={intakeHref(opts)}
      className={className}
      aria-label={ariaLabel}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        onOpen?.();
        openIntake(opts);
      }}
    >
      {children}
    </a>
  );
}
