'use client';
import { useG2Chart } from '@/hooks/useG2Chart';

const GRN = '#26BE81';
const DRK = '#2A2A3E';
const PUR = '#af9cff';
const GRY = '#B0B0B0';

const data = [
  { genre: 'Casual', category: 'Casual', value: 22.9 },
  { genre: 'Casual', category: 'Mid-core', value: 23.4 },
  { genre: 'Casual', category: 'Hybridcasual', value: 35.9 },
  { genre: 'Casual', category: 'Hypercasual', value: 6.6 },
  { genre: 'Casual', category: 'Other', value: 11.2 },
  { genre: 'Mid-core', category: 'Casual', value: 34.0 },
  { genre: 'Mid-core', category: 'Mid-core', value: 29.6 },
  { genre: 'Mid-core', category: 'Hybridcasual', value: 28.8 },
  { genre: 'Mid-core', category: 'Hypercasual', value: 6.8 },
  { genre: 'Mid-core', category: 'Other', value: 0.8 },
  { genre: 'Hybridcasual', category: 'Casual', value: 15.5 },
  { genre: 'Hybridcasual', category: 'Mid-core', value: 24.3 },
  { genre: 'Hybridcasual', category: 'Hybridcasual', value: 50.6 },
  { genre: 'Hybridcasual', category: 'Hypercasual', value: 5.0 },
  { genre: 'Hybridcasual', category: 'Other', value: 4.6 },
  { genre: 'Hypercasual', category: 'Casual', value: 19.2 },
  { genre: 'Hypercasual', category: 'Mid-core', value: 31.5 },
  { genre: 'Hypercasual', category: 'Hybridcasual', value: 41.7 },
  { genre: 'Hypercasual', category: 'Hypercasual', value: 5.4 },
  { genre: 'Hypercasual', category: 'Other', value: 2.2 },
];

export default function GenreChart() {
  const containerRef = useG2Chart(
    (chart) => {
      chart.coordinate({ transform: [{ type: 'transpose' }] });

      chart
        .interval()
        .data(data)
        .encode('x', 'genre')
        .encode('y', 'value')
        .encode('color', 'category')
        .transform({ type: 'stackY' })
        .scale('color', {
          domain: ['Casual', 'Mid-core', 'Hybridcasual', 'Hypercasual', 'Other'],
          range: [GRN, DRK, PUR, GRY, 'rgba(38,190,129,.5)'],
        })
        .scale('y', { domain: [0, 100] })
        .axis('y', {
          labelFormatter: (v: number) => v + '%',
          labelFontSize: 10,
          labelFill: '#666',
          gridStroke: '#f0f0f0',
          title: false,
        })
        .axis('x', {
          labelFontSize: 10,
          labelFill: '#666',
          grid: false,
          title: false,
        })
        .legend('color', {
          position: 'top',
          itemMarker: 'circle',
          itemLabelFontSize: 10,
          itemLabelFill: '#666',
          itemSpacing: 12,
        })
        .label({
          text: (d: { value: number }) => (d.value > 5 ? d.value + '%' : ''),
          position: 'inside',
          fill: '#fff',
          fontWeight: 'bold',
          fontSize: 9,
        })
        .tooltip((d: { genre: string; category: string; value: number }) => ({
          name: d.category,
          value: d.value + '%',
        }))
        .state('active', { stroke: '#fff', lineWidth: 1 })
        .state('inactive', { opacity: 0.4 });

      chart.interaction('elementHighlight', { background: true });
    },
    [],
    { height: 300 }
  );

  return <div ref={containerRef} style={{ width: '100%', height: 300 }} />;
}
