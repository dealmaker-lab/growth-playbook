'use client';

import type { Chart } from '@antv/g2';
import { useG2Chart } from '@/hooks/useG2Chart';

// US "Annual Trends for Mobile Games by Product Model" (Sensor Tower, 2024 vs 2025).
// Two stacked columns: IAP Revenue ($B) and Downloads (B), split by product model.
// The story: Casual + Mid-core dominate IAP revenue, while Hypercasual drives
// download volume yet contributes almost nothing to spend.

const MODELS = ['Casual', 'Mid-core', 'Hybridcasual', 'Hypercasual'] as const;

const MODEL_COLORS: Record<string, string> = {
  Casual: '#26BE81',
  'Mid-core': '#b56bf2',
  Hybridcasual: '#6C8BF5',
  Hypercasual: '#F2876B',
};

const IAP_DATA = [
  { year: '2024', model: 'Casual', value: 14.5 },
  { year: '2024', model: 'Mid-core', value: 9.5 },
  { year: '2024', model: 'Hybridcasual', value: 1.5 },
  { year: '2024', model: 'Hypercasual', value: 0.1 },
  { year: '2025', model: 'Casual', value: 14.0 },
  { year: '2025', model: 'Mid-core', value: 9.0 },
  { year: '2025', model: 'Hybridcasual', value: 2.0 },
  { year: '2025', model: 'Hypercasual', value: 0.1 },
];

const DOWNLOAD_DATA = [
  { year: '2024', model: 'Casual', value: 1.5 },
  { year: '2024', model: 'Mid-core', value: 0.5 },
  { year: '2024', model: 'Hybridcasual', value: 0.5 },
  { year: '2024', model: 'Hypercasual', value: 1.5 },
  { year: '2025', model: 'Casual', value: 1.3 },
  { year: '2025', model: 'Mid-core', value: 0.4 },
  { year: '2025', model: 'Hybridcasual', value: 0.5 },
  { year: '2025', model: 'Hypercasual', value: 1.3 },
];

function buildConfig(
  data: typeof IAP_DATA,
  yTitle: string,
  fmt: (v: number) => string
) {
  return (chart: Chart) => {
    chart
      .interval()
      .data(data)
      .encode('x', 'year')
      .encode('y', 'value')
      .encode('color', 'model')
      .transform({ type: 'stackY' })
      .scale('color', {
        domain: [...MODELS],
        range: MODELS.map((m) => MODEL_COLORS[m]),
      })
      .axis('y', { title: yTitle, labelFill: '#666', labelFontSize: 11, titleFontSize: 11 })
      .axis('x', { labelFill: '#666', labelFontSize: 11 })
      .legend('color', { position: 'top', flipPage: false })
      .tooltip((d: { model: string; value: number }) => ({ name: d.model, value: fmt(d.value) }))
      .style('radiusTopLeft', 2)
      .style('radiusTopRight', 2)
      .interaction('elementHighlight', { background: true });
  };
}

export default function USAnnualTrendsChart() {
  const iapRef = useG2Chart(buildConfig(IAP_DATA, 'IAP Revenue ($B)', (v) => `$${v}B`));
  const downloadRef = useG2Chart(buildConfig(DOWNLOAD_DATA, 'Downloads (B)', (v) => `${v}B`));

  return (
    <div className="dual-chart-grid">
      <div>
        <div className="dual-chart-title">IAP Revenue</div>
        <div ref={iapRef} style={{ width: '100%', height: '280px' }} />
      </div>
      <div>
        <div className="dual-chart-title">Downloads</div>
        <div ref={downloadRef} style={{ width: '100%', height: '280px' }} />
      </div>
    </div>
  );
}
