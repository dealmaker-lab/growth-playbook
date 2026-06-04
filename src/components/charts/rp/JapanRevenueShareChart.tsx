'use client';

import { useG2Chart } from '@/hooks/useG2Chart';

// Japan: Hybrid-casual In-App Purchase vs In-App Advertising revenue share by
// genre (Sensor Tower, top 1,000 games by downloads). IAP dominates everywhere
// except Lifestyle & Puzzle, where ad monetization climbs to 40%.

const DATA = [
  { genre: 'Action & Strategy', type: 'In-App Purchase', value: 93.1 },
  { genre: 'Action & Strategy', type: 'In-App Advertising', value: 6.9 },
  { genre: 'Lifestyle & Puzzle', type: 'In-App Purchase', value: 60.0 },
  { genre: 'Lifestyle & Puzzle', type: 'In-App Advertising', value: 40.0 },
  { genre: 'Sports & Racing', type: 'In-App Purchase', value: 94.4 },
  { genre: 'Sports & Racing', type: 'In-App Advertising', value: 5.6 },
];

const COLORS: Record<string, string> = {
  'In-App Purchase': '#26BE81',
  'In-App Advertising': '#af9cff',
};

export default function JapanRevenueShareChart() {
  const ref = useG2Chart((chart) => {
    chart
      .interval()
      .data(DATA)
      .encode('x', 'genre')
      .encode('y', 'value')
      .encode('color', 'type')
      .transform({ type: 'stackY' })
      .scale('color', {
        domain: ['In-App Purchase', 'In-App Advertising'],
        range: [COLORS['In-App Purchase'], COLORS['In-App Advertising']],
      })
      .axis('y', { labelFormatter: (d: number) => `${d}%`, labelFill: '#666', labelFontSize: 11 })
      .axis('x', { labelFill: '#666', labelFontSize: 11 })
      .legend('color', { position: 'top', flipPage: false })
      .label({ text: (d: { value: number }) => `${d.value}%`, position: 'inside', fill: '#fff', fontSize: 11, fontWeight: 600 })
      .tooltip((d: { type: string; value: number }) => ({ name: d.type, value: `${d.value}%` }))
      .style('radiusTopLeft', 2)
      .style('radiusTopRight', 2)
      .interaction('elementHighlight', { background: true });
  });

  return <div ref={ref} style={{ width: '100%', height: '300px' }} />;
}
