'use client';

import { useG2Chart } from '@/hooks/useG2Chart';

const DATA = [
  { type: 'In-App Advertising', value: 8.08, color: '#af9cff' },
  { type: 'In-App Purchases', value: 8.84, color: '#26BE81' },
  { type: 'Paid Apps', value: 0.12, color: '#f48dff' },
];

export default function CasualMonetizationChart() {
  const ref = useG2Chart((chart) => {
    chart
      .interval()
      .data(DATA)
      .encode('x', 'type')
      .encode('y', 'value')
      .encode('color', 'type')
      .scale('color', {
        domain: DATA.map((d) => d.type),
        range: DATA.map((d) => d.color),
      })
      .axis('y', { title: 'Revenue ($ Billion)', labelFill: '#666', labelFontSize: 11, titleFontSize: 11 })
      .axis('x', { labelFill: '#666', labelFontSize: 11 })
      .legend(false)
      .label({
        text: (d: { value: number }) => `$${d.value.toFixed(2)}B`,
        position: 'top',
        fill: '#333',
        fontSize: 12,
        fontWeight: 700,
      })
      .tooltip((d: { type: string; value: number }) => ({ name: d.type, value: `$${d.value.toFixed(2)}B` }))
      .style('radiusTopLeft', 4)
      .style('radiusTopRight', 4)
      .interaction('elementHighlight', { background: true });
  });

  return <div ref={ref} style={{ width: '100%', height: '280px' }} />;
}
