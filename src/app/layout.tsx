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

export const metadata: Metadata = {
  title: 'AppSamurai 2026 Mobile Growth Strategy Guide',
  icons: { icon: '/favicon.ico' },
  description:
    'The definitive strategy guide for Rewarded Playtime, Programmatic DSP, OEM Discovery, and Apple Search Ads — built for growth teams who need to scale smarter in 2026.',
  openGraph: {
    title: 'AppSamurai 2026 Mobile Growth Strategy Guide',
    description:
      'The definitive strategy guide for Rewarded Playtime, Programmatic DSP, OEM Discovery, and Apple Search Ads — built for growth teams who need to scale smarter in 2026.',
    type: 'website',
    images: ['/hero-bg.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AppSamurai 2026 Mobile Growth Strategy Guide',
    description:
      'The definitive playbook for Rewarded Playtime, Programmatic DSP, OEM Discovery, and Apple Search Ads.',
    images: ['/hero-bg.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
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
