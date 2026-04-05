'use client';
import { useState } from 'react';
import { useG2Chart } from '@/hooks/useG2Chart';

/* ── Colors matching Sensor Tower ── */
const CASUAL = '#7dd3c0';    // teal/green
const MIDCORE = '#c4a4e8';   // purple
const HYBRID = '#8faee0';    // blue
const HYPER = '#f0a882';     // orange/salmon

const genres = ['Casual', 'Mid-core', 'Hybridcasual', 'Hypercasual'];
const colors = [CASUAL, MIDCORE, HYBRID, HYPER];

type Region = 'Worldwide' | 'United States' | 'Japan' | 'United Kingdom' | 'Turkey' | 'South Korea';

/* ── Data extracted from Sensor Tower State of Gaming 2026 ── */
// Format: [Casual, Mid-core, Hybridcasual, Hypercasual] per year
const DATA: Record<Region, {
  revenue: { '2024': number[]; '2025': number[] };
  downloads: { '2024': number[]; '2025': number[] };
  hours: { '2024': number[]; '2025': number[] };
}> = {
  Worldwide: {
    revenue: { '2024': [28, 42, 5, 4], '2025': [29, 42, 5, 4] },
    downloads: { '2024': [15, 2, 5, 29], '2025': [13, 2, 4, 28] },
    hours: { '2024': [120, 150, 55, 100], '2025': [125, 155, 60, 95] },
  },
  'United States': {
    revenue: { '2024': [14, 8, 1.5, 1.5], '2025': [14.5, 8, 1.5, 1] },
    downloads: { '2024': [1.5, 0.3, 0.6, 2.1], '2025': [1.3, 0.3, 0.5, 1.6] },
    hours: { '2024': [20, 8, 3, 4], '2025': [20, 8, 3.5, 3.5] },
  },
  Japan: {
    revenue: { '2024': [2, 8, 0.5, 0.5], '2025': [1.5, 8, 0.5, 0.5] },
    downloads: { '2024': [190, 50, 100, 310], '2025': [170, 40, 80, 310] },
    hours: { '2024': [7, 5, 1.5, 2], '2025': [7, 5, 1.5, 2] },
  },
  'United Kingdom': {
    revenue: { '2024': [1.4, 0.5, 0.15, 0.15], '2025': [1.5, 0.6, 0.15, 0.15] },
    downloads: { '2024': [250, 30, 70, 370], '2025': [210, 25, 55, 310] },
    hours: { '2024': [2.3, 1.5, 0.5, 0.7], '2025': [2.3, 1.5, 0.6, 0.6] },
  },
  Turkey: {
    revenue: { '2024': [0.2, 0.28, 0.02, 0.01], '2025': [0.22, 0.38, 0.04, 0.01] },
    downloads: { '2024': [0.5, 0.1, 0.15, 0.8], '2025': [0.4, 0.08, 0.12, 0.75] },
    hours: { '2024': [3, 3.5, 0.6, 1.4], '2025': [3, 4, 0.7, 1.3] },
  },
  'South Korea': {
    revenue: { '2024': [1.8, 5, 0.3, 0.2], '2025': [1.9, 5.2, 0.35, 0.15] },
    downloads: { '2024': [350, 60, 90, 250], '2025': [320, 55, 80, 240] },
    hours: { '2024': [4, 3.5, 0.8, 1.2], '2025': [4.2, 3.5, 0.9, 1.1] },
  },
};

const UNITS: Record<string, { pre: string; suf: string }> = {
  revenue: { pre: '$', suf: 'B' },
  downloads: { pre: '', suf: 'B' },
  hours: { pre: '', suf: 'B' },
};

/* Smaller markets use M instead of B for downloads */
function formatVal(value: number, metric: string, region: Region): string {
  if (metric === 'downloads' && region !== 'Worldwide') {
    if (value < 1) return Math.round(value * 1000) + 'M';
    return value.toFixed(1) + 'B';
  }
  if (metric === 'revenue' && value < 1) return '$' + Math.round(value * 1000) + 'M';
  const u = UNITS[metric];
  if (value >= 1) return u.pre + (Number.isInteger(value) ? value : value.toFixed(1)) + u.suf;
  return u.pre + value + u.suf;
}

