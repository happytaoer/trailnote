import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TrailNote Docs Center',
  description: "Explore TrailNote's features and learn how to get the most out of our application.",
  alternates: {
    canonical: (process.env.NEXT_PUBLIC_SITE_URL || 'https://trailnote.co') + '/docs',
  },
  openGraph: {
    title: 'TrailNote Docs Center',
    description: "Explore TrailNote's features and learn how to get the most out of our application.",
    url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://trailnote.co') + '/docs',
    type: 'website',
  },
};

interface DocsLayoutProps {
  readonly children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps): React.ReactNode {
  return children;
}
