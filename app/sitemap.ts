import type { MetadataRoute } from 'next';

const BASE = 'https://hep-quickwrite.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/historie`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE}/changelog`, lastModified: now, changeFrequency: 'weekly', priority: 0.4 },
    { url: `${BASE}/datenschutz`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/agb`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
