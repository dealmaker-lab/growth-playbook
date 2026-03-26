'use client';
import { Chart } from '@antv/g2';
import { useEffect, useRef } from 'react';

export default function TapNationChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;

    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
      height: 220,
    });

    chart.options({
      type: 'interval',
      data: [
        { channel: 'OEM Discovery', share: 45 },
        { channel: 'Programmatic', share: 35 },
        { channel: 'Organic Uplift', share: 20 },
      ],
      encode: { x: 'channel', y: 'share', color: 'channel' },
      transform: [{ type: 'stackY' }],
      coordinate: { type: 'theta', innerRadius: 0.55 },
      scale: {
        color: {
          domain: ['OEM Discovery', 'Programmatic', 'Organic Uplift'],
          range: ['#af9cff', '#26BE81', '#B0B0B0'],
        },
      },
      style: { stroke: '#fff', lineWidth: 2 },
      legend: { color: { position: 'bottom', layout: { justifyContent: 'center' } } },
      labels: [
        {
          text: 'share',
          position: 'outside',
          formatter: (v: number) => v + '%',
          style: { fontSize: 12, fontWeight: 'bold' },
        },
      ],
      tooltip: {
        title: 'channel',
        items: [{ channel: 'y', valueFormatter: (v: number) => v + '%' }],
      },
      interaction: { elementHighlight: { background: true } },
    });

    chart.render();
    chartRef.current = chart;

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: 220 }} />;
}
