/**
 * Which blog post sent this visitor to the Bill Analyser.
 *
 * A post's bill box (in the post, or the bottom call to action) records the
 * post here when it is clicked. The lead the visitor later sends carries it
 * in AISolar's existing `meta.src` (the post slug) and `meta.page` (the post
 * path), which ingest-lead v2 already reads and stores (200 chars each), so
 * Cal can see which post produced a lead without any change to the contract.
 *
 * This tab's sessionStorage only, so it survives the hop from the post to
 * /solar-calculator or /estimate and nothing else. No personal data: a slug
 * and a path. Older than two hours is ignored.
 */
export const POST_ORIGIN_KEY = 'si-post-origin-v1';
const MAX_AGE_MS = 2 * 60 * 60_000;

export type PostPlacement = 'in-post' | 'bottom';

export interface PostOrigin {
  v: 1;
  /** The post slug. */
  src: string;
  /** The post's path, the landing page the lead came from. */
  page: string;
  placement: PostPlacement;
  at: number;
}

const SLUG = /^[a-z0-9-]{1,120}$/;

export function recordPostOrigin(slug: string, placement: PostPlacement): void {
  if (typeof window === 'undefined' || !SLUG.test(slug)) return;
  const o: PostOrigin = { v: 1, src: slug, page: `/blog/${slug}`, placement, at: Date.now() };
  try {
    sessionStorage.setItem(POST_ORIGIN_KEY, JSON.stringify(o));
  } catch {
    /* storage blocked: the lead still goes, without the post */
  }
}

export function readPostOrigin(now: number = Date.now()): PostOrigin | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(POST_ORIGIN_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as PostOrigin;
    if (!o || o.v !== 1 || typeof o.src !== 'string' || !SLUG.test(o.src)) return null;
    if (typeof o.at !== 'number' || now - o.at > MAX_AGE_MS) return null;
    return o;
  } catch {
    return null;
  }
}

/**
 * The attribution a lead sends. A door's own `src` wins, except the blog's
 * category tags (`blog-savings`, `blog-grants` ... on the bottom call to
 * action's link), which the post slug replaces: the slug says more. `page` is
 * the post when a post sent them, else the page the lead was sent from.
 */
export function leadAttribution(ctxSrc: string | null, currentPath: string): { src: string | null; page: string } {
  const o = readPostOrigin();
  const generic = !ctxSrc || /^blog-/.test(ctxSrc);
  return { src: o && generic ? o.src : ctxSrc, page: o?.page ?? currentPath };
}
