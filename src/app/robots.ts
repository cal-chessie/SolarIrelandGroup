
import type { MetadataRoute } from "next";

/**
 * robots.ts - deliberate crawler policy (no important bot left to the `*` fallback).
 *
 * Strategy for a lead-generation site pursuing AI-answer visibility (AEO):
 *  - ALLOW every traditional search engine and social link-preview fetcher.
 *  - ALLOW every AI assistant / answer-engine crawler, so the brand can be
 *    surfaced and cited in ChatGPT, Gemini, Claude, Perplexity, Apple
 *    Intelligence, Copilot (Bing), Amazon and Meta AI. Being crawled is the
 *    price of being cited.
 *  - BLOCK the bulk scrapers that take content for training with no attribution
 *    and send nothing back (CCBot, Bytespider).
 *  - `/api/` and `/admin/` are off-limits to everyone; `/portal/` is the
 *    customer login area and has no crawl value.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = "https://solarirelandgroup.ie";
  const disallow = ["/api/", "/admin/", "/portal/"];

  // Bots that get the standard "allow everything except private areas" rule.
  const allowed = [
    // ── Traditional search ──────────────────────────────────────────
    "Googlebot",
    "Bingbot", // also powers Microsoft Copilot
    "Slurp", // Yahoo
    "DuckDuckBot",
    "Baiduspider",
    "YandexBot",
    "Applebot", // Apple search: Siri / Spotlight / Safari suggestions
    // ── Social link previews ────────────────────────────────────────
    "Twitterbot",
    "facebookexternalhit",
    "LinkedInBot",
    "WhatsApp",
    "Slackbot-LinkExpanding",
    // ── AI assistants & answer engines (allow, to be cited) ─────────
    "GPTBot", // OpenAI
    "ChatGPT-User", // OpenAI, user-triggered fetch
    "OAI-SearchBot", // OpenAI search
    "Google-Extended", // Gemini / AI Overviews
    "anthropic-ai", // Anthropic (legacy)
    "ClaudeBot", // Anthropic crawler
    "Claude-User", // Anthropic, user-triggered fetch
    "Claude-SearchBot", // Anthropic search
    "PerplexityBot", // Perplexity crawler
    "Perplexity-User", // Perplexity, user-triggered fetch
    "Applebot-Extended", // Apple Intelligence
    "Amazonbot", // Alexa / Rufus
    "Meta-ExternalAgent", // Meta AI
    "cohere-ai", // Cohere
  ];

  // Bulk scrapers with no attribution / no referral value: blocked outright.
  const blocked = [
    "CCBot", // Common Crawl (feeds many training sets)
    "Bytespider", // ByteDance
  ];

  return {
    rules: [
      ...allowed.map((userAgent) => ({ userAgent, allow: "/", disallow })),
      ...blocked.map((userAgent) => ({ userAgent, disallow: "/" })),
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
