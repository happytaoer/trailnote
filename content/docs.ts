export interface Doc {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly publishDate: string; // ISO date string
  readonly content: string; // markdown or HTML snippet
  readonly type?: 'article' | 'howto';
}

const docs: readonly Doc[] = [
  {
    id: '1',
    slug: 'freehand-drawing',
    title: 'Freehand Drawing: Create Routes with Your Finger',
    description:
      "Learn how to use the freehand drawing feature to create custom routes directly on the map. We'll also show distance calculation and style presets (color, width, opacity).",
    publishDate: '2025-09-20',
    content:
      '# Freehand Drawing\n\nFollow these steps to draw routes on the map freely and save them as trail routes.\n\n1. Click the Freehand Draw button.\n2. Drag on the map to sketch your route.\n3. Release to auto-calculate distance and save.\n4. Customize color, width, and opacity in Settings.',
    type: 'howto',
  },
  {
    id: '2',
    slug: 'story',
    title: 'Our Story: The Birth of TrailNote',
    description:
      'A story about dreams, travel, and code, detailing how TrailNote went from an idea to reality.',
    publishDate: '2025-02-01',
    content:
      '# The Birth of TrailNote\n\nWe wanted a simpler way to mark places, draw routes, and share them with friends... and TrailNote was born.',
    type: 'article',
  },
] as const;

export function getDocs(): readonly Doc[] {
  return docs;
}

export function getDocBySlug(slug: string): Doc | undefined {
  return docs.find((d) => d.slug === slug);
}
