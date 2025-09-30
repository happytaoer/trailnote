import type { MetadataRoute } from 'next';
import { getDocs } from '@/content/docs';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'https://trailnote.co';
  const now: string = new Date().toISOString();

  const core: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/map`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/docs`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ];

  const docs = getDocs().map((d) => ({
    url: `${baseUrl}/docs/${d.slug}`,
    lastModified: d.publishDate || now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...core, ...docs];
}
