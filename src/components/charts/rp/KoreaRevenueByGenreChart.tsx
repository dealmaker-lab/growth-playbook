'use client';

import { useG2Chart } from '@/hooks/useG2Chart';

// South Korea: mobile revenue by genre (2024). RPGs command a 47% share at
// $3.17B, dwarfing Strategy and Casual — the clearest case for high-intent,
// achievement-driven rewarded acquisition.

const DATA = [
  { genre: 'RPG', value: 3.17, label: '$3.17B (47%)', color: '#8B7AE0' },
  { genre: 'Strategy', value: 0.7166, label: '$716.6M', color: '#00c4c4' },
  { genre: 'Casual', value: 0.2967, label: '$296.7M', color: '#2EC97E' },
];

export default function KoreaRevenueByGenreChart() {
  const ref = useG2Chart((chart) => {
    chart.coordinate({ transform: [{ type: 'transpose' }] });
    chart
      .interval()
      .data(DATA)
      .encode('x', 'genre')
      .encode('y', 'value')
      .encode('color', 'genre')
      .scale('color', {
        domain: DATA.map((d) => d.genre),
        range: DATA.map((d) => d.color),
      })
      .scale('x', { padding: 0.4 })
      .axis('y', { labelFormatter: (d: number) => `$${d}B`, labelFill: '#666', labelFontSize: 11 })
      .axis('x', { labelFill: '#666', labelFontSize: 12, labelFontWeight: 600 })
      .legend(false)
      .label({ text: (d: { label: string }) => d.label, position: 'right', fill: '#333', fontSize: 12, fontWeight: 700, dx: 4 })
      .tooltip((d: { genre: string; label: string }) => ({ name: d.genre, value: d.label }))
      .style('radiusTopLeft', 4)
      .style('radiusTopRight', 4)
      .interaction('elementHighlight', { background: true });
  });

  return <div ref={ref} style={{ width: '100%', height: '240px' }} />;
}
