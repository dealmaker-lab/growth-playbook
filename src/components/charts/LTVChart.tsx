'use client';
import { useEffect, useRef } from 'react';
import { Chart } from '@antv/g2';

const GRN = '#26BE81';
const PUR = '#af9cff';
const GRY = '#B0B0B0';

const data = [
  { period: 'D7 LTV', model: 'Rewarded Playtime', value: 4.2 },
  { period: 'D7 LTV', model: 'Traditional Offerwall', value: 2.1 },
  { period: 'D7 LTV', model: 'Incentivized Install', value: 1.5 },
  { period: 'D30 LTV', model: 'Rewarded Playtime', value: 8.5 },
  { period: 'D30 LTV', model: 'Traditional Offerwall', value: 3.8 },
  { period: 'D30 LTV', model: 'Incentivized Install', value: 2.2 },
  { period: 'D90 LTV', model: 'Rewarded Playtime', value: 14.8 },
  { period: 'D90 LTV', model: 'Traditional Offerwall', value: 5.2 },
  { period: 'D90 LTV', model: 'Incentivized Install', value: 3.1 },
];

export default function LTVChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;

    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
    });

    chart.coordinate({ transform: [{ type: 'transpose' }] });

    chart
      .interval()
      .data(data)
      .encode('x', 'period')
      .encode('y', 'value')
      .encode('color', 'model')
      .transform({ type: 'dodgeX' })
      .scale('color', {
        domain: ['Rewarded Playtime', 'Traditional Offerwall', 'Incentivized Install'],
        range: [GRN, PUR, GRY],
      })
      .axis('x', {
        labelFontSize: 10,
        labelFill: '#666',
        grid: false,
        title: false,
      })
      .axis('y', {
        labelFormatter: (v: number) => '$' + v,
        labelFontSize: 10,
        labelFill: '#666',
        gridStroke: '#f0f0f0',
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
        text: (d: { value: number }) => '$' + d.value.toFixed(2),
        position: 'right',
        fill: '#666',
        fontWeight: 'bold',
        fontSize: 10,
        dx: 4,
      })
      .tooltip((d: { model: string; value: number; period: string }) => ({
        name: d.model,
        value: '$' + d.value.toFixed(2),
      }))
      .style('radiusTopRight', 3)
      .style('radiusBottomRight', 3)
      .state('active', { linkFill: 'rgba(0,0,0,0.05)' })
      .state('inactive', { opacity: 0.4 });

    chart.interaction('elementHighlight', { background: true });

    chart.render();
    chartRef.current = chart;

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 220 }} />;
}
