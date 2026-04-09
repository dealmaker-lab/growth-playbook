'use client';

import { useG2Chart } from '@/hooks/useG2Chart';

const DATA = [
  { year: '2019', value: 200 },
  { year: '2020', value: 500 },
  { year: '2021', value: 1000 },
  { year: '2022', value: 1400 },
];

export default function HCRevenueChart() {
  const ref = useG2Chart((chart) => {
    chart
      .interval()
      .data(DATA)
      .encode('x', 'year')
      .encode('y', 'value')
      .axis('y', { title: 'Revenue ($M)', labelFill: '#666', labelFontSize: 11, titleFontSize: 11, labelFormatter: (d: number) => `$${d >= 1000 ? (d / 1000).toFixed(1) + 'B' : d + 'M'}` })
      .axis('x', { labelFill: '#666', labelFontSize: 12 })
      .legend(false)
      .label({
        text: (d: { value: number }) => `$${d.value >= 1000 ? (d.value / 1000).toFixed(1) + 'B' : d.value + 'M'}`,
        position: 'top',
        fill: '#333',
        fontSize: 12,
        fontWeight: 700,
      })
      .tooltip((d: { year: string; value: number }) => ({ name: d.year, value: `$${d.value}M` }))
      .style('fill', '#af9cff')
      .style('radiusTopLeft', 6)
      .style('radiusTopRight', 6)
      .interaction('elementHighlight', { background: true });
  });

  return <div ref={ref} style={{ width: '100%', height: '280px' }} />;
}
