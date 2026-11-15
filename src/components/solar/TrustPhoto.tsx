'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const PHOTO = {
  src: '/installs/in-roof-solar-slate.webp',
  alt: 'Black in-roof solar panels set into a slate roof, one of our installs',
  sizes:
    '(min-width: 1536px) 520px, (min-width: 1280px) 480px, (min-width: 768px) 42vw, (min-width: 640px) calc(100vw - 64px), calc(100vw - 48px)',
};

/**
 * The trust plate's install photo (homepage). Native lazy loading starts
 * this one during the hero's load on a phone: the section sits about 1,270px
 * down, inside Chrome's lazy distance, so the photo competed with the hero
 * for bandwidth and mobile Lighthouse dropped a point. It now mounts when it
 * is 600px from the viewport (still lazy, still next/image, AVIF/WebP), so it
 * is there before anyone scrolls to it and never races the hero.
 *
 * The figure's box is sized by CSS whether or not the photo has mounted, so
 * nothing shifts. Without JS the noscript copy shows the photo.
 */
export default function TrustPhoto() {
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: '600px 0px 600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={ref} className="ht-photo">
      {near ? (
        <Image src={PHOTO.src} alt={PHOTO.alt} fill sizes={PHOTO.sizes} className="ht-photo__img" />
      ) : (
        <noscript>
          <Image src={PHOTO.src} alt={PHOTO.alt} fill sizes={PHOTO.sizes} className="ht-photo__img" />
        </noscript>
      )}
    </figure>
  );
}
