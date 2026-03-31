'use client';
import { useRef, useEffect } from 'react';
import { useG2Chart } from '@/hooks/useG2Chart';

const GRN = '#26BE81';
const DRK = '#2A2A3E';
const PUR = '#af9cff';
const GRY = '#B0B0B0';

const trendData: Record<string, Record<string, number[]>> = {
  revenue: { '2024': [30, 28, 12, 8], '2025': [35, 32, 16, 9] },
  downloads: { '2024': [48, 22, 15, 12], '2025': [42, 25, 18, 10] },
  sessions: { '2024': [1.8, 1.2, 0.8, 0.5], '2025': [2.1, 1.4, 1.0, 0.6] },
};

const trendUnits: Record<string, { pre: string; suf: string }> = {
  revenue: { pre: '$', suf: 'B' },
  downloads: { pre: '', suf: 'B' },
  sessions: { pre: '', suf: 'T' },
};

const genres = ['Casual', 'Mid-core', 'Hybridcasual', 'Hypercasual'];

function buildData(tab: string) {
  const d = trendData[tab];
  const rows: { year: string; genre: string; value: number }[] = [];
  for (const year of ['2024', '2025']) {
    genres.forEach((genre, i) => {
      rows.push({ year, genre, value: d[year][i] });
    });
  }
  return rows;
}

export default function TrendsChart({ tab }: { tab: string }) {
  const tabRef = useRef(tab);
  useEffect(() => { tabRef.current = tab; }, [tab]);

  const containerRef = useG2Chart(
    (chart) => {
      const data = buildData(tab);
      const u = trendUnits[tab];

      chart
        .interval()
        .data(data)
        .encode('x', 'year')
        .encode('y', 'value')
        .encode('color', 'genre')
        .transform({ type: 'stackY' })
        .scale('color', {
          domain: genres,
          range: [GRN, DRK, PUR, GRY],
        })
        .axis('y', {
          labelFormatter: (v: number) => u.pre + v + u.suf,
          labelFontSize: 10,
          labelFill: '#666',
          gridStroke: '#f0f0f0',
          title: false,
        })
        .axis('x', {
          labelFontSize: 11,
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
          text: (d: { value: number }) => {
            const unit = trendUnits[tabRef.current];
            return unit.pre + d.value + unit.suf;
          },
          position: 'inside',
          fill: '#fff',
          fontWeight: 'bold',
          fontSize: 9,
        })
        .tooltip((d: { genre: string; value: number; year: string }) => {
          const unit = trendUnits[tabRef.current];
          return {
            name: d.genre,
            value: unit.pre + d.value + unit.suf,
          };
        })
        .style('radiusTopLeft', 2)
        .style('radiusTopRight', 2)
        .state('active', { stroke: '#fff', lineWidth: 1 })
        .state('inactive', { opacity: 0.4 });

      chart.interaction('elementHighlight', { background: true });
    },
    [tab],
    { buildData: (t) => buildData(t as string), height: 280 }
  );

  return <div ref={containerRef} style={{ width: '100%', height: 280 }} />;
}
