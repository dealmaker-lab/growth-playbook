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
  title: {
    default: 'AppSamurai Content Hub | Mobile Growth Resources & Ebooks',
    template: '%s | AppSamurai',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  description:
    'Interactive ebooks and strategy guides for mobile user acquisition, rewarded playtime, hybrid-casual games, and programmatic advertising. By AppSamurai.',
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
    title: 'AppSamurai Content Hub | Mobile Growth Resources',
    description:
      'Interactive ebooks and strategy guides for mobile user acquisition, rewarded playtime, hybrid-casual games, and programmatic advertising.',
    type: 'website',
    images: [
      {
        url: '/hero-bg.png',
        width: 1200,
        height: 630,
        alt: 'AppSamurai Content Hub — Mobile Growth Resources',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AppSamurai Content Hub',
    description:
      'Interactive ebooks and strategy guides for mobile growth teams.',
    images: ['/hero-bg.png'],
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
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
      '@type': 'WebSite',
      name: 'AppSamurai Content Hub',
      url: `${BASE_URL}${basePath}/`,
      publisher: { '@type': 'Organization', name: 'AppSamurai', url: 'https://appsamurai.com' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'AppSamurai', item: 'https://appsamurai.com' },
        { '@type': 'ListItem', position: 2, name: 'Content Hub', item: `${BASE_URL}${basePath}/` },
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
