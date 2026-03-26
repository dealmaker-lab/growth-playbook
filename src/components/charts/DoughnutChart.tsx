'use client';
import { useEffect, useRef } from 'react';
import { Chart } from '@antv/g2';

const GRN = '#26BE81';
const DRK = '#2A2A3E';
const GRY = '#B0B0B0';

const data = [
  { channel: 'Organic', value: 38, color: GRN },
  { channel: 'Paid UA', value: 28, color: DRK },
  { channel: 'Cross-Promotion', value: 15, color: GRY },
  { channel: 'Referral', value: 11, color: '#555' },
  { channel: 'OEM Pre-loads', value: 8, color: '#111' },
];

export default function DoughnutChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;

    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
    });

    chart.coordinate({ type: 'theta', innerRadius: 0.55 });

    chart
      .interval()
      .data(data)
      .transform({ type: 'stackY' })
      .encode('y', 'value')
      .encode('color', 'channel')
      .scale('color', {
        domain: ['Organic', 'Paid UA', 'Cross-Promotion', 'Referral', 'OEM Pre-loads'],
        range: [GRN, DRK, GRY, '#555', '#111'],
      })
      .legend('color', {
        position: 'bottom',
        layout: { justifyContent: 'center' },
        itemMarker: 'circle',
        itemLabelFontSize: 11,
        itemLabelFill: '#666',
        itemSpacing: 16,
      })
      .label({
        text: (d: { value: number }) => d.value + '%',
        position: 'inside',
        fill: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
      })
      .tooltip((d: { channel: string; value: number }) => ({
        name: d.channel,
        value: d.value + '%',
      }))
      .style('stroke', '#fff')
      .style('lineWidth', 1)
      .state('active', { offset: 8 })
      .state('inactive', { opacity: 0.5 });

    chart.interaction('elementHighlight', { background: true });

    chart.render();
    chartRef.current = chart;

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 240 }} />;
}
