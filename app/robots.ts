import type { MetadataRoute } from 'next';

const BASE = 'https://hep-quickwrite.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
