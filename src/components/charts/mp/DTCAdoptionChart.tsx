'use client';

import { useG2Chart } from '@/hooks/useG2Chart';

// DTC revenue share at major publishers (2025). Values are the published
// share figures; tooltips carry each publisher's verbatim detail.

// `label` carries the published figure exactly — Playtika and Dorian are "+"
// figures in the source; Stillfront and MTG are exact shares, no plus.
const DATA = [
  { publisher: 'Dorian', value: 40, label: '40%+', detail: 'Grew from 10% to 40%+ in four months after launching web stores', color: '#f48dff' },
  { publisher: 'Stillfront Group', value: 39, label: '39%', detail: 'DTC reached 39% of net revenue in Q2 2025', color: '#af9cff' },
  { publisher: 'Playtika', value: 25, label: '25%+', detail: '25%+ of revenue from web stores in 2025; targeting 40%', color: '#26BE81' },
  { publisher: 'MTG', value: 24, label: '24%', detail: 'DTC grew to 24% of total sales, up from 19% in 2024', color: '#00c4c4' },
];

export default function DTCAdoptionChart() {
  const ref = useG2Chart((chart) => {
    chart.coordinate({ transform: [{ type: 'transpose' }] });
    chart
      .interval()
      .data(DATA)
      .encode('x', 'publisher')
      .encode('y', 'value')
      .encode('color', 'publisher')
      .scale('color', {
        domain: DATA.map((d) => d.publisher),
        range: DATA.map((d) => d.color),
      })
      .scale('x', { padding: 0.4 })
      .axis('y', { labelFormatter: (d: number) => `${d}%`, labelFill: '#666', labelFontSize: 11 })
      .axis('x', { labelFill: '#666', labelFontSize: 12, labelFontWeight: 600 })
      .legend(false)
      .label({ text: (d: { label: string }) => d.label, position: 'right', fill: '#333', fontSize: 12, fontWeight: 700, dx: 4 })
      .tooltip((d: { publisher: string; detail: string }) => ({ name: d.publisher, value: d.detail }))
      .style('radiusTopLeft', 4)
      .style('radiusTopRight', 4)
      .interaction('elementHighlight', { background: true });
  });

  return <div ref={ref} style={{ width: '100%', height: '260px' }} />;
}
