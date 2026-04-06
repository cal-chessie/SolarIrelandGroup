/**
 * Global loading indicator — shown during route transitions.
 * Thin amber progress bar that slides across the top of the viewport.
 * Uses z-[101] to sit above the ScrollProgress component (z-[100])
 * without conflicting — the loading bar replaces scroll progress
 * while a page is mid-navigation.
 */
export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[101] pointer-events-none">
      {/* Sliding amber bar */}
      <div
        className="absolute top-0 left-0 h-[2px] w-full"
        style={{
          background: 'linear-gradient(90deg, #facc15 0%, #f59e0b 50%, #fbbf24 100%)',
          boxShadow: '0 0 12px rgba(250, 204, 21, 0.4), 0 0 4px rgba(250, 204, 21, 0.3)',
          animation: 'loading-slide 1.2s ease-in-out infinite',
        }}
      />

      {/* Inline keyframe — avoids CSS filter, uses transform only (GPU-safe) */}
      <style>{`
        @keyframes loading-slide {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
