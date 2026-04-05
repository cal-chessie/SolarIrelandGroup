/* ═══════════════════════════════════════════════════════════════
   DYNAMIC SITEMAP.XML — Next.js App Router
   ═══════════════════════════════════════════════════════════════
   Google requires:
   - <lastmod> for every URL
   - <changefreq> hints
   - <priority> values (1.0 = homepage, 0.8 = key pages)
   - Proper XML namespace for images
   - Maximum 50,000 URLs per sitemap
   ═══════════════════════════════════════════════════════════════ */

import type { MetadataRoute } from "next";

const SITE_URL = "https://solarireland.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  /* ─── Static Pages ─── */
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/#how-it-works`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/#why-solar`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/#our-work`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/#grant-info`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/#calculator`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/#quick-calculator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/#faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  /* ─── Future Blog/Service Pages (scaffolded) ─── */
  const contentPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms-of-service`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/cookie-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  /* ─── Location Landing Pages (SEO gold for local search) ─── */
  const counties = [
    "Dublin", "Cork", "Galway", "Limerick", "Waterford", "Drogheda",
    "Dundalk", "Kilkenny", "Wexford", "Sligo", "Clare", "Tipperary",
    "Kildare", "Meath", "Louth", "Wicklow", "Kerry", "Mayo",
    "Roscommon", "Westmeath", "Laois", "Offaly", "Carlow", "Cavan",
    "Monaghan", "Donegal", "Longford", "Leitrim",
  ];

  const locationPages: MetadataRoute.Sitemap = counties.map((county) => ({
    url: `${SITE_URL}/solar-panels-${county.toLowerCase().replace(/\s+/g, "-")}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...contentPages, ...locationPages];
}
