'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Why Solar', href: '#why-solar' },
  { label: 'Grant Info', href: '#grant-info' },
  { label: 'Bill Analyser', href: '#calculator' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollTo = (href: string) => {
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-lg border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2"
        >
          <img src="/logo-sm.png" alt="Solar Ireland" className="h-9 w-auto" />
          <span className="font-bold text-white hidden sm:inline">Solar Ireland</span>
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Button
            size="sm"
            className="bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg"
            onClick={() => scrollTo('#calculator')}
          >
            Analyse My Bill
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white p-2"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-white/[0.06] px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="block w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-white/[0.06]">
            <Button
              size="sm"
              className="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg"
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
