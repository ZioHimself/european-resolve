import type { MetadataRoute } from "next";

const BASE_URL = "https://european-resolve.org";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: new Date(), priority: 1.0 },
    {
      url: `${BASE_URL}/events/2026-run-for-ukraine`,
      lastModified: new Date(),
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/events/2026-run-for-ukraine/register`,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/events/2026-run-for-ukraine/fundraise`,
      priority: 0.8,
    },
    { url: `${BASE_URL}/privacy`, priority: 0.2 },
  ];
}
