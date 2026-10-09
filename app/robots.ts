import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://fypmate.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/idea-validator", "/privacy", "/login", "/llms.txt", "/llms-full.txt"],
        disallow: ["/dashboard/", "/admin/", "/api/", "/_next/"],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "Google-Extended",
          "Applebot-Extended",
        ],
        allow: ["/", "/idea-validator", "/privacy", "/llms.txt", "/llms-full.txt"],
        disallow: ["/dashboard/", "/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
