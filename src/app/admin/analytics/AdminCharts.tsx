'use client';

import { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

/* ---------- Types ---------- */
interface FunnelStep {
  label: string;
  count: number;
}

interface SectionCount {
  section: string;
  count: number;
}

/* ---------- Funnel Chart ---------- */
export function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  const chartRef = useRef<ChartJS<'bar'>>(null);

  useEffect(() => {
    return () => {
      chartRef.current?.destroy();
    };
  }, []);

  const max = Math.max(...steps.map((s) => s.count), 1);

  return (
    <Bar
      ref={chartRef}
      data={{
        labels: steps.map((s) => s.label),
        datasets: [
          {
            data: steps.map((s) => s.count),
            backgroundColor: steps.map((_, i) => {
              const pct = i / Math.max(steps.length - 1, 1);
              // gradient from green to purple
              return `rgba(${38 + Math.round(pct * 137)}, ${190 - Math.round(pct * 34)}, ${129 + Math.round(pct * 126)}, 0.85)`;
            }),
            borderRadius: 6,
            barPercentage: 0.7,
          },
        ],
      }}
      options={{
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1A1A2E',
            titleFont: { family: 'Poppins' },
            bodyFont: { family: 'Poppins' },
            padding: 12,
            cornerRadius: 8,
          },
          datalabels: {
            anchor: 'end',
            align: 'end',
            color: '#222',
            font: { family: 'Poppins', weight: 'bold', size: 13 },
            formatter: (value: number) => value.toLocaleString(),
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: Math.ceil(max * 1.2),
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { family: 'Poppins', size: 11 } },
          },
          y: {
            grid: { display: false },
            ticks: { font: { family: 'Poppins', size: 12, weight: 600 } },
          },
        },
      }}
      height={280}
    />
  );
}

/* ---------- Section Bar Chart ---------- */
export function SectionChart({ sections }: { sections: SectionCount[] }) {
  const chartRef = useRef<ChartJS<'bar'>>(null);

  useEffect(() => {
    return () => {
      chartRef.current?.destroy();
    };
  }, []);

  const colors = [
    '#26BE81',
    '#af9cff',
    '#00c4c4',
    '#f4cb00',
    '#f48dff',
    '#F87171',
    '#60A5FA',
    '#FBBF24',
    '#34D399',
    '#A78BFA',
  ];

  return (
    <Bar
      ref={chartRef}
      data={{
        labels: sections.map((s) => s.section),
        datasets: [
          {
            data: sections.map((s) => s.count),
            backgroundColor: sections.map(
              (_, i) => colors[i % colors.length]
            ),
            borderRadius: 6,
            barPercentage: 0.65,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1A1A2E',
            titleFont: { family: 'Poppins' },
            bodyFont: { family: 'Poppins' },
            padding: 12,
            cornerRadius: 8,
          },
          datalabels: {
            anchor: 'end',
            align: 'end',
            color: '#222',
            font: { family: 'Poppins', weight: 'bold', size: 12 },
            formatter: (value: number) => value.toLocaleString(),
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Poppins', size: 11 },
              maxRotation: 45,
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { family: 'Poppins', size: 11 } },
          },
        },
      }}
      height={300}
    />
  );
}
