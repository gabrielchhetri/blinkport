import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/help", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/tools", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/tools/json-formatter", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/tools/text-diff", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/tools/word-counter", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/guides", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/guides/share-code-between-devices", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/guides/send-a-file-to-another-device", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/guides/temporary-sharing-and-privacy", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.5, changeFrequency: "yearly" as const },
  ];

  return entries.map((entry) => ({
    url: `${siteUrl}${entry.path}`,
    lastModified: new Date(),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
