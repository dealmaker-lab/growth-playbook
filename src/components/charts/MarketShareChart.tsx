'use client';
import { useG2Chart } from '@/hooks/useG2Chart';

const BLU = '#3B82F6';
const CYN = '#00f4f4';

const years = ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'];
const iosData = [35, 25, 23, 35, 28, 25, 23, 22, 21, 20, 22, 27, 27, 28, 29, 29];
const androidData = [3, 10, 20, 28, 30, 55, 65, 68, 72, 76, 77, 73, 72, 71, 71, 71];

const data = [
  ...years.map((y, i) => ({ year: y, platform: 'iOS', value: iosData[i] })),
  ...years.map((y, i) => ({ year: y, platform: 'Android', value: androidData[i] })),
];

export default function MarketShareChart() {
  const containerRef = useG2Chart(
    (chart) => {
      chart
        .interval()
        .data(data)
        .encode('x', 'year')
        .encode('y', 'value')
        .encode('color', 'platform')
        .transform({ type: 'dodgeX' })
        .scale('color', {
          domain: ['iOS', 'Android'],
          range: [BLU, CYN],
        })
        .scale('y', { domain: [0, 80], nice: true })
        .axis('y', {
          labelFormatter: (v: number) => v + '%',
          labelFontSize: 10,
          labelFill: '#666',
          gridStroke: '#f0f0f0',
          title: false,
        })
        .axis('x', {
          labelFontSize: 9,
          labelFill: '#666',
          grid: false,
          title: false,
        })
        .legend('color', {
          position: 'top',
          itemMarker: 'circle',
          itemLabelFontSize: 10,
          itemLabelFill: '#666',
          itemSpacing: 14,
        })
        .tooltip((d: { platform: string; value: number; year: string }) => ({
          name: d.platform,
          value: d.value + '%',
        }))
        .style('radiusTopLeft', 1)
        .style('radiusTopRight', 1)
        .state('active', { stroke: '#fff', lineWidth: 1 })
        .state('inactive', { opacity: 0.3 });

      chart.interaction('elementHighlight', { background: true });
    },
    [],
    { height: 300 }
  );

  return <div ref={containerRef} style={{ width: '100%', height: 300 }} />;
}
