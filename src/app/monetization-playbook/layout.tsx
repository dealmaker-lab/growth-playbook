import type { Metadata } from 'next';

const BASE_URL = 'https://playbook.appsamurai.com';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: 'Monetization Playbook for Casual & Hybrid Casual Games',
  description:
    'The 2025–2026 field guide to monetizing casual and hybrid casual mobile games: in-app advertising, IAP strategy, subscriptions, battle passes, LiveOps calendars, direct-to-consumer web stores, retention benchmarks, and rewarded UA. By AppSamurai for Games.',
  alternates: {
    canonical: '/monetization-playbook',
  },
  openGraph: {
    title: 'Monetization Playbook for Casual & Hybrid Casual Games | AppSamurai',
    description:
      'Revenue strategy, LiveOps, ad models, IAP, and emerging channels: the complete 2025–2026 monetization playbook for casual and hybrid casual game teams.',
    type: 'article',
    publishedTime: '2026-06-12T00:00:00Z',
    modifiedTime: '2026-06-12T00:00:00Z',
    authors: ['AppSamurai'],
    images: [
      {
        url: '/hero-bg.png',
        width: 1200,
        height: 630,
        alt: 'Monetization Playbook for Casual & Hybrid Casual Games by AppSamurai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monetization Playbook for Casual & Hybrid Casual Games',
    description: 'The 2025–2026 monetization field guide for casual and hybrid casual game teams. By AppSamurai.',
    images: ['/hero-bg.png'],
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Monetization Playbook for Casual & Hybrid Casual Games',
  author: { '@type': 'Organization', name: 'AppSamurai', url: 'https://appsamurai.com' },
  publisher: {
    '@type': 'Organization',
    name: 'AppSamurai',
    url: 'https://appsamurai.com',
    logo: { '@type': 'ImageObject', url: 'https://appsamurai.com/logo.png' },
  },
  datePublished: '2026-06-12',
  dateModified: '2026-06-12',
  description:
    'A 2025–2026 field guide to revenue strategy for casual and hybrid casual mobile games: the monetization stack (IAA, IAP, subscriptions, battle passes), LiveOps, direct-to-consumer web stores, retention frameworks, rewarded user acquisition, and success benchmarks.',
  image: `${BASE_URL}${basePath}/hero-bg.png`,
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}${basePath}/monetization-playbook` },
  articleSection: ['Monetization', 'LiveOps', 'In-App Purchases', 'Direct-to-Consumer', 'Retention', 'User Acquisition'],
  keywords: 'mobile game monetization playbook, hybrid casual monetization, casual game revenue strategy, in-app purchase optimization, LiveOps calendar, battle pass design, mobile game subscriptions, direct to consumer web store games, DTC mobile gaming, rewarded playtime campaigns, rewarded engagement, mobile game retention benchmarks, ARPDAU LTV ROAS benchmarks, hybrid monetization 2025 2026',
};

export default function MonetizationPlaybookLayout({
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
