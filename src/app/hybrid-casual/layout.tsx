import type { Metadata } from 'next';

const BASE_URL = 'https://playbook.appsamurai.com';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: 'The Rise of Hybrid-Casual Games | AppSamurai Ebook',
  description:
    'Why hybrid-casual games emerged, how they combine casual accessibility with mid-core depth, and what marketing strategies drive growth in this fast-growing segment. By AppSamurai.',
  alternates: {
    canonical: '/hybrid-casual',
  },
  openGraph: {
    title: 'The Rise of Hybrid-Casual Games | AppSamurai',
    description:
      'The complete guide to hybrid-casual games: market data, game design, monetization, and marketing strategies for mobile game publishers.',
    type: 'article',
    publishedTime: '2024-01-01T00:00:00Z',
    modifiedTime: '2026-04-09T00:00:00Z',
    authors: ['AppSamurai'],
    images: [
      {
        url: '/hero-bg.png',
        width: 1200,
        height: 630,
        alt: 'The Rise of Hybrid-Casual Games — AppSamurai Ebook',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Rise of Hybrid-Casual Games | AppSamurai',
    description: 'The complete guide to hybrid-casual games for mobile publishers.',
    images: ['/hero-bg.png'],
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'The Rise of Hybrid-Casual Games',
  author: { '@type': 'Organization', name: 'AppSamurai', url: 'https://appsamurai.com' },
  publisher: {
    '@type': 'Organization',
    name: 'AppSamurai',
    url: 'https://appsamurai.com',
    logo: { '@type': 'ImageObject', url: 'https://appsamurai.com/logo.png' },
  },
  datePublished: '2024-01-01',
  dateModified: '2026-04-09',
  description: 'Comprehensive guide to hybrid-casual games covering market trends, game design, monetization models, and marketing strategies.',
  image: `${BASE_URL}${basePath}/hero-bg.png`,
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}${basePath}/hybrid-casual` },
  articleSection: ['Hybrid-Casual Games', 'Mobile Gaming', 'Monetization', 'User Acquisition'],
  keywords: 'hybrid-casual games, mobile gaming, monetization, user acquisition, casual games, mid-core games, ATT, retention',
};

export default function HybridCasualLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}
