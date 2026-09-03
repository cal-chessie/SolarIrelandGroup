import Link from 'next/link';
import { Sun, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist. Return to Solar Ireland to explore solar panel options.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <html lang="en-IE" className="dark">
      <head>
        <title>404 - Page Not Found | Solar Ireland</title>
        <meta name="description" content="The page you are looking for does not exist." />
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="bg-[#0a0a0a] text-white min-h-screen flex items-center justify-center antialiased">
        <div className="text-center px-4 max-w-lg">
          <h1 className="text-[120px] sm:text-[160px] font-bold leading-none mb-4">
            <span className="text-gradient">404</span>
          </h1>

          <div className="w-20 h-20 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-8">
            <Sun className="w-10 h-10 text-amber-400" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Try searching from our homepage or browse our solar guides.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-400/15"
          >
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link
              href="/blog"
              className="text-gray-500 hover:text-amber-400 transition-colors"
            >
              Blog
            </Link>
            <span className="text-gray-800">·</span>
            <Link
              href="/services"
              className="text-gray-500 hover:text-amber-400 transition-colors"
            >
              Services
            </Link>
            <span className="text-gray-800">·</span>
            <Link
              href="/contact"
              className="text-gray-500 hover:text-amber-400 transition-colors"
            >
              Contact
            </Link>
            <span className="text-gray-800">·</span>
            <Link
              href="/counties"
              className="text-gray-500 hover:text-amber-400 transition-colors"
            >
              Counties
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
