'use client';

/**
 * "Your bill, your number": the Bill Analyser's two doors inside a post, so a
 * reader can act where the question is answered (docs/content-standard.md 5.6).
 * The one metric for the blog is Bill Analyser starts per post.
 *
 * Both actions are real links, server-rendered, so they work without
 * JavaScript and in a new tab:
 *   - Upload my bill    -> /solar-calculator#calculator, the analyser itself
 *   - Type my bill amount -> /estimate (the intake), opened as the layer on a
 *     plain click
 * A click records the post (src/lib/postOrigin.ts) so the lead sent later
 * carries the post slug and path in AISolar's existing meta.src / meta.page.
 * Seen and clicked events go through the consent-gated analytics layer.
 */
import './post-bill-box.css';
import { useEffect, useRef, type RefObject } from 'react';
import { Upload, Keyboard, ChevronRight } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { intakeHref, openIntake, type IntakeOpenOptions } from '@/lib/intake/open';
import { recordPostOrigin, type PostPlacement } from '@/lib/postOrigin';

export type PostCtaAction = 'upload' | 'type' | 'analyser';

export function trackPostCta(kind: 'view' | 'click', slug: string, placement: PostPlacement, action?: PostCtaAction): void {
  trackEvent({
    event: kind === 'view' ? 'blog_cta_view' : 'blog_cta_click',
    properties: {
      post_slug: slug,
      placement,
      ...(action ? { action } : {}),
      // GA4 sends on a beacon, so a click that leaves the page still lands.
      ...(kind === 'click' ? { transport_type: 'beacon' } : {}),
    },
  });
}

/** Fire `blog_cta_view` once, when half the box has been on screen. */
export function useSeenOnce(ref: RefObject<HTMLElement | null>, slug: string, placement: PostPlacement): void {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          trackPostCta('view', slug, placement);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, slug, placement]);
}

export const uploadHref = (slug: string) => `/solar-calculator?src=${encodeURIComponent(slug)}#calculator`;
export const typeOpts = (slug: string): IntakeOpenOptions => ({ door: 'blog-inpost', segment: 'home', step: 'bill', src: slug });

const plainClick = (e: React.MouseEvent) => !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0);

export default function PostBillBox({ slug }: { slug: string }) {
  const ref = useRef<HTMLElement>(null);
  useSeenOnce(ref, slug, 'in-post');
  const titleId = `si-postbox-${slug}`;
  const typeHref = intakeHref(typeOpts(slug));

  return (
    <aside ref={ref} className="si-postbox" aria-labelledby={titleId} data-post-bill-box="">
      <p className="si-postbox__kicker">Bill Analyser</p>
      <p className="si-postbox__title" id={titleId}>
        Your bill, your number
      </p>
      <p className="si-postbox__line">Your own saving, system size and payback, worked out from your bill in under a minute.</p>
      <div className="si-postbox__roads" role="group" aria-label="Two ways to see your figures">
        <a
          className="si-postbox__road si-postbox__road--primary"
          href={uploadHref(slug)}
          data-action="upload"
          onClick={() => {
            recordPostOrigin(slug, 'in-post');
            trackPostCta('click', slug, 'in-post', 'upload');
          }}
        >
          <span className="si-postbox__icon" aria-hidden="true">
            <Upload size={20} />
          </span>
          <span className="si-postbox__text">
            <span className="si-postbox__road-title">Upload my bill</span>
            <span className="si-postbox__road-line">Photo or PDF</span>
          </span>
          <ChevronRight className="si-postbox__chev" size={16} aria-hidden="true" />
        </a>
        <a
          className="si-postbox__road"
          href={typeHref}
          data-action="type"
          onClick={(e) => {
            recordPostOrigin(slug, 'in-post');
            trackPostCta('click', slug, 'in-post', 'type');
            if (!plainClick(e)) return;
            e.preventDefault();
            openIntake(typeOpts(slug));
          }}
        >
          <span className="si-postbox__icon" aria-hidden="true">
            <Keyboard size={20} />
          </span>
          <span className="si-postbox__text">
            <span className="si-postbox__road-title">Type my bill amount</span>
            <span className="si-postbox__road-line">No bill to hand? Three questions.</span>
          </span>
          <ChevronRight className="si-postbox__chev" size={16} aria-hidden="true" />
        </a>
      </div>
    </aside>
  );
}

/**
 * Where the box goes: at the end of the first H2 section, that is just before
 * the second H2. When a post has no second H2, or it falls past 60% of the
 * post, before the heading nearest a third of the way down; with no headings
 * at all, after the paragraph at a third. Never index 0, so the opening and
 * the answer box above it stay clean. Returns the content index to insert
 * BEFORE.
 */
export function postBillBoxIndex(content: { type: string; level?: number }[]): number {
  const n = content.length;
  if (n < 3) return n;
  const h2 = content.flatMap((s, i) => (s.type === 'heading' && s.level === 2 ? [i] : []));
  if (h2.length >= 2 && h2[1] <= n * 0.6) return h2[1];
  const third = Math.round(n / 3);
  const heads = content.flatMap((s, i) => (s.type === 'heading' && i > 0 ? [i] : []));
  if (heads.length) return heads.reduce((best, i) => (Math.abs(i - third) < Math.abs(best - third) ? i : best));
  return Math.max(1, third);
}
