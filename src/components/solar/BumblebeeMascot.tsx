'use client';

import Image from 'next/image';

interface BumblebeeMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  flipped?: boolean;
  className?: string;
  animate?: boolean;
}

const sizeMap = {
  sm: { src: '/bumblebee-sm.webp', w: 32, h: 32 },
  md: { src: '/bumblebee-md.webp', w: 96, h: 96 },
  lg: { src: '/bumblebee-hero.webp', w: 144, h: 144 },
  hero: { src: '/bumblebee-hero.webp', w: 224, h: 224 },
};

export default function BumblebeeMascot({
  size = 'md',
  flipped = false,
  className = '',
  animate = true,
}: BumblebeeMascotProps) {
  const config = sizeMap[size];
  const src = flipped ? '/bumblebee-flip.webp' : config.src;

  const sizeClass =
    size === 'hero'
      ? 'w-48 h-48 sm:w-56 sm:h-56'
      : size === 'lg'
        ? 'w-36 h-36'
        : size === 'md'
          ? 'w-24 h-24'
          : 'w-8 h-8';

  if (!animate) {
    return (
      <Image
        src={src}
        alt="Solar Ireland Bumblebee Mascot"
        width={config.w}
        height={config.h}
        className={`${sizeClass} ${className}`}
        style={{ imageRendering: 'auto' }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt="Solar Ireland Bumblebee Mascot"
      width={config.w}
      height={config.h}
      className={`bumblebee-float ${sizeClass} ${className}`}
      style={{ imageRendering: 'auto' }}
    />
  );
}
