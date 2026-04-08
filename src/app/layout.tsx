import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import Script from 'next/script';
import '@/styles/globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const BASE_URL = 'https://playbook.appsamurai.com';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  metadataBase: new URL(`${BASE_URL}${basePath}`),
  title: 'AppSamurai 2026 Mobile Growth Strategy Guide | DSP, Rewarded, OEM & ASA',
  icons: { icon: '/favicon.ico' },
  description:
    'The definitive 2026 strategy guide for mobile user acquisition: Programmatic DSP, Rewarded Playtime, OEM Discovery, and Apple Search Ads. Data-backed frameworks, ROI calculator, and practical playbooks for growth teams.',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
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
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}${basePath}/` },
      articleSection: ['Programmatic DSP', 'Rewarded Playtime', 'OEM Discovery', 'Apple Search Ads'],
      keywords: 'mobile user acquisition, programmatic DSP, rewarded playtime, OEM advertising, apple search ads, ASO, mobile growth strategy 2026',
    },
    {
      '@type': 'Organization',
      name: 'AppSamurai',
      url: 'https://appsamurai.com',
      logo: 'https://appsamurai.com/logo.png',
      sameAs: [
        'https://www.linkedin.com/company/appsamurai/',
        'https://twitter.com/appsamurai',
      ],
      description: 'Global mobile growth platform empowering apps to scale through AI-powered programmatic advertising, rewarded user acquisition, OEM discovery, and Apple Search Ads management.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'AppSamurai', item: 'https://appsamurai.com' },
        { '@type': 'ListItem', position: 2, name: 'Growth Playbook', item: `${BASE_URL}${basePath}/` },
        { '@type': 'ListItem', position: 3, name: 'ROI Calculator', item: `${BASE_URL}${basePath}/calculator` },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={poppins.className}>
        {children}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{page_path:window.location.pathname});`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
