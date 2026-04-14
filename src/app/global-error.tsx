'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-IE" className="dark">
      <body className="bg-[#0a0a0a] antialiased">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-gray-500 text-sm mb-8">
              A loading glitch occurred. Click below to reload.
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 text-black font-bold text-sm hover:bg-amber-300 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
