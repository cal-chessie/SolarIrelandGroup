'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Why Solar', href: '#why-solar' },
  { label: 'Our Work', href: '#our-work' },
  { label: 'Bill Analyser', href: '#calculator' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setIsOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-black/85 backdrop-blur-xl border-b border-white/[0.05]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5"
        >
          <img src="/logo-sm.png" alt="Solar Ireland" className="h-8 w-auto" />
          <span className="font-bold text-white hidden sm:inline text-sm tracking-wide">
            Solar Ireland
          </span>
        </button>

        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-xs font-medium text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden md:block">
          <Button
            size="sm"
            className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs px-5 py-2 rounded-full uppercase tracking-wider"
            onClick={() => scrollTo('#calculator')}
          >
            Analyse Bill
          </Button>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white p-2"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/[0.05] px-5 py-5 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-4 mt-2 border-t border-white/[0.05]">
            <Button
              size="sm"
              className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs py-2.5 rounded-full uppercase tracking-wider"
              onClick={() => scrollTo('#calculator')}
            >
              Analyse My Bill
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
