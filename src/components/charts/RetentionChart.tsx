'use client';
import { useG2Chart } from '@/hooks/useG2Chart';

/* Colors matching Sensor Tower report */
const MIDCORE = '#c4a4e8';   // purple
const CASUAL = '#7dd3c0';    // teal/green
const HYBRID = '#8faee0';    // blue
const HYPER = '#f0a882';     // orange

/* Data: Sensor Tower State of Gaming 2026, p.24
   "Top 25 Games by 2025 IAP Revenue per Product Model (by Downloads for Hypercasual)"
   Half-yearly averages from 2022–2025 (8 data points per genre) */
const periods = ["H1'22", "H2'22", "H1'23", "H2'23", "H1'24", "H2'24", "H1'25", "H2'25"];

const retSeries: Record<string, Record<string, number[]>> = {
  d7: {
    'Mid-core':     [22.5, 22,   22.5, 22.5, 22,   21,   21,   21],
    Casual:         [18.5, 19,   18.5, 17.5, 16.5, 16,   15.5, 15],
    Hybridcasual:   [17.5, 17.5, 17,   16,   16,   16,   16,   15.5],
    Hypercasual:    [14,   14.5, 15.5, 16,   15,   14.5, 13.5, 13],
  },
  d30: {
    'Mid-core':     [13,   13,   12.5, 12.5, 13,   12,   12,   11.5],
    Casual:         [9.5,  9.5,  9,    8.5,  8,    7.5,  7.5,  7.5],
    Hybridcasual:   [6,    6.5,  7,    6.5,  6.5,  6.5,  6.5,  6],
    Hypercasual:    [3.5,  4,    5,    5.5,  5,    5,    4.5,  4.5],
  },
  d1: {
    'Mid-core':     [45,   44,   44.5, 44,   44,   42,   42,   42],
    Hybridcasual:   [44,   43,   43,   42,   41,   39,   39,   39],
    Hypercasual:    [42,   40,   41,   42,   39,   38.5, 38.5, 38],
    Casual:         [35,   35.5, 36,   34,   33,   31.5, 31,   30.5],
  },
  d365: {
    'Mid-core':     [5.8,  5.5,  5.2,  5,    5.1,  4.8,  4.8,  4.3],
    Casual:         [2.5,  2.4,  2.4,  2.3,  2.3,  2.2,  2.2,  2.2],
    Hybridcasual:   [1.2,  1.5,  1.4,  1.3,  1.8,  1.2,  1.1,  1.0],
    Hypercasual:    [0.8,  0.8,  1.0,  1.0,  0.9,  1.0,  1.1,  1.1],
  },
};

/* Genre order per tab matches Sensor Tower visual ordering (top to bottom) */
const genreOrder: Record<string, string[]> = {
  d7:   ['Mid-core', 'Casual', 'Hybridcasual', 'Hypercasual'],
  d30:  ['Mid-core', 'Casual', 'Hybridcasual', 'Hypercasual'],
  d1:   ['Mid-core', 'Hybridcasual', 'Hypercasual', 'Casual'],
  d365: ['Mid-core', 'Casual', 'Hybridcasual', 'Hypercasual'],
};

const colorMap: Record<string, string> = {
  'Mid-core': MIDCORE,
  Casual: CASUAL,
  Hybridcasual: HYBRID,
  Hypercasual: HYPER,
};

function buildData(tab: string) {
  const order = genreOrder[tab] || genreOrder.d7;
  return order.flatMap((genre) =>
    (retSeries[tab][genre] || []).map((v, i) => ({
      period: periods[i],
      value: v,
      genre,
    }))
  );
}

export default function RetentionChart({ tab }: { tab: string }) {
  const containerRef = useG2Chart(
    (chart) => {
      const data = buildData(tab);
      const order = genreOrder[tab] || genreOrder.d7;

      chart
        .line()
        .data(data)
        .encode('x', 'period')
        .encode('y', 'value')
        .encode('color', 'genre')
        .encode('shape', 'smooth')
        .scale('color', {
          domain: order,
          range: order.map((g) => colorMap[g]),
        })
        .scale('y', { nice: true })
        .axis('y', {
          labelFormatter: (v: number) => v + '%',
          labelFontSize: 10,
          labelFill: '#888',
          gridStroke: '#f0f0f0',
          title: false,
        })
        .axis('x', {
          labelFontSize: 9,
          labelFill: '#888',
          grid: false,
          title: false,
        })
        .legend('color', {
          position: 'right',
          itemMarker: 'line',
          itemLabelFontSize: 10,
          itemLabelFill: '#666',
          itemSpacing: 8,
        })
        .tooltip({
          title: (d: { period: string }) => d.period,
          items: [{ channel: 'y', valueFormatter: (v: number) => v + '%' }],
        })
        .style('lineWidth', 2)
        .style('lineDash', [4, 3])
        .state('active', { lineWidth: 3 })
        .state('inactive', { opacity: 0.3 });

      chart
        .point()
        .data(data)
        .encode('x', 'period')
        .encode('y', 'value')
        .encode('color', 'genre')
        .scale('color', {
          domain: order,
          range: order.map((g) => colorMap[g]),
        })
        .style('r', 2.5)
        .tooltip(false)
        .legend(false)
        .state('active', { r: 5 })
        .state('inactive', { opacity: 0.3 });

      chart.interaction('elementHighlight', { background: true });
    },
    [tab],
    { buildData: (t) => buildData(t as string), height: 280 }
  );

  return <div ref={containerRef} style={{ width: '100%', height: 280 }} />;
}
