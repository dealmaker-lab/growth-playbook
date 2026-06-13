'use client';

import { useG2Chart } from '@/hooks/useG2Chart';

// Revenue split benchmark by genre, 2025–2026 (Audiencelab, 2026).
// Bars plot the midpoint of each published range; tooltips quote the ranges
// verbatim — hyper-casual 85–95% ads / 5–15% IAP, casual 40–60 / 40–60,
// hybrid casual "balanced blend, weighted by meta depth", mid-core 20–40 / 60–80.

const DATA = [
  { genre: 'Hyper-Casual', stream: 'Ads', value: 90, range: '85–95% ads' },
  { genre: 'Hyper-Casual', stream: 'IAP', value: 10, range: '5–15% IAP' },
  { genre: 'Casual', stream: 'Ads', value: 50, range: '40–60% ads' },
  { genre: 'Casual', stream: 'IAP', value: 50, range: '40–60% IAP' },
  { genre: 'Hybrid Casual', stream: 'Ads', value: 50, range: 'Balanced blend, weighted by meta depth' },
  { genre: 'Hybrid Casual', stream: 'IAP', value: 50, range: 'Balanced blend, weighted by meta depth' },
  { genre: 'Mid-core', stream: 'Ads', value: 30, range: '20–40% ads' },
  { genre: 'Mid-core', stream: 'IAP', value: 70, range: '60–80% IAP' },
];

const COLORS: Record<string, string> = {
  Ads: '#af9cff',
  IAP: '#2EC97E',
};

export default function RevenueSplitChart() {
  const ref = useG2Chart((chart) => {
    chart
      .interval()
      .data(DATA)
      .encode('x', 'genre')
      .encode('y', 'value')
      .encode('color', 'stream')
      .transform({ type: 'stackY' })
      .scale('color', {
        domain: ['Ads', 'IAP'],
        range: [COLORS['Ads'], COLORS['IAP']],
      })
      .axis('y', { labelFormatter: (d: number) => `${d}%`, labelFill: '#666', labelFontSize: 11 })
      .axis('x', { labelFill: '#666', labelFontSize: 11 })
      .legend('color', { position: 'top', flipPage: false })
      // Hybrid Casual has no published split ("balanced blend, weighted by
      // meta depth") — never print a number on its bars.
      .label({ text: (d: { genre: string; stream: string; value: number }) => (d.genre === 'Hybrid Casual' ? (d.stream === 'IAP' ? 'Balanced' : '') : `${d.value}%`), position: 'inside', fill: '#fff', fontSize: 11, fontWeight: 600 })
      .tooltip((d: { stream: string; range: string }) => ({ name: d.stream, value: d.range }))
      .style('radiusTopLeft', 2)
      .style('radiusTopRight', 2)
      .interaction('elementHighlight', { background: true });
  });

  return <div ref={ref} style={{ width: '100%', height: '300px' }} />;
}
