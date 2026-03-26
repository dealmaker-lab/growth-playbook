'use client';
import { useEffect, useRef } from 'react';
import { Chart } from '@antv/g2';

const GRN = '#26BE81';
const PUR = '#af9cff';
const CYN = '#00f4f4';
const YLW = '#F4CB00';
const RED = '#F87171';

const data = [
  { format: 'PAI (Pre-loaded)', metric: 'Reach', value: 9 },
  { format: 'PAI (Pre-loaded)', metric: 'Cost Efficiency', value: 7 },
  { format: 'PAI (Pre-loaded)', metric: 'User Intent', value: 6 },
  { format: 'PAI (Pre-loaded)', metric: 'Conversion Rate', value: 8 },
  { format: 'PAI (Pre-loaded)', metric: 'Brand Safety', value: 9 },
  { format: 'Icon Placement', metric: 'Reach', value: 7 },
  { format: 'Icon Placement', metric: 'Cost Efficiency', value: 8 },
  { format: 'Icon Placement', metric: 'User Intent', value: 5 },
  { format: 'Icon Placement', metric: 'Conversion Rate', value: 6 },
  { format: 'Icon Placement', metric: 'Brand Safety', value: 8 },
  { format: 'Splash Screen', metric: 'Reach', value: 6 },
  { format: 'Splash Screen', metric: 'Cost Efficiency', value: 5 },
  { format: 'Splash Screen', metric: 'User Intent', value: 7 },
  { format: 'Splash Screen', metric: 'Conversion Rate', value: 7 },
  { format: 'Splash Screen', metric: 'Brand Safety', value: 6 },
  { format: 'Push Notification', metric: 'Reach', value: 5 },
  { format: 'Push Notification', metric: 'Cost Efficiency', value: 6 },
  { format: 'Push Notification', metric: 'User Intent', value: 8 },
  { format: 'Push Notification', metric: 'Conversion Rate', value: 5 },
  { format: 'Push Notification', metric: 'Brand Safety', value: 5 },
];

export default function OEMFormatChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;

    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
      height: 300,
    });

    chart.coordinate({ transform: [{ type: 'transpose' }] });

    chart
      .interval()
      .data(data)
      .encode('x', 'format')
      .encode('y', 'value')
      .encode('color', 'metric')
      .transform({ type: 'dodgeX' })
      .scale('color', {
        domain: ['Reach', 'Cost Efficiency', 'User Intent', 'Conversion Rate', 'Brand Safety'],
        range: [GRN, PUR, CYN, YLW, RED],
      })
      .scale('y', { domain: [0, 10] })
      .axis('y', {
        labelFormatter: (v: number) => v + '/10',
        labelFontSize: 10,
        labelFill: '#666',
        gridStroke: '#f0f0f0',
        title: false,
      })
      .axis('x', {
        labelFontSize: 11,
        labelFontWeight: 'bold',
        labelFill: '#444',
        grid: false,
        title: false,
      })
      .legend('color', {
        position: 'bottom',
        itemMarker: 'circle',
        itemLabelFontSize: 10,
        itemLabelFill: '#666',
        itemSpacing: 12,
      })
      .label({
        text: (d: { value: number }) => d.value + '/10',
        position: 'right',
        fill: '#666',
        fontWeight: 'bold',
        fontSize: 9,
        dx: 4,
      })
      .tooltip((d: { metric: string; value: number; format: string }) => ({
        name: d.metric,
        value: d.value + '/10',
      }))
      .style('radiusTopRight', 3)
      .style('radiusBottomRight', 3)
      .state('active', { stroke: '#fff', lineWidth: 1 })
      .state('inactive', { opacity: 0.3 });

    chart.interaction('elementHighlight', { background: true });

    chart.render();
    chartRef.current = chart;

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: 300 }} />;
}
