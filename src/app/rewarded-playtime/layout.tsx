import type { Metadata } from 'next';

const BASE_URL = 'https://playbook.appsamurai.com';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: 'Rewarded Playtime Handbook | Engage, Retain, Monetize',
  description:
    'Rewarded playtime is reshaping how mobile games monetize. This handbook covers market trends, campaign setup, KPI benchmarks (ARPDAU, eCPM, retention), and offerwall best practices for casual and mid-core publishers. By AppSamurai.',
  alternates: {
    canonical: '/rewarded-playtime',
  },
  openGraph: {
    title: 'Rewarded Playtime in Mobile Gaming | AppSamurai Handbook',
    description:
      'The complete guide to rewarded playtime: market data, campaign strategy, KPIs, and best practices for mobile game publishers.',
    type: 'article',
    publishedTime: '2024-06-01T00:00:00Z',
    modifiedTime: '2026-04-09T00:00:00Z',
    authors: ['AppSamurai'],
    images: [
      {
        url: '/hero-bg.png',
        width: 1200,
        height: 630,
        alt: 'Rewarded Playtime in Mobile Gaming — AppSamurai Handbook',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rewarded Playtime Handbook | AppSamurai',
    description: 'The complete guide to rewarded playtime for mobile game publishers.',
    images: ['/hero-bg.png'],
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
  dateModified: '2026-04-09',
  description:
    'Complete handbook on rewarded playtime in mobile gaming covering market trends, campaign strategy, KPI measurement, and best practices.',
  image: `${BASE_URL}${basePath}/hero-bg.png`,
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}${basePath}/rewarded-playtime` },
  articleSection: ['Rewarded Playtime', 'Mobile Gaming', 'Campaign Strategy', 'KPIs'],
  keywords: 'rewarded playtime, offerwall ads, mobile game monetization, play to earn mobile games, rewarded ads mobile gaming, casual game user acquisition, in-app purchase optimization, player retention strategies, ARPDAU optimization, mobile game KPIs 2024',
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
