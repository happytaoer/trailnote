import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'https://trailnote.co';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/map', '/docs', '/docs/*'],
        disallow: ['/api/*', '/settings', '/shared/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
