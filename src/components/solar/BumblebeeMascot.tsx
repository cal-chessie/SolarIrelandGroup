'use client';

interface BumblebeeMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  flipped?: boolean;
  className?: '';
  animate?: boolean;
}

const sizeMap = {
  sm: { src: '/bumblebee-sm.png', className: 'w-8 h-8' },
  md: { src: '/bumblebee-md.png', className: 'w-24 h-24' },
  lg: { src: '/bumblebee-hero.png', className: 'w-36 h-36' },
  hero: { src: '/bumblebee-hero.png', className: 'w-48 h-48 sm:w-56 sm:h-56' },
};

export default function BumblebeeMascot({
  size = 'md',
  flipped = false,
  className = '',
  animate = true,
}: BumblebeeMascotProps) {
  const config = sizeMap[size];
  const src = flipped ? '/bumblebee-flip.png' : config.src;

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
      <img
        src={src}
        alt="Solar Ireland Bumblebee Mascot"
        className={`${sizeClass} ${className}`}
        style={{ imageRendering: 'auto' }}
      />
    );
  }

  return (
    <img
      src={src}
      alt="Solar Ireland Bumblebee Mascot"
      className={`bumblebee-float ${sizeClass} ${className}`}
      style={{ imageRendering: 'auto' }}
    />
  );
}
