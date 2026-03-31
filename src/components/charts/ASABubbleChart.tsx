'use client';
import { useG2Chart } from '@/hooks/useG2Chart';

const GRN = '#26BE81';
const PUR = '#af9cff';
const CYN = '#00f4f4';
const YLW = '#F4CB00';
const GRY = '#B0B0B0';

const data = [
  { keyword: 'Brand', x: 85, y: 78, size: 18, fill: 'rgba(38,190,129,.6)', stroke: GRN },
  { keyword: 'Generic', x: 90, y: 25, size: 14, fill: 'rgba(175,156,255,.6)', stroke: PUR },
  {
    keyword: 'Competitor',
    x: 55,
    y: 52,
    size: 13,
    fill: 'rgba(0,244,244,.5)',
    stroke: CYN,
  },
  { keyword: 'Long-tail', x: 20, y: 72, size: 9, fill: 'rgba(244,203,0,.5)', stroke: YLW },
  {
    keyword: 'Discovery',
    x: 50,
    y: 30,
    size: 16,
    fill: 'rgba(176,176,176,.5)',
    stroke: GRY,
  },
];

export default function ASABubbleChart() {
  const containerRef = useG2Chart(
    (chart) => {
      chart
        .point()
        .data(data)
        .encode('x', 'x')
        .encode('y', 'y')
        .encode('size', 'size')
        .encode('color', 'keyword')
        .encode('shape', 'point')
        .scale('x', { domain: [0, 100], nice: true })
        .scale('y', { domain: [0, 100], nice: true })
        .scale('size', { range: [12, 40] })
        .scale('color', {
          domain: ['Brand', 'Generic', 'Competitor', 'Long-tail', 'Discovery'],
          range: [
            'rgba(38,190,129,.6)',
            'rgba(175,156,255,.6)',
            'rgba(0,244,244,.5)',
            'rgba(244,203,0,.5)',
            'rgba(176,176,176,.5)',
          ],
        })
        .axis('x', {
          title: 'Search Volume',
          titleFontSize: 11,
          titleFill: '#666',
          labelFontSize: 10,
          labelFill: '#666',
          gridStroke: '#f0f0f0',
        })
        .axis('y', {
          title: 'Conversion Rate',
          titleFontSize: 11,
          titleFill: '#666',
          labelFontSize: 10,
          labelFill: '#666',
          gridStroke: '#f0f0f0',
        })
        .legend('color', {
          position: 'bottom',
          itemMarker: 'circle',
          itemLabelFontSize: 10,
          itemLabelFill: '#666',
          itemSpacing: 14,
        })
        .label({
          text: 'keyword',
          position: 'top',
          fill: '#333',
          fontWeight: 'bold',
          fontSize: 10,
          dy: -6,
        })
        .tooltip(
          (d: { keyword: string; x: number; y: number; size: number }) => ({
            name: d.keyword,
            value: `Vol: ${d.x}, Conv: ${d.y}%, Opp: ${d.size}`,
          })
        )
        .style('stroke', (d: { stroke: string }) => d.stroke)
        .style('lineWidth', 1)
        .state('active', { lineWidth: 3 })
        .state('inactive', { opacity: 0.3 });

      chart.interaction('elementHighlight', { background: true });
    },
    []
  );

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 280 }} />
  );
}
