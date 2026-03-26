'use client';
import { useEffect, useRef } from 'react';
import { Chart } from '@antv/g2';

const GRN = '#26BE81';

const data = [
  { year: '2022', value: 1.2, projected: false },
  { year: '2023', value: 1.5, projected: false },
  { year: '2024', value: 1.8, projected: false },
  { year: '2025', value: 2.0, projected: false },
  { year: '2026', value: 2.2, projected: true },
  { year: '2028', value: 2.4, projected: true },
  { year: '2030', value: 2.7, projected: true },
];

export default function ProgrammaticChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;

    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
      height: 280,
    });

    chart
      .interval()
      .data(data)
      .encode('x', 'year')
      .encode('y', 'value')
      .encode('color', (d: { projected: boolean }) => d.projected ? 'Projected' : 'Actual')
      .scale('color', {
        domain: ['Actual', 'Projected'],
        range: ['rgba(38,190,129,.4)', GRN],
      })
      .axis('y', {
        labelFormatter: (v: number) => '$' + v + 'B',
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
      .label({
        text: (d: { value: number }) => '$' + d.value + 'B',
        position: 'top',
        fill: '#666',
        fontWeight: 'bold',
        fontSize: 10,
        dy: -4,
      })
      .tooltip((d: { year: string; value: number }) => ({
        name: 'Market Size',
        value: '$' + d.value + 'B',
      }))
      .legend(false)
      .style('radiusTopLeft', 4)
      .style('radiusTopRight', 4)
      .style('maxWidth', 40)
      .state('active', { fill: GRN })
      .state('inactive', { opacity: 0.5 });

    chart.interaction('elementHighlight', { background: true });

    chart.render();
    chartRef.current = chart;

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: 280, maxHeight: 300 }} />;
}
