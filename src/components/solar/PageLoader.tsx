'use client';

import { motion, AnimatePresence } from '@/lib/motion';

/**
 * Full-page loading skeleton shown on initial mount.
 * Mimics the layout structure so the transition to real content feels seamless.
 */
export default function PageLoader({ isLoading }: { isLoading: boolean }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-[200] bg-[#0a0a0a] flex flex-col"
        >
          {/* Navbar skeleton */}
          <div className="flex items-center justify-between px-5 sm:px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/[0.06] animate-pulse" />
              <div className="h-5 w-28 rounded-md bg-white/[0.06] animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-24 rounded-lg bg-white/[0.04] animate-pulse" />
              <div className="h-8 w-8 rounded-lg bg-white/[0.04] animate-pulse" />
            </div>
          </div>

          {/* Hero skeleton */}
          <div className="flex-1 flex items-center justify-center px-5 sm:px-8">
            <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center gap-10">
              <div className="flex-1 space-y-5">
                <div className="h-5 w-40 rounded-full bg-white/[0.04] animate-pulse" />
                <div className="space-y-3">
                  <div className="h-12 sm:h-16 w-[280px] sm:w-[400px] rounded-xl bg-white/[0.04] animate-pulse" />
                  <div className="h-12 sm:h-16 w-[250px] sm:w-[360px] rounded-xl bg-white/[0.04] animate-pulse" />
                </div>
                <div className="h-4 w-[300px] sm:w-[400px] rounded-lg bg-white/[0.03] animate-pulse" />
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-11 w-44 rounded-full bg-amber-400/10 animate-pulse" />
                  <div className="h-11 w-36 rounded-full bg-white/[0.04] animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col items-center gap-6">
                <div className="w-48 h-48 rounded-full bg-white/[0.03] animate-pulse" />
                <div className="h-9 w-56 rounded-full bg-white/[0.03] animate-pulse" />
                <div className="grid grid-cols-2 gap-3 w-[280px]">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content sections skeleton */}
          <div className="max-w-6xl mx-auto w-full px-5 sm:px-8 pb-12 space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-white/[0.02] animate-pulse" />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
