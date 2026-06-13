import type { Metadata } from 'next';

const BASE_URL = 'https://playbook.appsamurai.com';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: 'Rewarded Playtime Handbook 2025 | Global Mobile Gaming Monetization',
  description:
    'The definitive 2025 handbook on rewarded playtime: the dual-value model, genre-by-genre monetization, a regional landscape across the US, South Korea, Japan, Brazil & Europe, KPI benchmarks (ARPDAU, eCPM, retention), and offerwall campaign strategy. By AppSamurai.',
  alternates: {
    canonical: '/rewarded-playtime',
  },
  openGraph: {
    title: 'Rewarded Playtime Handbook 2025 | AppSamurai',
    description:
      'The complete guide to rewarded playtime: the dual-value model, genre dynamics, regional monetization data across five markets, campaign strategy, and KPIs for mobile game publishers.',
    type: 'article',
    publishedTime: '2024-06-01T00:00:00Z',
    modifiedTime: '2026-06-03T00:00:00Z',
    authors: ['AppSamurai'],
    images: [
      {
        url: '/rewarded-playtime-og.png',
        width: 1200,
        height: 600,
        alt: 'Rewarded Playtime in Mobile Gaming: AppSamurai Handbook',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rewarded Playtime Handbook | AppSamurai',
    description: 'The complete guide to rewarded playtime for mobile game publishers.',
    images: ['/rewarded-playtime-og.png'],
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Rewarded Playtime in Mobile Gaming: Engage, Retain, Monetize',
  author: { '@type': 'Organization', name: 'AppSamurai', url: 'https://appsamurai.com' },
  publisher: {
    '@type': 'Organization',
    name: 'AppSamurai',
    url: 'https://appsamurai.com',
    logo: { '@type': 'ImageObject', url: 'https://appsamurai.com/logo.png' },
  },
  datePublished: '2024-06-01',
  dateModified: '2026-06-03',
  description:
    'Complete 2025 handbook on rewarded playtime in mobile gaming: the dual-value model, genre-specific monetization, regional landscape across the US, South Korea, Japan, Brazil and Europe, campaign strategy, and KPI measurement.',
  image: `${BASE_URL}${basePath}/rewarded-playtime-og.png`,
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}${basePath}/rewarded-playtime` },
  articleSection: ['Rewarded Playtime', 'Mobile Gaming', 'Regional Monetization', 'Campaign Strategy', 'KPIs'],
  keywords: 'rewarded playtime, offerwall ads, mobile game monetization 2025, play to earn mobile games, rewarded ads mobile gaming, casual game user acquisition, hybrid-casual monetization, in-app purchase optimization, player retention strategies, ARPDAU optimization, mobile game KPIs, South Korea mobile gaming, Japan mobile gaming RPG, Brazil mobile ad monetization, Europe mobile IAP',
};

export default function RewardedPlaytimeLayout({
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
