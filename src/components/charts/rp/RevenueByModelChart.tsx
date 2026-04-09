'use client';

import { useG2Chart } from '@/hooks/useG2Chart';

const DATA = [
  { year: '2020', model: 'Mid-Hardcore', value: 66 },
  { year: '2020', model: 'Casual', value: 33 },
  { year: '2020', model: 'Hybrid-Casual', value: 0.5 },
  { year: '2020', model: 'Hyper-Casual', value: 0.5 },
  { year: '2021', model: 'Mid-Hardcore', value: 66 },
  { year: '2021', model: 'Casual', value: 33 },
  { year: '2021', model: 'Hybrid-Casual', value: 0.5 },
  { year: '2021', model: 'Hyper-Casual', value: 0.5 },
  { year: '2022', model: 'Mid-Hardcore', value: 64 },
  { year: '2022', model: 'Casual', value: 34 },
  { year: '2022', model: 'Hybrid-Casual', value: 1 },
  { year: '2022', model: 'Hyper-Casual', value: 1 },
  { year: '2023', model: 'Mid-Hardcore', value: 59 },
  { year: '2023', model: 'Casual', value: 38 },
  { year: '2023', model: 'Hybrid-Casual', value: 2 },
  { year: '2023', model: 'Hyper-Casual', value: 1 },
];

const COLORS: Record<string, string> = {
  'Mid-Hardcore': '#8B7AE0',
  'Casual': '#26BE81',
  'Hybrid-Casual': '#f4cb00',
  'Hyper-Casual': '#d4c5ff',
};

export default function RevenueByModelChart() {
  const ref = useG2Chart((chart) => {
    chart
      .interval()
      .data(DATA)
      .encode('x', 'year')
      .encode('y', 'value')
      .encode('color', 'model')
      .transform({ type: 'stackY' })
      .transform({ type: 'normalizeY' })
      .scale('color', {
        domain: ['Mid-Hardcore', 'Casual', 'Hybrid-Casual', 'Hyper-Casual'],
        range: [COLORS['Mid-Hardcore'], COLORS['Casual'], COLORS['Hybrid-Casual'], COLORS['Hyper-Casual']],
      })
      .axis('y', { labelFormatter: (d: number) => `${Math.round(d * 100)}%`, labelFill: '#666', labelFontSize: 11 })
      .axis('x', { labelFill: '#666', labelFontSize: 11 })
      .legend('color', { position: 'top', flipPage: false })
      .label({ text: (d: { value: number }) => d.value >= 10 ? `${d.value}%` : '', position: 'inside', fill: '#fff', fontSize: 11, fontWeight: 600 })
      .tooltip((d: { model: string; value: number }) => ({ name: d.model, value: `${d.value}%` }))
      .style('radiusTopLeft', 2)
      .style('radiusTopRight', 2)
      .interaction('elementHighlight', { background: true });
  });

  return <div ref={ref} style={{ width: '100%', height: '300px' }} />;
}
