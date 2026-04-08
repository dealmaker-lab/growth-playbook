'use client';
import { useG2Chart } from '@/hooks/useG2Chart';

/* ── Colors matching Sensor Tower ── */
const CASUAL = '#7dd3c0';    // teal/green
const MIDCORE = '#c4a4e8';   // purple
const HYBRID = '#8faee0';    // blue
const HYPER = '#f0a882';     // orange/salmon

const genres = ['Casual', 'Mid-core', 'Hybridcasual', 'Hypercasual'];
const colors = [CASUAL, MIDCORE, HYBRID, HYPER];

/* ── Exact data from Sensor Tower State of Gaming 2026, Worldwide ── */
/* Values in BILLIONS. Order: [Casual, Mid-core, Hybridcasual, Hypercasual] */
const DATA = {
  revenue: {
    '2024': [32.67, 44.78, 3.5, 0],
    '2025': [32.74, 44.68, 4.2, 0],
  },
  downloads: {
    '2024': [17.82, 6.1, 6.81, 21.57],
    '2025': [14.35, 5.48, 6.09, 22.05],
  },
  hours: {
    '2024': [136.17, 226.95, 25.6, 51.22],
    '2025': [124.88, 226.65, 27.49, 66.28],
  },
};

/* Short label for inside the bar */
function formatLabel(value: number, metric: string): string {
  if (value === 0) return '';
  if (metric === 'revenue') {
    if (value >= 1) return '$' + value.toFixed(1) + 'B';
    return '$' + Math.round(value * 1000) + 'M';
  }
  if (value >= 1) return value.toFixed(1) + 'B';
  return Math.round(value * 1000) + 'M';
}

/* Exact value for tooltip hover — shows full number with commas */
function formatTooltip(value: number, metric: string): string {
  if (value === 0) return '0';
  const raw = Math.round(value * 1_000_000_000);
  const formatted = raw.toLocaleString('en-US');
  if (metric === 'revenue') return '$' + formatted;
  return formatted;
}

function buildData(metric: string) {
  const d = DATA[metric as keyof typeof DATA];
  const rows: { year: string; genre: string; value: number }[] = [];
  for (const year of ['2024', '2025']) {
    genres.forEach((genre, i) => {
      rows.push({ year, genre, value: d[year as '2024' | '2025'][i] });
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
function MetricChart({ metric }: { metric: string }) {
  const containerRef = useG2Chart(
    (chart) => {
      const data = buildData(metric);

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
          labelFormatter: (v: number) => formatLabel(v, metric),
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
            const total = data.filter((r) => r.year === '2024').reduce((s, r) => s + r.value, 0);
            if (d.value < total * 0.03) return '';
            return formatLabel(d.value, metric);
          },
          position: 'inside',
          fill: '#fff',
          fontWeight: 'bold',
          fontSize: 8,
        })
        .tooltip((d: { genre: string; value: number }) => ({
          name: d.genre,
          value: formatTooltip(d.value, metric),
        }))
        .style('radiusTopLeft', 2)
        .style('radiusTopRight', 2)
        .state('active', { stroke: '#fff', lineWidth: 1 })
        .state('inactive', { opacity: 0.4 });

      chart.interaction('elementHighlight', { background: true });
    },
    [metric],
    { buildData: () => buildData(metric), height: 260 }
  );

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '.85rem', textAlign: 'center', color: '#222', marginBottom: '8px' }}>{LABELS[metric]}</div>
      <div ref={containerRef} style={{ width: '100%', height: 260 }} />
    </div>
  );
}

/* ── Panel with 3 charts side by side ── */
export default function AnnualTrendsPanel() {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '1.05rem', textAlign: 'center', color: '#222', marginBottom: '4px' }}>
        Annual Trends for Mobile Games by Product Model
      </div>
      <div style={{ textAlign: 'center', fontSize: '.78rem', color: '#999', marginBottom: '16px' }}>Worldwide</div>
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
        <MetricChart metric="revenue" />
        <MetricChart metric="downloads" />
        <MetricChart metric="hours" />
      </div>
      <div style={{ textAlign: 'center', fontSize: '.7rem', color: '#999', marginTop: '8px' }}>Source: Sensor Tower, State of Gaming 2026</div>
    </div>
  );
}
