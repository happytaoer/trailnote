import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDocBySlug, getDocs, Doc } from '@/content/docs';


export async function generateStaticParams() {
  return getDocs().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: {
  readonly params: Promise<{ readonly slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const doc: Doc | undefined = getDocBySlug(resolvedParams.slug);
  if (!doc) return {};
  const baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'https://trailnote.co';
  const url: string = `${baseUrl}/docs/${doc.slug}`;
  return {
    title: `${doc.title} | TrailNote Docs`,
    description: doc.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${doc.title} | TrailNote Docs`,
      description: doc.description,
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${doc.title} | TrailNote Docs`,
      description: doc.description,
    },
  };
}

function renderJsonLd(doc: Doc): string {
  const baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'https://trailnote.co';
  const url: string = `${baseUrl}/docs/${doc.slug}`;
  const isHowTo: boolean = doc.type === 'howto';
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': isHowTo ? 'HowTo' : 'Article',
    headline: doc.title,
    description: doc.description,
    datePublished: doc.publishDate,
    mainEntityOfPage: url,
  } as const;
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${baseUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Docs',
        item: `${baseUrl}/docs`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: doc.title,
        item: url,
      },
    ],
  } as const;
  return JSON.stringify([articleLd, breadcrumbLd]);
}

export default async function DocDetailPage({ params }: {
  readonly params: Promise<{ readonly slug: string }>;
}): Promise<React.ReactNode> {
  const resolvedParams = await params;
  const doc: Doc | undefined = getDocBySlug(resolvedParams.slug);
  if (!doc) return notFound();
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/docs" className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-700">
          <span aria-hidden className="mr-2">←</span>
          <span>Back to Docs</span>
        </Link>
        <article className="bg-white shadow-sm rounded-lg p-6">
          <header className="mb-6">
            <h1 className="text-3xl font-semibold mb-2">{doc.title}</h1>
            <p className="text-gray-500">Published on {doc.publishDate}</p>
          </header>
          <section className="prose max-w-none">
            {doc.content.split('\n\n').map((block, idx) => (
              <p key={idx}>{block}</p>
            ))}
          </section>
          <footer className="mt-8 flex gap-3">
            <Link href="/map" className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
              Try on Map
            </Link>
            <Link href="/" className="inline-flex items-center px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-50">
              Back to Home
            </Link>
          </footer>
        </article>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLd(doc) }}
      />
    </div>
  );
}
