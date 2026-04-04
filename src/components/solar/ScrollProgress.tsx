'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Thin amber progress bar fixed to the top of the viewport.
 * Shows scroll depth — grows from left to right as user scrolls down.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 50,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left"
      style={{
        scaleX,
        background:
          'linear-gradient(90deg, #facc15 0%, #f59e0b 50%, #fbbf24 100%)',
        boxShadow: '0 0 12px rgba(250, 204, 21, 0.4), 0 0 4px rgba(250, 204, 21, 0.3)',
      }}
    />
  );
}
