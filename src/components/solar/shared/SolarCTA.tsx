'use client';

import { ArrowRight, Zap, MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

/* ═══════════════════════════════════════════════════════
   SOLAR CTA — Reusable CTA button used across sections
   ═══════════════════════════════════════════════════════ */

interface SolarCTAProps {
  variant?: 'primary' | 'secondary' | 'outline';
  label?: string;
  icon?: 'zap' | 'message' | 'arrow';
  href?: string;
  whatsappContext?: Record<string, unknown>;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SolarCTA({
  variant = 'primary',
  label,
  icon = 'zap',
  href,
  whatsappContext,
  onClick,
  className = '',
  size = 'md',
}: SolarCTAProps) {
  const IconComponent = icon === 'zap' ? Zap : icon === 'message' ? MessageCircle : ArrowRight;

  // Determine the href
  let finalHref = href;
  let isExternal = false;

  if (!finalHref && variant === 'secondary' && whatsappContext) {
    finalHref = buildWhatsAppUrl(whatsappContext as Parameters<typeof buildWhatsAppUrl>[0]);
    isExternal = true;
  } else if (!finalHref && variant === 'secondary') {
    finalHref = buildWhatsAppUrl({ source: 'generic' });
    isExternal = true;
  } else if (!finalHref && variant === 'primary') {
    finalHref = '#calculator';
  }

  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-7 py-3.5 text-sm',
  };

  // Variant styles
  if (variant === 'primary') {
    return (
      <a
        href={finalHref}
        onClick={onClick}
        className={`hero-cta-shimmer inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold tracking-wide shadow-xl shadow-amber-400/20 relative overflow-hidden group ${sizeClasses[size]} ${className}`}
      >
        <span className="relative z-10 flex items-center gap-2.5">
          <IconComponent className="w-4 h-4" />
          {label || 'Analyse My Bill — Free'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </a>
    );
  }

  if (variant === 'secondary') {
    return (
      <a
        href={finalHref}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        onClick={onClick}
        className={`inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-black/30 text-white tracking-wide hover:bg-white/[0.08] hover:border-white/30 transition-all duration-300 ${sizeClasses[size]} ${className}`}
      >
        {icon === 'message' ? (
          <MessageCircle className="w-4 h-4 text-green-400" />
        ) : (
          <IconComponent className="w-4 h-4" />
        )}
        {label || 'WhatsApp Us'}
      </a>
    );
  }

  // outline variant
  return (
    <a
      href={finalHref}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors whitespace-nowrap ${sizeClasses[size]} ${className}`}
    >
      <IconComponent className="w-4 h-4" />
      {label || 'Learn More'}
    </a>
  );
}
