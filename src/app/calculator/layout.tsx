import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mobile UA ROI Calculator | AppSamurai Growth Playbook',
  description:
    'Calculate your mobile user acquisition ROI across Programmatic DSP, Rewarded Playtime, OEM Discovery, and Apple Search Ads channels. Get a personalized channel mix, CAC estimates, and ROAS projections.',
  alternates: {
    canonical: '/calculator',
  },
  openGraph: {
    title: 'Mobile UA ROI Calculator — AppSamurai',
    description:
      'Model your ideal channel allocation across 4 UA channels with budget efficiency curves, Pareto frontiers, and personalized ROAS projections.',
    type: 'website',
    images: [
      {
        url: '/hero-bg.png',
        width: 1200,
        height: 630,
        alt: 'AppSamurai ROI Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mobile UA ROI Calculator — AppSamurai',
    description:
      'Model your channel allocation across DSP, Rewarded, OEM & ASA with real-time CAC and ROAS projections.',
    images: ['/hero-bg.png'],
  },
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
