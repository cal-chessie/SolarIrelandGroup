export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[101] pointer-events-none">
      <div
        className="absolute top-0 left-0 h-[2px] w-full"
        style={{
          background: 'linear-gradient(90deg, #facc15 0%, #f59e0b 50%, #fbbf24 100%)',
          boxShadow: '0 0 12px rgba(250, 204, 21, 0.4), 0 0 4px rgba(250, 204, 21, 0.3)',
          animation: 'loading-slide 1.2s ease-in-out infinite',
        }}
      />

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
