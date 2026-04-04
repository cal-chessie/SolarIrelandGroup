'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

/**
 * Wraps any section content with a smooth reveal on scroll.
 * Supports staggered delay for sequential sections.
 */
export default function SectionReveal({
  children,
  delay = 0,
  className = '',
  id,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  );
}
