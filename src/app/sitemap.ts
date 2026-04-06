/* ═══════════════════════════════════════════════════════════════
   DYNAMIC SITEMAP.XML — Next.js App Router
   ═══════════════════════════════════════════════════════════════
   Only lists pages that actually exist.
   Google penalises sitemaps with non-existent URLs (soft 404s).
   ═══════════════════════════════════════════════════════════════ */

import type { MetadataRoute } from "next";
import { getAllArticleSlugs } from "@/lib/blog-data";

const SITE_URL = "https://solarireland.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  return [
    /* ─── Main pages ─── */
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/services`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/counties`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    /* ─── Homepage sections (hash fragments, lower priority) ─── */
    {
      url: `${SITE_URL}/#calculator`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/#faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    /* ─── Blog articles ─── */
    ...getAllArticleSlugs().map((slug) => ({
      url: `${SITE_URL}/blog/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
