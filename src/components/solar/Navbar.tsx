'use client';

import { useState, useEffect, useCallback, type ComponentType } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { onPage, savingsHref } from './navLinks';
import type { MobileMenuProps } from './NavbarMobileMenu';

// Desktop nav - all 7 links with proper styling
const desktopNavLinks = [
  { label: 'Services', href: '/services', isBookSurvey: false },
  { label: 'Counties', href: '/counties', isBookSurvey: false },
  { label: 'Calculator', href: '/solar-calculator', isBookSurvey: false },
  { label: 'Financing', href: '/financing', isBookSurvey: false },
  { label: 'Blog', href: '/blog', isBookSurvey: false },
];

function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="relative w-6 h-6 flex items-center justify-center">
      <span
        className={`absolute h-[1.5px] bg-white rounded-full origin-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? 'rotate-45 w-5' : 'w-[18px] -translate-y-1.5'
        }`}
      />
      <span
        className={`absolute h-[1.5px] bg-white rounded-full w-4 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
        }`}
      />
      <span
        className={`absolute h-[1.5px] bg-white rounded-full origin-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? '-rotate-45 w-5' : 'w-3.5 translate-y-1.5'
        }`}
      />
    </div>
  );
}

// The phone menu is its own chunk (NavbarMobileMenu.tsx). One import per page
// load, shared by every caller.
let menuModule: Promise<{ default: ComponentType<MobileMenuProps> }> | null = null;
function loadMenuModule() {
  if (!menuModule) {
    menuModule = import('./NavbarMobileMenu').catch((err) => {
      menuModule = null; // a failed fetch retries on the next touch
      throw err;
    });
  }
  return menuModule;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Perf (13 Nov 2026): the phone menu loads when the browser is idle, or at
  // once when the hamburger is touched, focused or clicked. `armed` waits two
  // frames after it mounts, so a tap that lands before the chunk still gets
  // the slide-in instead of a snap.
  const [MobileMenu, setMobileMenu] = useState<ComponentType<MobileMenuProps> | null>(null);
  const [armed, setArmed] = useState(false);
  const loadMenu = useCallback(() => {
    loadMenuModule().then(
      (m) => setMobileMenu(() => m.default),
      () => {},
    );
  }, []);
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(loadMenu, { timeout: 3000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(loadMenu, 1500);
    return () => clearTimeout(t);
  }, [loadMenu]);
  useEffect(() => {
    if (!MobileMenu) return;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setArmed(true));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [MobileMenu]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigateTo = (href: string) => {
    if (href.startsWith('/') && !href.startsWith('/#')) {
      window.location.href = href;
    } else if (href.startsWith('/#')) {
      const hash = href.slice(2);
      if (window.location.pathname === '/') {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = href;
      }
    } else if (href.startsWith('#')) {
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <nav
        aria-label="Site navigation"
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
          scrolled
            ? 'bg-black/95 border-b border-white/[0.06] shadow-lg shadow-black/20'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-6xl xl:max-w-[74rem] 2xl:max-w-[78rem] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] xl:h-20 flex items-center justify-between gap-4 xl:gap-8">
          {/* Logo */}
          <button
            onClick={() => {
              if (pathname !== '/') {
                window.location.href = '/';
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2 shrink-0 active:scale-95 transition-transform"
          >
            <Image
              src="/logo-sm.webp"
              alt="Solar Ireland Group"
              className="h-11 w-auto sm:h-12 xl:h-14"
              width={44}
              height={50}
              // Eager at low priority, not `priority` (13 Nov 2026). Its head
              // preload sat ahead of the hero image's (the LCP); React also
              // auto-preloads any eager <img> unless fetchPriority is "low".
              // The <img> is at the top of the HTML, so it still loads at once.
              loading="eager"
              fetchPriority="low"
            />
            {/* The header logo text is "Solar Ireland Group" (Cal, 11 Nov 2026:
                "i actually like solar ireland group", then "just the header").
                The rest of the site's visible brand stays "Solar Ireland". It
                is six letters longer: at lg the text stays text-lg and the
                gaps stay tight so the CTA still fits at 1024. */}
            <span className="font-bold text-white hidden sm:inline text-lg xl:text-2xl tracking-wide">
              Solar Ireland Group
            </span>
          </button>

          {/* Desktop nav - 7 links */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-8">
            {desktopNavLinks.map((link) => {
              // Every desktop link is a page, so the active state is the path.
              // (Section anchors are the phone menu's, see NavbarMobileMenu.)
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <button
                  key={link.label}
                  onClick={() => navigateTo(link.isBookSurvey ? savingsHref(pathname) : onPage(pathname, link.href))}
                  className={`text-xs font-medium uppercase tracking-wider transition-colors relative py-1 whitespace-nowrap ${
                    link.isBookSurvey
                      ? 'text-green-400 font-semibold'
                      : link.href === '/portal'
                      ? 'text-sky-400 font-semibold'
                      : isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && !link.isBookSurvey && link.href !== '/portal' && (
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-amber-400 transition-all duration-300" />
                  )}
                  {link.isBookSurvey && (
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-green-400/60 transition-all duration-300" />
                  )}
                  {link.href === '/portal' && (
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-sky-400/60 transition-all duration-300" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop CTA buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* The row needs ~1100px but the desktop nav starts at 1024, which
                clipped the survey CTA. The secondary CTA waits for xl. */}
            <button
              onClick={() => navigateTo(savingsHref(pathname))}
              className="bg-green-400 hover:bg-green-300 text-black font-bold text-xs px-5 py-2 xl:py-2.5 rounded-full uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-green-400/10 hover:shadow-green-400/20 whitespace-nowrap"
            >
              Check my savings
            </button>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => {
              loadMenu();
              setIsOpen(!isOpen);
            }}
            onPointerEnter={loadMenu}
            onTouchStart={loadMenu}
            onFocus={loadMenu}
            className="lg:hidden w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center text-white hover:bg-white/[0.08] transition-colors active:scale-90"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <HamburgerIcon isOpen={isOpen} />
          </button>
        </div>
      </nav>

      {MobileMenu && (
        <MobileMenu isOpen={isOpen && armed} onClose={() => setIsOpen(false)} pathname={pathname} />
      )}
    </>
  );
}
