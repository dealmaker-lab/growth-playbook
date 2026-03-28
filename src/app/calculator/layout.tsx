import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mobile UA ROI Calculator | AppSamurai Growth Playbook',
  description:
    'Calculate your mobile user acquisition ROI across Programmatic DSP, Rewarded Playtime, OEM Discovery, and Apple Search Ads channels. Get a personalized channel mix, CAC estimates, and ROAS projections.',
  alternates: {
    canonical: '/calculator',
  },
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
