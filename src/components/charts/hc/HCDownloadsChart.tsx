'use client';

import { useG2Chart } from '@/hooks/useG2Chart';

const DATA = [
  { year: '2019', value: 3.8 },
  { year: '2020', value: 5.0 },
  { year: '2021', value: 4.8 },
  { year: '2022', value: 5.1 },
];

export default function HCDownloadsChart() {
  const ref = useG2Chart((chart) => {
    chart
      .interval()
      .data(DATA)
      .encode('x', 'year')
      .encode('y', 'value')
      .axis('y', { title: 'Downloads (Billions)', labelFill: '#666', labelFontSize: 11, titleFontSize: 11, labelFormatter: (d: number) => `${d}B` })
      .axis('x', { labelFill: '#666', labelFontSize: 12 })
      .legend(false)
      .label({
        text: (d: { value: number }) => `${d.value}B`,
        position: 'top',
        fill: '#333',
        fontSize: 12,
        fontWeight: 700,
      })
      .tooltip((d: { year: string; value: number }) => ({ name: d.year, value: `${d.value}B downloads` }))
      .style('fill', '#f48dff')
      .style('radiusTopLeft', 6)
      .style('radiusTopRight', 6)
      .interaction('elementHighlight', { background: true });
  });

  return <div ref={ref} style={{ width: '100%', height: '280px' }} />;
}
