'use client';

import { useG2Chart } from '@/hooks/useG2Chart';

// Brazil: Mobile game class Ad Spend Share vs IAP Revenue Share (Sensor Tower,
// 2025). Action & Strategy soaks up the most ad spend; Lifestyle & Puzzle
// over-indexes on IAP revenue relative to its ad spend — the offerwall opening.

const DATA = [
  { genre: 'Action & Strategy', metric: 'Market Ad Spend Share', value: 58.9 },
  { genre: 'Action & Strategy', metric: 'Market IAP Revenue Share', value: 46.5 },
  { genre: 'Lifestyle & Puzzle', metric: 'Market Ad Spend Share', value: 31.3 },
  { genre: 'Lifestyle & Puzzle', metric: 'Market IAP Revenue Share', value: 39.9 },
  { genre: 'Sports & Racing', metric: 'Market Ad Spend Share', value: 5.3 },
  { genre: 'Sports & Racing', metric: 'Market IAP Revenue Share', value: 6.9 },
  { genre: 'Casino', metric: 'Market Ad Spend Share', value: 4.5 },
  { genre: 'Casino', metric: 'Market IAP Revenue Share', value: 6.6 },
];

const COLORS: Record<string, string> = {
  'Market Ad Spend Share': '#af9cff',
  'Market IAP Revenue Share': '#2EC97E',
};

export default function BrazilAdVsIapChart() {
  const ref = useG2Chart((chart) => {
    chart.coordinate({ transform: [{ type: 'transpose' }] });
    chart
      .interval()
      .data(DATA)
      .encode('x', 'genre')
      .encode('y', 'value')
      .encode('color', 'metric')
      .transform({ type: 'dodgeX' })
      .scale('color', {
        domain: ['Market Ad Spend Share', 'Market IAP Revenue Share'],
        range: [COLORS['Market Ad Spend Share'], COLORS['Market IAP Revenue Share']],
      })
      .axis('y', { labelFormatter: (d: number) => `${d}%`, labelFill: '#666', labelFontSize: 11 })
      .axis('x', { labelFill: '#666', labelFontSize: 11 })
      .legend('color', { position: 'top', flipPage: false })
      .label({ text: (d: { value: number }) => `${d.value}%`, position: 'right', fill: '#333', fontSize: 11, fontWeight: 600 })
      .tooltip((d: { metric: string; value: number }) => ({ name: d.metric, value: `${d.value}%` }))
      .style('radiusTopLeft', 2)
      .style('radiusTopRight', 2)
      .interaction('elementHighlight', { background: true });
  });

  return <div ref={ref} style={{ width: '100%', height: '340px' }} />;
}
