
import type { MetadataRoute } from "next";
import { getAllArticleSlugs } from "@/lib/blog-data";

const SITE_URL = "https://solarirelandgroup.ie";

/* Per-page lastModified dates — update these when you edit a page.
   Google uses these to prioritise crawl frequency. */
const PAGE_DATES: Record<string, string> = {
  "/": "2026-04-08T00:00:00+00:00",
  "/services": "2026-04-01T00:00:00+00:00",
  "/counties": "2026-04-01T00:00:00+00:00",
  "/blog": "2026-04-08T00:00:00+00:00",
  "/about": "2026-03-15T00:00:00+00:00",
  "/contact": "2026-03-15T00:00:00+00:00",
  "/privacy": "2026-02-01T00:00:00+00:00",
  "/terms": "2026-04-01T00:00:00+00:00",
  "/cookies": "2026-04-01T00:00:00+00:00",
  "/solar-calculator": "2026-04-09T00:00:00+00:00",
  "/book-survey": "2026-04-09T00:00:00+00:00",
  "/financing": "2026-04-09T00:00:00+00:00",
};

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  return [
    {
      url: SITE_URL,
      lastModified: PAGE_DATES["/"],
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/services`,
      lastModified: PAGE_DATES["/services"],
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/counties`,
      lastModified: PAGE_DATES["/counties"],
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: PAGE_DATES["/blog"],
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: PAGE_DATES["/about"],
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: PAGE_DATES["/contact"],
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: PAGE_DATES["/privacy"],
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: PAGE_DATES["/terms"],
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/cookies`,
      lastModified: PAGE_DATES["/cookies"],
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/solar-calculator`,
      lastModified: PAGE_DATES["/solar-calculator"],
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/book-survey`,
      lastModified: PAGE_DATES["/book-survey"],
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/financing`,
      lastModified: PAGE_DATES["/financing"],
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...getAllArticleSlugs().map((slug) => ({
      url: `${SITE_URL}/blog/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
