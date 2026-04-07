/* ═══════════════════════════════════════════════════════════════
   WEB APP MANIFEST — PWA Support + SEO Signals
   ═══════════════════════════════════════════════════════════════ */

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Solar Ireland | Solar Panel Installation",
    short_name: "Solar Ireland",
    description:
      "SEAI-registered solar panel installers. Free AI-powered electricity bill analysis. Save up to €1,100/year with a €1,800 SEAI grant.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#FACC15",
    orientation: "portrait-primary",
    scope: "/",
    lang: "en-IE",
    dir: "ltr",
    categories: ["home improvement", "energy", "sustainability"],
    icons: [
      {
        src: "/logo-favicon.png",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/bumblebee-favicon.png",
        sizes: "16x16",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo-lg.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable" as any,
      },
    ],
  };
}
