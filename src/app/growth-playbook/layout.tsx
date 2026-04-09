import type { Metadata } from 'next';

const BASE_URL = 'https://playbook.appsamurai.com';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: 'AppSamurai 2026 Mobile Growth Strategy Guide | DSP, Rewarded, OEM & ASA',
  description:
    'The definitive 2026 strategy guide for mobile user acquisition: Programmatic DSP, Rewarded Playtime, OEM Discovery, and Apple Search Ads. Data-backed frameworks, ROI calculator, and practical playbooks for growth teams.',
  alternates: {
    canonical: '/growth-playbook',
  },
  openGraph: {
    title: 'AppSamurai 2026 Mobile Growth Strategy Guide',
    description:
      'The definitive strategy guide for Rewarded Playtime, Programmatic DSP, OEM Discovery, and Apple Search Ads — built for growth teams who need to scale smarter in 2026.',
    type: 'article',
    publishedTime: '2026-01-15T00:00:00Z',
    modifiedTime: '2026-03-28T00:00:00Z',
    authors: ['AppSamurai'],
    images: [
      {
        url: '/hero-bg.png',
        width: 1200,
        height: 630,
        alt: 'AppSamurai 2026 Mobile Growth Strategy Guide — DSP, Rewarded, OEM, ASA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AppSamurai 2026 Mobile Growth Strategy Guide',
    description:
      'The definitive playbook for Rewarded Playtime, Programmatic DSP, OEM Discovery, and Apple Search Ads.',
    images: ['/hero-bg.png'],
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'TechArticle',
      headline: 'AppSamurai 2026 Mobile Growth Strategy Guide: DSP, Rewarded, OEM & ASA',
      author: { '@type': 'Organization', name: 'AppSamurai', url: 'https://appsamurai.com' },
      publisher: {
        '@type': 'Organization',
        name: 'AppSamurai',
        url: 'https://appsamurai.com',
        logo: { '@type': 'ImageObject', url: 'https://appsamurai.com/logo.png' },
      },
      datePublished: '2026-01-15',
      dateModified: '2026-03-28',
      description:
        'The definitive 2026 strategy guide for mobile user acquisition covering Programmatic DSP, Rewarded Playtime, OEM Discovery, and Apple Search Ads with data-backed frameworks and an interactive ROI calculator.',
      image: `${BASE_URL}${basePath}/hero-bg.png`,
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}${basePath}/growth-playbook` },
      articleSection: ['Programmatic DSP', 'Rewarded Playtime', 'OEM Discovery', 'Apple Search Ads'],
      keywords: 'mobile user acquisition, programmatic DSP, rewarded playtime, OEM advertising, apple search ads, ASO, mobile growth strategy 2026',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [],
    },
  ],
};

export default function GrowthPlaybookLayout({
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
