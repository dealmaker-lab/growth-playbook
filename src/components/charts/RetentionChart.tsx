'use client';
import { useG2Chart } from '@/hooks/useG2Chart';

const RED = '#F87171';
const PUR = '#af9cff';
const BLU = '#3B82F6';
const GRN = '#26BE81';

const retSeries: Record<string, Record<string, number[]>> = {
  d1: {
    'Mid-core': [48, 46, 45, 44, 43, 42, 41, 40],
    Hybridcasual: [52, 50, 48, 47, 46, 45, 44, 43],
    Hypercasual: [45, 42, 40, 38, 36, 35, 34, 33],
    Casual: [40, 37, 35, 33, 31, 30, 29, 28],
  },
  d7: {
    'Mid-core': [42, 40, 39, 38, 37, 36, 35, 34],
    Hybridcasual: [44, 43, 42, 41, 40, 39, 38, 37],
    Hypercasual: [40, 38, 36, 35, 33, 32, 31, 30],
    Casual: [35, 33, 31, 29, 28, 27, 26, 25],
  },
  d30: {
    'Mid-core': [32, 30, 28, 27, 26, 25, 24, 23],
    Hybridcasual: [35, 33, 31, 30, 28, 27, 26, 25],
    Hypercasual: [28, 26, 24, 22, 21, 20, 19, 18],
    Casual: [25, 23, 21, 19, 18, 17, 16, 15],
  },
  d365: {
    'Mid-core': [18, 17, 16, 15, 14, 14, 13, 12],
    Hybridcasual: [20, 19, 18, 17, 16, 15, 14, 13],
    Hypercasual: [12, 11, 10, 9, 9, 8, 8, 7],
    Casual: [10, 9, 8, 7, 7, 6, 6, 5],
  },
};

function buildData(tab: string) {
  return Object.entries(retSeries[tab]).flatMap(([genre, values]) =>
    values.map((v, i) => ({ quarter: `Q${i + 1}`, value: v, genre }))
  );
}

export default function RetentionChart({ tab }: { tab: string }) {
  const containerRef = useG2Chart(
    (chart) => {
      const data = buildData(tab);

      chart
        .line()
        .data(data)
        .encode('x', 'quarter')
        .encode('y', 'value')
        .encode('color', 'genre')
        .encode('shape', 'smooth')
        .scale('color', {
          domain: ['Mid-core', 'Hybridcasual', 'Hypercasual', 'Casual'],
          range: [RED, PUR, BLU, GRN],
        })
        .scale('y', { nice: true })
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
          position: 'right',
          itemMarker: 'line',
          itemLabelFontSize: 10,
          itemLabelFill: '#666',
          itemSpacing: 10,
        })
        .tooltip({
          title: (d: { quarter: string }) => d.quarter,
          items: [{ channel: 'y', valueFormatter: (v: number) => v + '%' }],
        })
        .style('lineWidth', 2)
        .state('active', { lineWidth: 3 })
        .state('inactive', { opacity: 0.3 });

      chart
        .point()
        .data(data)
        .encode('x', 'quarter')
        .encode('y', 'value')
        .encode('color', 'genre')
        .scale('color', {
          domain: ['Mid-core', 'Hybridcasual', 'Hypercasual', 'Casual'],
          range: [RED, PUR, BLU, GRN],
        })
        .style('r', 3)
        .tooltip(false)
        .legend(false)
        .state('active', { r: 6 })
        .state('inactive', { opacity: 0.3 });

      chart.interaction('elementHighlight', { background: true });
    },
    [tab],
    { buildData: (t) => buildData(t as string), height: 260 }
  );

  return <div ref={containerRef} style={{ width: '100%', height: 260 }} />;
}
