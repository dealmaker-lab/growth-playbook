import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import '@/styles/globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AppSamurai 2026 Growth Playbook',
  description:
    'The definitive playbook for Rewarded Playtime, Programmatic DSP, OEM Discovery, and Apple Search Ads — built for growth teams who need to scale smarter in 2026.',
  openGraph: {
    title: 'AppSamurai 2026 Growth Playbook',
    description:
      'The definitive playbook for Rewarded Playtime, Programmatic DSP, OEM Discovery, and Apple Search Ads — built for growth teams who need to scale smarter in 2026.',
    type: 'website',
    images: ['/cover.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AppSamurai 2026 Growth Playbook',
    description:
      'The definitive playbook for Rewarded Playtime, Programmatic DSP, OEM Discovery, and Apple Search Ads.',
    images: ['/cover.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