function buildData(metric: string, region: Region) {
  const d = DATA[region][metric as keyof (typeof DATA)[Region]];
  const rows: { year: string; genre: string; value: number }[] = [];
  for (const year of ['2024', '2025']) {
    genres.forEach((genre, i) => {
      rows.push({ year, genre, value: (d as Record<string, number[]>)[year][i] });
    });
  }
  return rows;
}

const LABELS: Record<string, string> = {
  revenue: 'IAP Revenue',
  downloads: 'Downloads',
  hours: 'Total Hours Spent',
};

/* ── Single metric chart ── */
function MetricChart({ metric, region }: { metric: string; region: Region }) {
  const containerRef = useG2Chart(
    (chart) => {
      const data = buildData(metric, region);

      chart
        .interval()
        .data(data)
        .encode('x', 'year')
        .encode('y', 'value')
        .encode('color', 'genre')
        .transform({ type: 'stackY' })
        .scale('color', {
          domain: genres,
          range: colors,
        })
        .axis('y', {
          labelFormatter: (v: number) => formatVal(v, metric, region),
          labelFontSize: 9,
          labelFill: '#888',
          gridStroke: '#f0f0f0',
          title: false,
        })
        .axis('x', {
          labelFontSize: 10,
          labelFill: '#666',
          grid: false,
          title: false,
        })
        .legend(false)
        .label({
          text: (d: { value: number }) => {
            if (d.value < 0.5) return '';
            return formatVal(d.value, metric, region);
          },
          position: 'inside',
          fill: '#fff',
          fontWeight: 'bold',
          fontSize: 8,
        })
        .tooltip((d: { genre: string; value: number }) => ({
          name: d.genre,
          value: formatVal(d.value, metric, region),
        }))
        .style('radiusTopLeft', 2)
        .style('radiusTopRight', 2)
        .state('active', { stroke: '#fff', lineWidth: 1 })
        .state('inactive', { opacity: 0.4 });

      chart.interaction('elementHighlight', { background: true });
    },
    [metric, region],
    { buildData: () => buildData(metric, region), height: 260 }
  );

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '.85rem', textAlign: 'center', color: '#222', marginBottom: '8px' }}>{LABELS[metric]}</div>
      <div ref={containerRef} style={{ width: '100%', height: 260 }} />
    </div>
  );
}

/* ── Panel with region dropdown + 3 charts ── */
export default function AnnualTrendsPanel() {
  const [region, setRegion] = useState<Region>('Worldwide');

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '1.05rem', textAlign: 'center', color: '#222', marginBottom: '4px' }}>
        Annual Trends for Mobile Games by Product Model
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value as Region)}
          style={{
            padding: '8px 32px 8px 16px',
            borderRadius: '8px',
            border: '1.5px solid #E8ECF1',
            fontFamily: 'var(--font-h)',
            fontSize: '.82rem',
            fontWeight: 500,
            color: '#333',
            background: '#fff',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1l4 4 4-4\' stroke=\'%23666\' stroke-width=\'1.5\' stroke-linecap=\'round\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
          }}
        >
          {(['Worldwide', 'United States', 'Japan', 'United Kingdom', 'Turkey', 'South Korea'] as Region[]).map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {genres.map((g, i) => (
          <div key={g} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors[i] }} />
            <span style={{ fontSize: '.78rem', color: '#666' }}>{g}</span>
          </div>
        ))}
      </div>
      {/* 3 charts side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <MetricChart metric="revenue" region={region} />
        <MetricChart metric="downloads" region={region} />
        <MetricChart metric="hours" region={region} />
      </div>
      <div style={{ textAlign: 'center', fontSize: '.7rem', color: '#999', marginTop: '8px' }}>Source: Sensor Tower, State of Gaming 2026</div>
    </div>
  );
}
