'use client';
import { useEffect, useRef } from 'react';
import { Chart } from '@antv/g2';

const data = [
  { year: '2024', type: 'Image', value: 48.9 },
  { year: '2024', type: 'Playable', value: 6.3 },
  { year: '2024', type: 'Video', value: 44.9 },
  { year: '2025', type: 'Image', value: 33.0 },
  { year: '2025', type: 'Playable', value: 13.3 },
  { year: '2025', type: 'Video', value: 53.7 },
];

export default function AdTypesChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;

    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
      height: 260,
    });

    chart
      .interval()
      .data(data)
      .encode('x', 'year')
      .encode('y', 'value')
      .encode('color', 'type')
      .transform({ type: 'stackY' })
      .scale('color', {
        domain: ['Image', 'Playable', 'Video'],
        range: ['#7C8CF8', '#C084FC', '#5DE5C5'],
      })
      .scale('y', { domain: [0, 100] })
      .axis('y', {
        labelFormatter: (v: number) => v + '%',
        labelFontSize: 11,
        labelFill: '#666',
        gridStroke: '#f0f0f0',
        title: false,
      })
      .axis('x', {
        labelFontSize: 13,
        labelFontWeight: 'bold',
        labelFill: '#666',
        grid: false,
        title: false,
      })
      .legend('color', {
        position: 'top',
        itemMarker: 'circle',
        itemLabelFontSize: 12,
        itemLabelFontWeight: 'bold',
        itemLabelFill: '#666',
        itemSpacing: 18,
      })
      .label({
        text: (d: { value: number }) => d.value + '%',
        position: 'inside',
        fill: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
      })
      .tooltip((d: { type: string; value: number; year: string }) => ({
        name: d.type,
        value: d.value + '%',
      }))
      .state('active', { stroke: '#fff', lineWidth: 1 })
      .state('inactive', { opacity: 0.4 });

    chart.interaction('elementHighlight', { background: true });

    chart.render();
    chartRef.current = chart;

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: 260, maxWidth: 500, margin: '0 auto' }} />;
}
