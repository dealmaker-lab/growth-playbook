'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);

/* ── Chart color constants ── */
const GRN = '#26BE81';
const DRK = '#2A2A3E';
const GRY = '#B0B0B0';
const PUR = '#af9cff';
const BLU = '#3B82F6';
const CYN = '#00f4f4';
const RED = '#F87171';

/* ── Retention data ── */
const retSeries: Record<string, Record<string, number[]>> = {
  d1: {
    'Mid-core': [48, 46, 45, 44, 43, 42, 41, 40],
    Hybridcasual: [52, 50, 48, 47, 46, 45, 44, 43],
    Hypercasual: [45, 42, 40, 38, 36, 35, 34, 33],
    Casual: [40, 37, 35, 33, 31, 30, 29, 28],
  },
  d7: {
    'Mid-core': [42, 40, 39, 38, 37, 36, 35, 34],
    Hybridcasual: [44, 43, 42, 41, 40, 39, 38, 37],
    Hypercasual: [40, 38, 36, 35, 33, 32, 31, 30],
    Casual: [35, 33, 31, 29, 28, 27, 26, 25],
  },
  d30: {
    'Mid-core': [32, 30, 28, 27, 26, 25, 24, 23],
    Hybridcasual: [35, 33, 31, 30, 28, 27, 26, 25],
    Hypercasual: [28, 26, 24, 22, 21, 20, 19, 18],
    Casual: [25, 23, 21, 19, 18, 17, 16, 15],
  },
  d365: {
    'Mid-core': [18, 17, 16, 15, 14, 14, 13, 12],
    Hybridcasual: [20, 19, 18, 17, 16, 15, 14, 13],
    Hypercasual: [12, 11, 10, 9, 9, 8, 8, 7],
    Casual: [10, 9, 8, 7, 7, 6, 6, 5],
  },
};
const retC: Record<string, string> = {
  'Mid-core': RED,
  Hybridcasual: PUR,
  Hypercasual: BLU,
  Casual: GRN,
};
const retYRange: Record<string, { min: number; max: number }> = {
  d1: { min: 20, max: 55 },
  d7: { min: 20, max: 50 },
  d30: { min: 10, max: 40 },
  d365: { min: 0, max: 25 },
};

/* ── Trends data ── */
const trendData: Record<string, Record<string, number[]>> = {
  revenue: { '2024': [30, 28, 12, 8], '2025': [35, 32, 16, 9] },
  downloads: { '2024': [48, 22, 15, 12], '2025': [42, 25, 18, 10] },
  sessions: { '2024': [1.8, 1.2, 0.8, 0.5], '2025': [2.1, 1.4, 1.0, 0.6] },
};
const trendUnits: Record<string, { pre: string; suf: string }> = {
  revenue: { pre: '$', suf: 'B' },
  downloads: { pre: '', suf: 'B' },
  sessions: { pre: '', suf: 'T' },
};

interface PlaybookContentProps {
  initialUnlocked: boolean;
}

export default function PlaybookContent({
  initialUnlocked,
}: PlaybookContentProps) {
  const [gateUnlocked, setGateUnlocked] = useState(initialUnlocked);
  const [gateLoading, setGateLoading] = useState(false);
  const [gateError, setGateError] = useState<string | false>(false);
  const [gateSuccess, setGateSuccess] = useState(false);
  const [gateLiftingDone, setGateLiftingDone] = useState(false);
  const [retTab, setRetTab] = useState('d7');
  const [trendTab, setTrendTab] = useState('revenue');
  const [chartsReady, setChartsReady] = useState(false);
  const [gatedChartsReady, setGatedChartsReady] = useState(false);

  const lastY = useRef(0);
  const sessionId = useRef('');
  const maxScrollDepth = useRef(0);
  const retInstRef = useRef<Chart | null>(null);
  const trendInstRef = useRef<Chart | null>(null);
  const chartsInitRef = useRef(false);
  const gatedChartsInitRef = useRef(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const gateFormRef = useRef<HTMLDivElement>(null);

  /* ── Analytics ── */
  const trackEvent = useCallback((event_type: string, section?: string, metadata?: Record<string, unknown>) => {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId.current, event_type, section, metadata }),
    }).catch(() => {}); // fire and forget
  }, []);

  /* ── Analytics: page_view + scroll_depth on beforeunload ── */
  useEffect(() => {
    sessionId.current = crypto.randomUUID();
    trackEvent('page_view');

    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = Math.max(0, Math.min(100, Math.round((scrollTop / docHeight) * 100)));
      if (pct > maxScrollDepth.current) maxScrollDepth.current = pct;
    }

    function handleBeforeUnload() {
      trackEvent('scroll_depth', undefined, { max_percent: maxScrollDepth.current });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [trackEvent]);

  /* ── Analytics: section_view via IntersectionObserver ── */
  useEffect(() => {
    const sectionIds = ['hero', 'toc', 'ch1', 'ch2', 'ch3', 'ch4', 'emailGate', 'about'];
    const seen = new Set<string>();
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !seen.has(entry.target.id)) {
          seen.add(entry.target.id);
          const label = entry.target.id === 'emailGate' ? 'gate' : entry.target.id;
          trackEvent('section_view', label);
        }
      });
    }, { threshold: 0.1 });
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    // Also observe calculator section if it exists
    const calcEl = document.getElementById('calculatorTeaser');
    if (calcEl) obs.observe(calcEl);
    return () => obs.disconnect();
  }, [trackEvent]);

  /* ── Rich HTML Tooltip ── */
  const externalTooltipHandler = useCallback(
    (context: { tooltip: any; chart: any }) => {
      let el = document.getElementById('chartTooltip');
      if (!el) {
        el = document.createElement('div');
        el.id = 'chartTooltip';
        el.className = 'chart-tooltip';
        document.body.appendChild(el);
      }
      const tooltip = context.tooltip;
      if (tooltip.opacity === 0) {
        el.classList.remove('show');
        return;
      }
      let html = '<div class="tt-title">' + tooltip.title[0] + '</div>';
      tooltip.body.forEach((b: any, i: number) => {
        const colors = tooltip.labelColors[i];
        html += `<div class="tt-row"><span class="tt-dot" style="background:${colors.backgroundColor}"></span>${b.lines[0]}</div>`;
      });
      el.innerHTML = html;
      el.classList.add('show');
      const pos = context.chart.canvas.getBoundingClientRect();
      el.style.left = pos.left + tooltip.caretX + 'px';
      el.style.top =
        pos.top + tooltip.caretY - el.offsetHeight - 10 + 'px';
    },
    []
  );

  /* ── Init pre-gate charts ── */
  const initAllCharts = useCallback(() => {
    if (chartsInitRef.current) return;
    chartsInitRef.current = true;

    const tooltipOpts = {
      enabled: false,
      external: externalTooltipHandler,
      position: 'nearest' as const,
    };

    // Configure Chart.js defaults
    Chart.defaults.font.family = "'Poppins',sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.animation = { duration: 1000, easing: 'easeOutQuart' as const };
    Chart.defaults.plugins.datalabels = { display: false } as any;

    /* Doughnut */
    const cD = document.getElementById('chartDoughnut') as HTMLCanvasElement;
    if (cD) {
      new Chart(cD, {
        type: 'doughnut',
        data: {
          labels: [
            'Organic',
            'Paid UA',
            'Cross-Promotion',
            'Referral',
            'OEM Pre-loads',
          ],
          datasets: [
            {
              data: [38, 28, 15, 11, 8],
              backgroundColor: [GRN, DRK, GRY, '#555', '#111'],
              borderWidth: 0,
              hoverOffset: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '55%',
          plugins: {
            tooltip: tooltipOpts,
            legend: {
              position: 'bottom',
              labels: {
                padding: 16,
                usePointStyle: true,
                pointStyle: 'circle',
                font: { size: 11 },
                color: '#666',
              },
            },
            datalabels: {
              display: true,
              color: '#fff',
              font: { weight: 'bold', size: 12 },
              formatter: (v: number) => v + '%',
            },
          },
        },
      });
    }

    /* Programmatic Market Growth */
    const cP2 = document.getElementById(
      'chartProgrammatic'
    ) as HTMLCanvasElement;
    if (cP2) {
      new Chart(cP2, {
        type: 'bar',
        data: {
          labels: ['2022', '2023', '2024', '2025', '2026', '2028', '2030'],
          datasets: [
            {
              label: 'Market Size ($B)',
              data: [1.2, 1.5, 1.8, 2.0, 2.2, 2.4, 2.7],
              backgroundColor: function (ctx: any) {
                return ctx.dataIndex >= 4 ? GRN : 'rgba(38,190,129,.4)';
              },
              borderRadius: 4,
              barPercentage: 0.65,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            tooltip: tooltipOpts,
            legend: { display: false },
            datalabels: {
              display: true,
              anchor: 'end',
              align: 'end',
              color: '#666',
              font: { weight: 'bold', size: 10 },
              formatter: (v: number) => '$' + v + 'B',
            },
          },
          scales: {
            y: {
              ticks: {
                callback: (v: any) => '$' + v + 'B',
                font: { size: 10 },
                color: '#666',
              },
              grid: { color: '#f0f0f0' },
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 }, color: '#666' },
            },
          },
        },
      });
    }

    /* Paycell */
    const cP = document.getElementById('chartPaycell') as HTMLCanvasElement;
    if (cP) {
      new Chart(cP, {
        type: 'bar',
        data: {
          labels: ['CPI', 'ROAS D7', 'ROAS D30', 'Retention D7'],
          datasets: [
            {
              label: 'Before',
              data: [2.8, 85, 120, 28],
              backgroundColor: 'rgba(255,255,255,.08)',
              borderRadius: 3,
              barPercentage: 0.55,
            },
            {
              label: 'After',
              data: [1.9, 145, 210, 42],
              backgroundColor: GRN,
              borderRadius: 3,
              barPercentage: 0.55,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            tooltip: tooltipOpts,
            legend: {
              position: 'top',
              labels: {
                color: 'rgba(255,255,255,.5)',
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 10,
                font: { size: 10 },
              },
            },
            datalabels: {
              display: true,
              anchor: 'end',
              align: 'end',
              color: 'rgba(255,255,255,.7)',
              font: { weight: 'bold', size: 10 },
            },
          },
          scales: {
            y: {
              ticks: {
                color: 'rgba(255,255,255,.35)',
                font: { size: 10 },
              },
              grid: { color: 'rgba(255,255,255,.04)' },
            },
            x: {
              ticks: {
                color: 'rgba(255,255,255,.35)',
                font: { size: 10 },
              },
              grid: { display: false },
            },
          },
        },
      });
    }

    /* DSP Budget Flow — Grouped Bar (Ch1) */
    const cBF = document.getElementById('chartBudgetFlow') as HTMLCanvasElement;
    if (cBF) {
      new Chart(cBF, {
        type: 'bar',
        data: {
          labels: ['Programmatic', 'Social', 'Search', 'OEM'],
          datasets: [
            {
              label: 'Traditional',
              data: [35, 40, 25, 0],
              backgroundColor: 'rgba(38,190,129,.4)',
              borderRadius: 3,
              barPercentage: 0.6,
            },
            {
              label: 'Optimized',
              data: [50, 25, 15, 10],
              backgroundColor: [GRN, PUR, BLU, CYN],
              borderRadius: 3,
              barPercentage: 0.6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            tooltip: tooltipOpts,
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 11 }, color: '#666' } },
            datalabels: { display: true, anchor: 'end', align: 'end', color: '#666', font: { weight: 'bold', size: 10 }, formatter: (v: number) => v + '%' },
          },
          scales: {
            y: { ticks: { callback: (v: any) => v + '%', font: { size: 10 }, color: '#666' }, grid: { color: '#f0f0f0' } },
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#666' } },
          },
        },
      });
    }

    /* LTV Comparison Teaser — Horizontal Bar (pre-gate) */
    const cLTVt = document.getElementById('chartLTVTeaser') as HTMLCanvasElement;
    if (cLTVt) {
      new Chart(cLTVt, {
        type: 'bar',
        data: {
          labels: ['D7 LTV', 'D30 LTV', 'D90 LTV'],
          datasets: [
            { label: 'Rewarded Playtime', data: [4.2, 8.5, 14.8], backgroundColor: GRN, borderRadius: 3, barPercentage: 0.5, categoryPercentage: 0.7 },
            { label: 'Traditional Offerwall', data: [2.1, 3.8, 5.2], backgroundColor: PUR, borderRadius: 3, barPercentage: 0.5, categoryPercentage: 0.7 },
            { label: 'Incentivized Install', data: [1.5, 2.2, 3.1], backgroundColor: GRY, borderRadius: 3, barPercentage: 0.5, categoryPercentage: 0.7 },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            tooltip: tooltipOpts,
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 12, font: { size: 10 }, color: '#666' } },
            datalabels: { display: true, anchor: 'end', align: 'end', color: '#666', font: { weight: 'bold', size: 10 }, formatter: (v: number) => '$' + v.toFixed(2) },
          },
          scales: {
            x: { ticks: { callback: (v: any) => '$' + v, font: { size: 10 }, color: '#666' }, grid: { color: '#f0f0f0' } },
            y: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#666' } },
          },
        },
      });
    }

    /* Ad Type Impression Share */
    const cAT = document.getElementById('chartAdTypes') as HTMLCanvasElement;
    if (cAT) {
      new Chart(cAT, {
        type: 'bar',
        data: {
          labels: ['2024', '2025'],
          datasets: [
            {
              label: 'Image',
              data: [48.9, 33.0],
              backgroundColor: '#7C8CF8',
              borderRadius: 2,
              barPercentage: 0.7,
              categoryPercentage: 0.6,
            },
            {
              label: 'Playable',
              data: [6.3, 13.3],
              backgroundColor: '#C084FC',
              borderRadius: 0,
              barPercentage: 0.7,
              categoryPercentage: 0.6,
            },
            {
              label: 'Video',
              data: [44.9, 53.7],
              backgroundColor: '#5DE5C5',
              borderRadius: 2,
              barPercentage: 0.7,
              categoryPercentage: 0.6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: tooltipOpts,
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 18,
                font: { size: 12, weight: 'bold' },
                color: '#666',
              },
            },
            datalabels: {
              display: true,
              color: '#fff',
              font: { size: 13, weight: 'bold' },
              formatter: (v: number) => v + '%',
            },
          },
          scales: {
            x: {
              stacked: true,
              grid: { display: false },
              ticks: { font: { size: 13, weight: 'bold' }, color: '#666' },
            },
            y: {
              stacked: true,
              max: 100,
              ticks: {
                callback: (v: any) => v + '%',
                font: { size: 11 },
                color: '#666',
              },
              grid: { color: '#f0f0f0' },
            },
          },
        },
      });
    }

    setChartsReady(true);
  }, [externalTooltipHandler]);

  /* ── Init gated charts ── */
  const initGatedCharts = useCallback(() => {
    if (gatedChartsInitRef.current) return;
    gatedChartsInitRef.current = true;

    const tooltipOpts = {
      enabled: false,
      external: externalTooltipHandler,
      position: 'nearest' as const,
    };

    /* Genre stacked */
    const cG = document.getElementById('chartGenre') as HTMLCanvasElement;
    if (cG) {
      new Chart(cG, {
        type: 'bar',
        data: {
          labels: ['Casual', 'Mid-core', 'Hybridcasual', 'Hypercasual'],
          datasets: [
            {
              label: 'Casual',
              data: [22.9, 34.0, 15.5, 19.2],
              backgroundColor: GRN,
              borderRadius: 0,
              barPercentage: 0.6,
              categoryPercentage: 0.8,
            },
            {
              label: 'Mid-core',
              data: [23.4, 29.6, 24.3, 31.5],
              backgroundColor: DRK,
              borderRadius: 0,
              barPercentage: 0.6,
              categoryPercentage: 0.8,
            },
            {
              label: 'Hybridcasual',
              data: [35.9, 28.8, 50.6, 41.7],
              backgroundColor: PUR,
              borderRadius: 0,
              barPercentage: 0.6,
              categoryPercentage: 0.8,
            },
            {
              label: 'Hypercasual',
              data: [6.6, 6.8, 5.0, 5.4],
              backgroundColor: GRY,
              borderRadius: 0,
              barPercentage: 0.6,
              categoryPercentage: 0.8,
            },
            {
              label: 'Other',
              data: [11.2, 0.8, 4.6, 2.2],
              backgroundColor: 'rgba(38,190,129,.5)',
              borderRadius: 0,
              barPercentage: 0.6,
              categoryPercentage: 0.8,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: tooltipOpts,
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 12,
                font: { size: 10 },
                color: '#666',
              },
            },
            datalabels: {
              display: true,
              color: '#fff',
              font: { size: 9, weight: 'bold' },
              formatter: (v: number) => (v > 5 ? v + '%' : ''),
            },
          },
          scales: {
            x: {
              stacked: true,
              max: 100,
              ticks: {
                callback: (v: any) => v + '%',
                font: { size: 10 },
                color: '#666',
              },
              grid: { color: '#f0f0f0' },
            },
            y: {
              stacked: true,
              grid: { display: false },
              ticks: { font: { size: 10 }, color: '#666' },
            },
          },
        },
      });
    }

    /* Market Share */
    const cM = document.getElementById(
      'chartMarketShare'
    ) as HTMLCanvasElement;
    if (cM) {
      const yrs = [
        '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
        '20', '21', '22', '23', '24',
      ];
      new Chart(cM, {
        type: 'bar',
        data: {
          labels: yrs,
          datasets: [
            {
              label: 'iOS',
              data: [
                35, 25, 23, 35, 28, 25, 23, 22, 21, 20, 22, 27, 27, 28,
                29, 29,
              ],
              backgroundColor: BLU,
              borderRadius: 1,
              barPercentage: 0.65,
              categoryPercentage: 0.8,
            },
            {
              label: 'Android',
              data: [
                3, 10, 20, 28, 30, 55, 65, 68, 72, 76, 77, 73, 72, 71,
                71, 71,
              ],
              backgroundColor: CYN,
              borderRadius: 1,
              barPercentage: 0.65,
              categoryPercentage: 0.8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: tooltipOpts,
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 14,
                font: { size: 10 },
                color: '#666',
              },
            },
            datalabels: { display: false },
          },
          scales: {
            y: {
              max: 80,
              ticks: {
                callback: (v: any) => v + '%',
                font: { size: 10 },
                color: '#666',
              },
              grid: { color: '#f0f0f0' },
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 9 }, color: '#666' },
            },
          },
        },
      });
    }

    /* TapNation */
    const cT = document.getElementById('chartTapNation') as HTMLCanvasElement;
    if (cT) {
      new Chart(cT, {
        type: 'doughnut',
        data: {
          labels: ['OEM Discovery', 'Programmatic', 'Organic Uplift'],
          datasets: [
            {
              data: [45, 35, 20],
              backgroundColor: [PUR, GRN, 'rgba(255,255,255,.08)'],
              borderWidth: 0,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '55%',
          plugins: {
            tooltip: tooltipOpts,
            legend: {
              position: 'bottom',
              labels: {
                color: 'rgba(255,255,255,.45)',
                padding: 12,
                usePointStyle: true,
                pointStyle: 'circle',
                font: { size: 10 },
              },
            },
            datalabels: {
              display: true,
              color: '#fff',
              font: { weight: 'bold', size: 12 },
              formatter: (v: number) => v + '%',
            },
          },
        },
      });
    }

    /* LTV Comparison Full — Horizontal Bar (Ch2 gated) */
    const cLTV = document.getElementById('chartLTVFull') as HTMLCanvasElement;
    if (cLTV) {
      new Chart(cLTV, {
        type: 'bar',
        data: {
          labels: ['D7 LTV', 'D30 LTV', 'D90 LTV'],
          datasets: [
            { label: 'Rewarded Playtime', data: [4.2, 8.5, 14.8], backgroundColor: GRN, borderRadius: 3, barPercentage: 0.5, categoryPercentage: 0.7 },
            { label: 'Traditional Offerwall', data: [2.1, 3.8, 5.2], backgroundColor: PUR, borderRadius: 3, barPercentage: 0.5, categoryPercentage: 0.7 },
            { label: 'Incentivized Install', data: [1.5, 2.2, 3.1], backgroundColor: GRY, borderRadius: 3, barPercentage: 0.5, categoryPercentage: 0.7 },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            tooltip: tooltipOpts,
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 12, font: { size: 10 }, color: '#666' } },
            datalabels: { display: true, anchor: 'end', align: 'end', color: '#666', font: { weight: 'bold', size: 10 }, formatter: (v: number) => '$' + v.toFixed(2) },
          },
          scales: {
            x: { ticks: { callback: (v: any) => '$' + v, font: { size: 10 }, color: '#666' }, grid: { color: '#f0f0f0' } },
            y: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#666' } },
          },
        },
      });
    }

    /* OEM Format Radar (Ch3) */
    const cRadar = document.getElementById('chartOEMRadar') as HTMLCanvasElement;
    if (cRadar) {
      new Chart(cRadar, {
        type: 'radar',
        data: {
          labels: ['Reach', 'Cost Efficiency', 'User Intent', 'Conversion Rate', 'Brand Safety'],
          datasets: [
            { label: 'PAI', data: [9, 7, 6, 8, 9], borderColor: GRN, backgroundColor: 'rgba(38,190,129,.15)', pointBackgroundColor: GRN, borderWidth: 2 },
            { label: 'Icon Placement', data: [7, 8, 5, 6, 8], borderColor: PUR, backgroundColor: 'rgba(175,156,255,.15)', pointBackgroundColor: PUR, borderWidth: 2 },
            { label: 'Splash Screen', data: [6, 5, 7, 7, 6], borderColor: CYN, backgroundColor: 'rgba(0,244,244,.12)', pointBackgroundColor: CYN, borderWidth: 2 },
            { label: 'Push Notification', data: [5, 6, 8, 5, 5], borderColor: '#F4CB00', backgroundColor: 'rgba(244,203,0,.12)', pointBackgroundColor: '#F4CB00', borderWidth: 2 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            tooltip: tooltipOpts,
            legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 10 }, color: '#666' } },
            datalabels: { display: false },
          },
          scales: {
            r: {
              beginAtZero: true, max: 10,
              pointLabels: { font: { size: 10 }, color: '#666' },
              grid: { color: '#e8e8e8' },
              ticks: { display: false },
            },
          },
        },
      });
    }

    /* ASA Keyword Bubble (Ch4) */
    const cBubble = document.getElementById('chartASABubble') as HTMLCanvasElement;
    if (cBubble) {
      new Chart(cBubble, {
        type: 'bubble',
        data: {
          datasets: [
            { label: 'Brand', data: [{ x: 85, y: 78, r: 18 }], backgroundColor: 'rgba(38,190,129,.6)', borderColor: GRN, borderWidth: 1 },
            { label: 'Generic', data: [{ x: 90, y: 25, r: 14 }], backgroundColor: 'rgba(175,156,255,.6)', borderColor: PUR, borderWidth: 1 },
            { label: 'Competitor', data: [{ x: 55, y: 52, r: 13 }], backgroundColor: 'rgba(0,244,244,.5)', borderColor: CYN, borderWidth: 1 },
            { label: 'Long-tail', data: [{ x: 20, y: 72, r: 9 }], backgroundColor: 'rgba(244,203,0,.5)', borderColor: '#F4CB00', borderWidth: 1 },
            { label: 'Discovery', data: [{ x: 50, y: 30, r: 16 }], backgroundColor: 'rgba(176,176,176,.5)', borderColor: GRY, borderWidth: 1 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            tooltip: tooltipOpts,
            legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 10 }, color: '#666' } },
            datalabels: {
              display: true,
              color: '#333',
              font: { weight: 'bold', size: 10 },
              formatter: (_v: any, ctx: any) => ctx.dataset.label,
              align: 'top',
            },
          },
          scales: {
            x: { title: { display: true, text: 'Search Volume', font: { size: 11 }, color: '#666' }, min: 0, max: 100, ticks: { font: { size: 10 }, color: '#666' }, grid: { color: '#f0f0f0' } },
            y: { title: { display: true, text: 'Conversion Rate', font: { size: 11 }, color: '#666' }, min: 0, max: 100, ticks: { font: { size: 10 }, color: '#666' }, grid: { color: '#f0f0f0' } },
          },
        },
      });
    }

    // Init retention + trends
    renderRetentionChart('d7');
    renderTrendsChart('revenue');

    setGatedChartsReady(true);
  }, [externalTooltipHandler]);

  /* ── Retention Chart ── */
  const renderRetentionChart = useCallback(
    (tab: string) => {
      const tooltipOpts = {
        enabled: false,
        external: externalTooltipHandler,
        position: 'nearest' as const,
      };
      const c = document.getElementById(
        'chartRetention'
      ) as HTMLCanvasElement;
      if (!c) return;
      const r = retYRange[tab];
      const datasets = Object.entries(retSeries[tab]).map(([n, pts]) => ({
        label: n,
        data: pts,
        borderColor: retC[n],
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: 0.3,
        borderDash: n === 'Casual' ? [5, 3] : ([] as number[]),
      }));

      if (retInstRef.current) {
        retInstRef.current.data.datasets = datasets as any;
        retInstRef.current.options.scales!.y = {
          ...retInstRef.current.options.scales!.y,
          min: r.min,
          max: r.max,
        } as any;
        retInstRef.current.update('active');
        return;
      }

      retInstRef.current = new Chart(c, {
        type: 'line',
        data: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8'],
          datasets: datasets as any,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 600 },
          plugins: {
            tooltip: tooltipOpts,
            legend: {
              position: 'right',
              labels: {
                usePointStyle: true,
                pointStyle: 'line',
                padding: 10,
                font: { size: 10 },
                color: '#666',
              },
            },
            datalabels: { display: false },
          },
          scales: {
            y: {
              min: r.min,
              max: r.max,
              ticks: {
                callback: (v: any) => v + '%',
                font: { size: 10 },
                color: '#666',
              },
              grid: { color: '#f0f0f0' },
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 }, color: '#666' },
            },
          },
        },
      });
    },
    [externalTooltipHandler]
  );

  /* ── Trends Chart ── */
  const renderTrendsChart = useCallback(
    (tab: string) => {
      const tooltipOpts = {
        enabled: false,
        external: externalTooltipHandler,
        position: 'nearest' as const,
      };
      const c = document.getElementById('chartTrends') as HTMLCanvasElement;
      if (!c) return;
      const d = trendData[tab];
      const u = trendUnits[tab];
      const formatter = (v: number) => u.pre + v + u.suf;
      const datasets = [
        {
          label: 'Casual',
          data: [d['2024'][0], d['2025'][0]],
          backgroundColor: GRN,
          borderRadius: 2,
        },
        {
          label: 'Mid-core',
          data: [d['2024'][1], d['2025'][1]],
          backgroundColor: DRK,
          borderRadius: 2,
        },
        {
          label: 'Hybridcasual',
          data: [d['2024'][2], d['2025'][2]],
          backgroundColor: PUR,
          borderRadius: 2,
        },
        {
          label: 'Hypercasual',
          data: [d['2024'][3], d['2025'][3]],
          backgroundColor: GRY,
          borderRadius: 2,
        },
      ];

      if (trendInstRef.current) {
        trendInstRef.current.data.datasets = datasets as any;
        (trendInstRef.current.options.plugins!.datalabels as any).formatter =
          formatter;
        (
          trendInstRef.current.options.scales!.y as any
        ).ticks.callback = formatter;
        trendInstRef.current.update('active');
        return;
      }

      trendInstRef.current = new Chart(c, {
        type: 'bar',
        data: {
          labels: ['2024', '2025'],
          datasets: datasets as any,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 600 },
          plugins: {
            tooltip: tooltipOpts,
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 12,
                font: { size: 10 },
                color: '#666',
              },
            },
            datalabels: {
              display: true,
              anchor: 'end',
              align: 'end',
              font: { size: 9, weight: 'bold' },
              color: '#666',
              formatter,
            },
          },
          scales: {
            x: {
              stacked: true,
              grid: { display: false },
              ticks: { font: { size: 11 }, color: '#666' },
            },
            y: {
              stacked: true,
              ticks: {
                callback: formatter as any,
                font: { size: 10 },
                color: '#666',
              },
              grid: { color: '#f0f0f0' },
            },
          },
        },
      });
    },
    [externalTooltipHandler]
  );

  /* ── Update retention/trends when tabs change ── */
  useEffect(() => {
    if (gatedChartsInitRef.current) {
      renderRetentionChart(retTab);
    }
  }, [retTab, renderRetentionChart]);

  useEffect(() => {
    if (gatedChartsInitRef.current) {
      renderTrendsChart(trendTab);
    }
  }, [trendTab, renderTrendsChart]);

  /* ── Scroll Reveal with Stagger ── */
  const initReveal = useCallback(() => {
    const prefersRM = window.matchMedia(
      '(prefers-reduced-motion:reduce)'
    ).matches;
    const els = document.querySelectorAll('.rv,.rv-l,.rv-r,.ch-enter-right,.ch-enter-scale,.ch-enter-left,.ch-enter-bottom');
    if (prefersRM) {
      els.forEach((e) => e.classList.add('vis'));
      return;
    }

    // Apply stagger classes to sibling .rv elements within each section
    document.querySelectorAll('.sec, .ch-head, .bento, .toc').forEach((section) => {
      const rvChildren = section.querySelectorAll(':scope > .wrap > .rv, :scope > .wrap > div > .rv');
      rvChildren.forEach((el, i) => {
        if (i > 0 && i <= 3) {
          el.classList.add(`rv-stagger-${i}`);
        }
      });
    });

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('vis');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((e) => {
      if (!e.classList.contains('vis')) obs.observe(e);
    });
  }, []);

  /* ── Animated Counters ── */
  const initCounters = useCallback(() => {
    const prefersRM = window.matchMedia(
      '(prefers-reduced-motion:reduce)'
    ).matches;
    const counters = document.querySelectorAll('[data-count]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement & { _counted?: boolean };
          if (el._counted) return;
          el._counted = true;
          const target = +el.dataset.count!;
          const prefix = el.dataset.prefix || '';
          const suffix = el.dataset.suffix || '';
          const decimal = el.dataset.decimal ? +el.dataset.decimal : 0;
          const duration = 1400;
          const start = performance.now();
          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const val = eased * target;
            const display = decimal > 0 ? (val / Math.pow(10, decimal)).toFixed(1) : String(Math.round(val));
            el.textContent = prefix + display + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          }
          if (prefersRM) {
            const finalDisplay = decimal > 0 ? (target / Math.pow(10, decimal)).toFixed(1) : String(target);
            el.textContent = prefix + finalDisplay + suffix;
          } else {
            requestAnimationFrame(tick);
          }
          obs.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((c) => obs.observe(c));
  }, []);

  /* ── Side Nav ── */
  const initSideNav = useCallback(() => {
    const ids = ['hero', 'toc', 'ch1', 'ch2', 'ch3', 'ch4'];
    const colors: Record<string, string> = {
      hero: '#26BE81',
      toc: '#26BE81',
      ch1: '#26BE81',
      ch2: '#af9cff',
      ch3: '#555',
      ch4: '#00f4f4',
    };
    const links = document.querySelectorAll('.side-nav a');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((l) => {
              l.classList.remove('active');
              const dot = l.querySelector('.dot') as HTMLElement;
              if (dot) {
                dot.style.background = 'var(--border)';
                dot.style.boxShadow = 'none';
              }
            });
            const a = document.querySelector(
              `.side-nav a[data-s="${entry.target.id}"]`
            );
            if (a) {
              a.classList.add('active');
              const c = colors[entry.target.id] || '#26BE81';
              const dot = a.querySelector('.dot') as HTMLElement;
              if (dot) {
                dot.style.background = c;
                dot.style.boxShadow = `0 0 0 3px ${c}33`;
              }
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '-80px 0px -40% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
  }, []);

  /* ── Progress + Nav ── */
  useEffect(() => {
    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.max(
        0,
        Math.min(100, (scrollTop / docHeight) * 100)
      );
      const bar = document.querySelector('.progress-bar') as HTMLElement;
      if (bar)
        bar.style.setProperty('--read-progress', progress + '%');
    }

    function updateNav() {
      const y = window.scrollY;
      const nav = document.getElementById('topNav');
      if (nav) nav.classList.toggle('hide', y > lastY.current && y > 200);
      lastY.current = y;
    }

    function onScroll() {
      updateProgress();
      updateNav();

      // Hide tooltip on scroll
      const tt = document.getElementById('chartTooltip');
      if (tt) tt.classList.remove('show');

      // Lead bar
      const bar = document.getElementById('leadBar');
      const gate = document.getElementById('emailGate');
      if (bar && gate) {
        if (!gateUnlocked) {
          const gateTop = gate.getBoundingClientRect().top;
          bar.classList.toggle(
            'show',
            window.scrollY > window.innerHeight && gateTop > 0
          );
        } else {
          const footer = document.querySelector('.footer');
          const footerTop = footer
            ? footer.getBoundingClientRect().top
            : 99999;
          bar.classList.toggle(
            'show',
            window.scrollY > window.innerHeight &&
              footerTop > window.innerHeight
          );
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [gateUnlocked]);

  /* ── Main init ── */
  useEffect(() => {
    initReveal();
    initCounters();
    initSideNav();
    initAllCharts();

    // Logo fallback
    document.querySelectorAll('.logo-item img').forEach((img) => {
      (img as HTMLImageElement).onerror = function () {
        const span = document.createElement('span');
        span.className = 'logo-item--text';
        span.textContent = (this as HTMLImageElement).alt;
        (this as HTMLImageElement).parentNode!.replaceChild(
          span,
          this as HTMLImageElement
        );
      };
    });

    // If already unlocked, init gated content
    if (gateUnlocked) {
      setTimeout(() => {
        initReveal();
        initCounters();
        initGatedCharts();
      }, 100);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Unlock gated content ── */
  const unlockGatedContent = useCallback(
    (scroll: boolean) => {
      setGateUnlocked(true);
      setTimeout(() => {
        initReveal();
        initCounters();
        initGatedCharts();
        setTimeout(() => {
          if (retInstRef.current) retInstRef.current.resize();
          if (trendInstRef.current) trendInstRef.current.resize();
        }, 500);
      }, 600);
      if (scroll) {
        setTimeout(() => {
          document
            .getElementById('ch2')
            ?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    },
    [initReveal, initCounters, initGatedCharts]
  );

  /* ── Email gate submit ── */
  const handleGateSubmit = useCallback(async () => {
    const email = emailRef.current?.value.trim() || '';
    setGateError(false);

    if (gateFormRef.current) {
      gateFormRef.current.classList.remove('shake', 'invalid');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (emailRef.current) emailRef.current.style.borderColor = '#F87171';
      if (gateFormRef.current) {
        gateFormRef.current.classList.add('invalid');
        void gateFormRef.current.offsetWidth;
        gateFormRef.current.classList.add('shake');
      }
      setGateError('Please enter a valid work email address');
      return;
    }

    setGateLoading(true);
    if (emailRef.current) emailRef.current.style.borderColor = 'var(--green)';

    try {
      // Read UTM params from URL
      const params = new URLSearchParams(window.location.search);

      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          utm_source: params.get('utm_source') || undefined,
          utm_medium: params.get('utm_medium') || undefined,
          utm_campaign: params.get('utm_campaign') || undefined,
          referrer: document.referrer || undefined,
        }),
      });

      if (res.ok) {
        setGateSuccess(true);
        trackEvent('gate_unlock', 'gate', { email_domain: email.split('@')[1] });
        // Show success animation for 1.5s, then lift the gate curtain
        setTimeout(() => {
          setGateLiftingDone(true);
          unlockGatedContent(true);
        }, 1500);
      } else {
        const data = await res.json().catch(() => null);
        if (res.status === 429) {
          setGateError('Too many attempts. Please try again later.');
        } else if (data?.error) {
          setGateError(data.error);
        } else {
          setGateError('Something went wrong. Please try again.');
        }
        setGateLoading(false);
      }
    } catch {
      setGateError('Something went wrong. Please try again.');
      setGateLoading(false);
    }
  }, [unlockGatedContent, trackEvent]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* PROGRESS BAR */}
      <div className="progress-bar">
        <div className="progress-seg s1"></div>
        <div className="progress-seg s2"></div>
        <div className="progress-seg s3"></div>
        <div className="progress-seg s4"></div>
      </div>

      {/* TOP NAV */}
      <nav className="top-nav" id="topNav">
        <a href="https://appsamurai.com" className="nav-logo" target="_blank" rel="noopener noreferrer">
          <span className="mark">A</span>AppSamurai
        </a>
        <div className="nav-right">
          <a href="https://appsamurai.com/solutions" className="nav-link" target="_blank" rel="noopener noreferrer">Solutions</a>
          <a href="https://appsamurai.com/blog" className="nav-link" target="_blank" rel="noopener noreferrer">Blog</a>
          <a href="https://appsamurai.com/contact" className="nav-link" target="_blank" rel="noopener noreferrer">Contact</a>
          <button className="btn-sm" onClick={() => { trackEvent('cta_click', 'nav', { destination: 'gate' }); scrollTo('emailGate'); }}>
            Get Full Report
          </button>
        </div>
      </nav>

      {/* SIDE NAV */}
      <div className="side-nav" id="sideNav">
        <a href="#hero" data-s="hero">
          <span className="lbl">Home</span>
          <span className="dot" style={{ background: 'var(--green)' }}></span>
        </a>
        <a href="#toc" data-s="toc">
          <span className="lbl">Contents</span>
          <span className="dot"></span>
        </a>
        <a href="#ch1" data-s="ch1">
          <span className="lbl">DSP Engine</span>
          <span className="dot"></span>
        </a>
        <a href="#ch2" data-s="ch2">
          <span className="lbl">Rewarded</span>
          <span className="dot"></span>
        </a>
        <a href="#ch3" data-s="ch3">
          <span className="lbl">OEM</span>
          <span className="dot"></span>
        </a>
        <a href="#ch4" data-s="ch4">
          <span className="lbl">ASA &amp; ASO</span>
          <span className="dot"></span>
        </a>
      </div>

      {/* HERO */}
      <div className="hero-wrap">
        <section className="hero" id="hero">
          <div className="rv">
            <span className="hero-badge">AppSamurai Industry Report 2026</span>
            <h1>
              Scale <em>Smarter</em> in 2026
            </h1>
            <p style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1rem,2vw,1.3rem)', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', letterSpacing: '-.01em' }}>
              The 2026 Growth Playbook
            </p>
            <p className="hero-sub">
              The definitive playbook for Rewarded Playtime, Programmatic DSP,
              OEM Discovery, and Apple Search Ads — built for growth teams who
              need to scale smarter in 2026.
            </p>
            <div className="hero-cta">
              <button
                className="btn-primary"
                onClick={() => scrollTo('toc')}
              >
                Explore the Playbook <span>&darr;</span>
              </button>
              <button
                className="btn-outline"
                onClick={() => { trackEvent('cta_click', 'hero', { destination: 'pdf' }); scrollTo('emailGate'); }}
              >
                Download PDF
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* BENTO GRID */}
      <section className="bento" id="bento">
        <div className="wrap">
          <div className="bento-grid">
            <div className="bento-card b-green rv">
              <div className="bento-val" data-count="167" data-prefix="$" data-suffix="B">$0B</div>
              <div className="bento-lbl">Consumer In-App Spending 2025</div>
              <span className="delta pos">&#9650; +10.6% YoY</span>
            </div>
            <div className="bento-card b-yellow rv">
              <div className="bento-val" data-count="53" data-prefix="" data-suffix="T" data-decimal="1">0T</div>
              <div className="bento-lbl">Hours Spent in Apps Globally</div>
              <span className="delta pos">&#9650; 600+ hrs/person</span>
            </div>
            <div className="bento-card b-cyan rv">
              <div className="bento-val" data-count="3" data-prefix="" data-suffix="B+">0B+</div>
              <div className="bento-lbl">Active Android Users via OEM</div>
              <span className="delta pos">&#9650; 72% market share</span>
            </div>
            <div className="bento-card b-purple rv">
              <div className="bento-val" data-count="34" data-prefix="" data-suffix="">0</div>
              <div className="bento-lbl">Apps Used Monthly per Person</div>
              <span className="delta pos">&#9650; 10 unique/day</span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="logo-wall">
        <div className="wrap">
          <p className="logo-wall-label rv">Trusted by leading brands worldwide</p>
          <div className="logo-scroll">
            <div className="logo-track">
              <span className="logo-item"><img src="https://cdn.simpleicons.org/ea/999999" alt="EA" loading="lazy" /></span>
              <span className="logo-item logo-item--text">Rovio</span>
              <span className="logo-item logo-item--text">TapNation</span>
              <span className="logo-item logo-item--text">Shahid</span>
              <span className="logo-item"><img src="https://cdn.simpleicons.org/hbo/999999" alt="HBO Max" loading="lazy" /></span>
              <span className="logo-item"><img src="https://cdn.simpleicons.org/nike/999999" alt="Nike" loading="lazy" /></span>
              <span className="logo-item logo-item--text">Gram Games</span>
              <span className="logo-item logo-item--text">Domino&apos;s</span>
              <span className="logo-item logo-item--text">Superplay</span>
              <span className="logo-item logo-item--text">Rollic</span>
              <span className="logo-item logo-item--text">Hepsiburada</span>
              {/* Duplicate for seamless scroll */}
              <span className="logo-item"><img src="https://cdn.simpleicons.org/ea/999999" alt="EA" loading="lazy" /></span>
              <span className="logo-item logo-item--text">Rovio</span>
              <span className="logo-item logo-item--text">TapNation</span>
              <span className="logo-item logo-item--text">Shahid</span>
              <span className="logo-item"><img src="https://cdn.simpleicons.org/hbo/999999" alt="HBO Max" loading="lazy" /></span>
              <span className="logo-item"><img src="https://cdn.simpleicons.org/nike/999999" alt="Nike" loading="lazy" /></span>
              <span className="logo-item logo-item--text">Gram Games</span>
              <span className="logo-item logo-item--text">Domino&apos;s</span>
              <span className="logo-item logo-item--text">Superplay</span>
              <span className="logo-item logo-item--text">Rollic</span>
              <span className="logo-item logo-item--text">Hepsiburada</span>
            </div>
          </div>
          <div className="logo-scroll" style={{ ['--scroll-dir' as any]: 'reverse' }}>
            <div className="logo-track">
              <span className="logo-item"><img src="https://cdn.simpleicons.org/samsung/999999" alt="Samsung" loading="lazy" /></span>
              <span className="logo-item"><img src="https://cdn.simpleicons.org/oppo/999999" alt="OPPO" loading="lazy" /></span>
              <span className="logo-item"><img src="https://cdn.simpleicons.org/nokia/999999" alt="Nokia" loading="lazy" /></span>
              <span className="logo-item logo-item--text">T-Mobile</span>
              <span className="logo-item"><img src="https://cdn.simpleicons.org/verizon/999999" alt="Verizon" loading="lazy" /></span>
              <span className="logo-item logo-item--text">AT&amp;T</span>
              <span className="logo-item logo-item--text">InMobi</span>
              <span className="logo-item"><img src="https://cdn.simpleicons.org/unity/999999" alt="Unity" loading="lazy" /></span>
              <span className="logo-item logo-item--text">AppLovin</span>
              <span className="logo-item logo-item--text">Taboola</span>
              <span className="logo-item logo-item--text">Smaato</span>
              <span className="logo-item logo-item--text">Beymen</span>
              {/* Duplicate */}
              <span className="logo-item"><img src="https://cdn.simpleicons.org/samsung/999999" alt="Samsung" loading="lazy" /></span>
              <span className="logo-item"><img src="https://cdn.simpleicons.org/oppo/999999" alt="OPPO" loading="lazy" /></span>
              <span className="logo-item"><img src="https://cdn.simpleicons.org/nokia/999999" alt="Nokia" loading="lazy" /></span>
              <span className="logo-item logo-item--text">T-Mobile</span>
              <span className="logo-item"><img src="https://cdn.simpleicons.org/verizon/999999" alt="Verizon" loading="lazy" /></span>
              <span className="logo-item logo-item--text">AT&amp;T</span>
              <span className="logo-item logo-item--text">InMobi</span>
              <span className="logo-item"><img src="https://cdn.simpleicons.org/unity/999999" alt="Unity" loading="lazy" /></span>
              <span className="logo-item logo-item--text">AppLovin</span>
              <span className="logo-item logo-item--text">Taboola</span>
              <span className="logo-item logo-item--text">Smaato</span>
              <span className="logo-item logo-item--text">Beymen</span>
            </div>
          </div>
        </div>
      </section>

      {/* TOC */}
      <section className="toc" id="toc">
        <div className="wrap">
          <div className="toc-label rv">What&apos;s Inside</div>
          <h2 className="rv">The Complete 2026 Growth Playbook</h2>
          <div className="toc-grid">
            <a href="#ch1" className="toc-card rv"><div className="toc-num">01</div><h3>The Programmatic Engine</h3><p>Scaling beyond walled gardens with AI, transparency, creative intelligence, and bid-level precision.</p></a>
            <a href="#ch2" className="toc-card rv"><div className="toc-num">02</div><h3>Rewarded Models</h3><p>Mastering the Value-Exchange Economy through Rewarded Playtime and Offerwalls.</p></a>
            <a href="#ch3" className="toc-card rv"><div className="toc-num">03</div><h3>OEM &amp; On-Device Discovery</h3><p>Reaching users at the source before they even open an App Store.</p></a>
            <a href="#ch4" className="toc-card rv"><div className="toc-num">04</div><h3>Apple Search Ads &amp; ASO</h3><p>Mastering intent and managing cannibalization with a unified engine.</p></a>
          </div>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className="sec sec-w" style={{ padding: '48px 0' }}>
        <div className="wrap">
          <div className="toc-label rv" style={{ marginBottom: '6px' }}>About This Data</div>
          <h3 className="rv" style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: 700, textAlign: 'center', color: '#222', marginBottom: '32px' }}>Methodology &amp; Sources</h3>
          <div className="method-grid rv">
            <div className="method-card"><div className="method-icon">&#128202;</div><p>Market data sourced from <strong>Sensor Tower</strong>, <strong>Data.ai</strong>, and <strong>Statista</strong> covering iOS App Store and Google Play downloads and revenue estimates through December 2025.</p></div>
            <div className="method-card"><div className="method-icon">&#127919;</div><p>Campaign performance data aggregated from <strong>10,000+ campaigns</strong> managed through AppSamurai&apos;s DSP, OEM, and Rewarded Playtime platforms across 2024-2025.</p></div>
            <div className="method-card"><div className="method-icon">&#128300;</div><p>Creative analysis powered by <strong>Alison.AI</strong> examining 500,000+ ad creatives across iOS and Android to identify top-performing elements and trends.</p></div>
            <div className="method-card"><div className="method-icon">&#128241;</div><p>In-app revenue figures are gross — inclusive of app store commissions. Download estimates are per-user, counting one download per Apple or Google account.</p></div>
          </div>
        </div>
      </section>

      {/* DOUGHNUT */}
      <section className="sec sec-l">
        <div className="wrap">
          <div className="story rv">
            <div className="story-text">
              <span className="insight-badge">Key Data</span>
              <h3>Download Channels Share <span style={{ color: 'var(--green)' }}>2025</span></h3>
              <p>Distribution of app installs by acquisition channel. Organic still leads, but paid UA and OEM pre-loads represent the fastest-growing segments as competition for quality installs intensifies.</p>
              <div className="stat-callout" style={{ borderLeftColor: 'var(--green)' }}>
                <div className="big-num" style={{ color: 'var(--green)' }} data-count="38" data-suffix="%">0%</div>
                <div className="stat-body"><h4>Organic Still Leads</h4><p>But paid channels are closing the gap fast</p></div>
              </div>
            </div>
            <div className="story-chart"><div className="chart-wrap">{!chartsReady && <div className="chart-skeleton" style={{ height: 260 }}></div>}<canvas id="chartDoughnut" style={{ display: chartsReady ? 'block' : 'none' }}></canvas></div></div>
          </div>
        </div>
      </section>

      {/* CHAPTER 1 */}
      <hr className="divider green" />
      <section className="ch-head ch-green" id="ch1">
        <div className="wrap rv ch-enter-right" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'center' }}>
          <div>
            <span className="ch-bg-num">01</span>
            <div className="ch-num" style={{ color: 'var(--ch1)' }}>1.0</div>
            <h2>The Programmatic Engine<br />Navigating the Open Internet</h2>
            <div className="ch-desc">The 2026 Thesis: As &ldquo;Walled Gardens&rdquo; reach inventory saturation and rising costs, the most significant growth opportunities have shifted to the Open Internet. Users spend over 60% of their mobile time in independent apps. We scale by tapping into this massive inventory, reaching users during &ldquo;lean-back&rdquo; moments.</div>
          </div>
          <img src="/dsp-screen.png" alt="AppSamurai DSP Platform" style={{ maxWidth: '320px', borderRadius: '16px', boxShadow: '0 16px 40px rgba(0,0,0,.1)', display: 'block' }} />
        </div>
      </section>

      {/* Seasonal Insight Callout */}
      <section className="sec sec-w">
        <div className="wrap rv">
          <div className="stat-callout" style={{ borderLeftColor: 'var(--cyan)', background: 'var(--cyan-l)' }}>
            <div className="big-num" style={{ color: 'var(--cyan)', fontSize: '2rem' }}>2.5&times;</div>
            <div className="stat-body">
              <span className="insight-badge">The Seasonal Insight</span>
              <p>AppsFlyer&apos;s State of App Marketing reports that during major sporting events (like the World Cup or Olympics), CPMs on social platforms spike by as much as 45%, whereas programmatic inventory in non-gaming utility apps remains stable, offering a <strong>2.5x higher ROAS</strong> for brands that &ldquo;zig when others zag.&rdquo;</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shahid Quote */}
      <section className="quote-block sec-l">
        <div className="wrap"><div className="quote-inner rv">
          <img className="quote-avatar" src="/ali-shahid.png" alt="Ali Aktas" style={{ objectFit: 'cover' }} />
          <div>
            <p className="quote-text">AppSamurai&apos;s strategic programmatic advertising expertise helped SHAHID boost user acquisition, drive subscriptions and strengthen our position as the leading MENA VOD service. Their partnership was vital to our mobile growth success.</p>
            <p className="quote-attr">Ali Aktas, Head of Performance, @Shahid</p>
          </div>
        </div></div>
      </section>

      {/* 1.1 Scrolljack */}
      <section className="sec sec-w">
        <div className="wrap">
          <div className="story rv">
            <div className="story-text rv-l">
              <span className="tag" style={{ color: 'var(--ch1)', borderColor: 'var(--ch1)' }}>Section 1.1</span>
              <h3>Bidding and Scaling</h3>
              <p>In 2026, the vanity metric of &ldquo;cheap impressions&rdquo; (CPM) has been officially retired. For sophisticated growth teams, the goal is no longer just winning the bid, but utilizing pre-bid intelligence to predict a post-install event before a single cent is spent.</p>
              <div className="stat-callout" style={{ borderLeftColor: 'var(--ch1)' }}>
                <div className="big-num" style={{ color: 'var(--ch1)' }} data-count="60" data-suffix="%+">0%+</div>
                <div className="stat-body"><h4>Mobile Time in Independent Apps</h4><p>Massive inventory beyond walled gardens</p></div>
              </div>
            </div>
            <div className="story-chart sticky rv-r">
              <h4 style={{ fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '.85rem', marginBottom: '12px', textAlign: 'center', color: 'var(--text)' }}>Programmatic Ad Market Growth</h4>
              <div className="chart-sub" style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--text-faint)', marginBottom: '12px' }}>Projected market size by 2030</div>
              <div className="chart-wrap" style={{ maxHeight: '300px' }}>{!chartsReady && <div className="chart-skeleton" style={{ height: 260 }}></div>}<canvas id="chartProgrammatic" style={{ display: chartsReady ? 'block' : 'none' }}></canvas></div>
            </div>
          </div>
        </div>
      </section>

      {/* 1.1 Detail Cards */}
      <section className="sec sec-l">
        <div className="wrap">
          <div className="info-card rv"><div className="ic-icon"><img className="ic-img" src="/icons/predictive roas modeling.png" alt="Predictive ROAS" /></div><div><h4>Predictive ROAS Modeling</h4><p>Real-time machine learning enables deep-funnel, CPA-based optimization. Identifying users with high propensity for specific actions achieves a more predictable path to profitability.</p></div></div>
          <div className="info-card rv"><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><img className="ic-img" src="/icons/brindging the intent gap.png" alt="Intent Gap" /></div><div><h4>Bridging the &ldquo;Intent Gap&rdquo;</h4><p>Programmatic inventory captures &ldquo;active engagement&rdquo; moments. Shifting spend to these high-receptivity lulls ensures your brand reaches users when their cognitive load is primed for discovery.</p></div></div>
          <div className="info-card rv"><div className="ic-icon"><img className="ic-img" src="/icons/scalibility paradox.png" alt="Scalability" /></div><div><h4>The Scalability Paradox</h4><p>To scale without losing efficiency, Automated Whitelisting ensures presence on top-performing platforms. Automated Blacklisting filters out low-intent inventory in real-time.</p></div></div>
          <div className="info-card rv"><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><img className="ic-img" src="/icons/transparency_mandate.png" alt="Transparency" /></div><div><h4>The Transparency Mandate</h4><p>You cannot scale what you cannot see. Total visibility into bid floors, session depth, and loss notifications allows growth teams to uncover high-value inventory pockets.</p></div></div>
        </div>
      </section>

      {/* 1.2 Creative Strategy */}
      <section className="sec sec-w">
        <div className="wrap"><div className="story reverse rv">
          <div className="story-text rv-r">
            <span className="tag" style={{ color: 'var(--ch1)', borderColor: 'var(--ch1)' }}>Section 1.2</span>
            <h3>Creative Strategy: Targeting Through Psychology</h3>
            <p>Creatives have become the new targeting. With granular ID-based targeting fading, the visual asset itself must do the heavy lifting of finding the right audience.</p>
            <div className="stat-callout" style={{ borderLeftColor: 'var(--yellow)' }}>
              <div className="big-num" style={{ color: 'var(--yellow)' }} data-count="30" data-suffix="%">0%</div>
              <div className="stat-body"><h4>CPA Reduction</h4><p>Through cultural authenticity in emerging markets</p></div>
            </div>
          </div>
          <div className="story-chart rv-l">
            <ul className="blist" style={{ margin: 0 }}>
              <li><strong>Psychological Hooks over Aesthetics:</strong> High-performing assets are built on user psychology — FOMO, efficiency, pain points.</li>
              <li><strong>AI-Driven Speed:</strong> Manual A/B testing is no longer viable. The benchmark is AI-powered rotation.</li>
              <li><strong>Contextual Resonance:</strong> Tailoring creative themes to local seasonal events or dayparting has become a primary lever.</li>
              <li><strong>Cultural Authenticity:</strong> Regional creators, local slang, and culturally relevant scenarios lower CPAs by up to 30%.</li>
              <li><strong>Creative as Market Research:</strong> Creative data is now a primary insights engine, analyzing iterations that drive long-term LTV.</li>
            </ul>
          </div>
        </div></div>
      </section>

      {/* 1.2b Creative Intelligence + Ad Types -- condensed 3-col */}
      <section className="sec sec-l">
        <div className="wrap rv">
          <span className="insight-badge">Creative Intelligence</span>
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>Platform-Specific Creative Best Practices</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {/* iOS */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '20px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}><span style={{ fontSize: '20px' }}>&#127822;</span><span style={{ fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '.82rem', color: 'var(--text)' }}>iOS Best Practices</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[['Gameplay', 'var(--green)', '90%', '+45%'], ['Free-offer text', 'var(--green)', '60%', '+30%'], ['Centered logo', 'var(--green)', '58%', '+29%'], ['Sound-off', 'var(--purple)', '48%', '+24%'], ['Close-ups', 'var(--purple)', '32%', '+16%'], ['"Play Now!"', 'var(--purple)', '28%', '+14%']].map(([label, bg, width, val]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '.68rem', color: 'var(--text-muted)', width: '80px', flexShrink: 0, textAlign: 'right' }}>{label}</span>
                    <div style={{ height: '16px', borderRadius: '3px', background: bg, width, position: 'relative' }}><span style={{ position: 'absolute', right: '5px', top: '1px', fontSize: '.6rem', color: '#fff', fontWeight: 700 }}>{val}</span></div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '.6rem', color: 'var(--text-faint)', marginTop: '8px', textAlign: 'right' }}>Source: Alison.Ai</p>
            </div>
            {/* Android */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '20px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}><span style={{ fontSize: '20px' }}>&#129302;</span><span style={{ fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '.82rem', color: 'var(--text)' }}>Android Best Practices</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[['Split-screen', 'var(--cyan)', '100%', '+51%'], ['Multi scenes', 'var(--cyan)', '82%', '+42%'], ['No CTA end card', 'var(--cyan)', '61%', '+31%'], ['Gameplay', 'var(--green)', '26%', '+13%'], ['Sound effects', 'var(--green)', '24%', '+12%'], ['Falling coins', 'var(--green)', '22%', '+11%']].map(([label, bg, width, val]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '.68rem', color: 'var(--text-muted)', width: '80px', flexShrink: 0, textAlign: 'right' }}>{label}</span>
                    <div style={{ height: '16px', borderRadius: '3px', background: bg, width, position: 'relative' }}><span style={{ position: 'absolute', right: '5px', top: '1px', fontSize: '.6rem', color: bg === 'var(--cyan)' ? '#000' : '#fff', fontWeight: 700 }}>{val}</span></div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '.6rem', color: 'var(--text-faint)', marginTop: '8px', textAlign: 'right' }}>Source: Alison.Ai</p>
            </div>
            {/* Ad Type Impression Share */}
            <div className="chart-box" style={{ margin: 0, padding: '20px 16px' }}>
              <div className="chart-h" style={{ fontSize: '.82rem', marginBottom: '4px' }}>Ad Type Impression Share</div>
              <div className="chart-sub" style={{ fontSize: '.65rem', marginBottom: '8px' }}>2024 vs 2025 worldwide</div>
              <div className="chart-wrap" style={{ height: '180px' }}>{!chartsReady && <div className="chart-skeleton" style={{ height: 180 }}></div>}<canvas id="chartAdTypes" style={{ display: chartsReady ? 'block' : 'none' }}></canvas></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '8px', fontSize: '.6rem', color: 'var(--text-muted)' }}>
                <span>Video overtakes Image as dominant format</span>
                <span>Playable ads double (+111%)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1.3 The Incrementality Mandate */}
      <section className="sec sec-w">
        <div className="wrap"><div className="story rv">
          <div className="story-text rv-l">
            <span className="tag" style={{ color: 'var(--ch1)', borderColor: 'var(--ch1)' }}>Section 1.3</span>
            <h3>The Incrementality Mandate: Solving the Attribution Crisis</h3>
            <p>With the full adoption of <strong>SKAN 5.0</strong> and the <strong>Android Privacy Sandbox</strong>, 2026 is the year of &ldquo;Signal Loss.&rdquo; The most successful growth teams have stopped chasing deterministic tracking and started embracing <strong>Incrementality</strong>.</p>
          </div>
          <div className="rv-r" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch1)' }}><div className="ic-icon"><img className="ic-img" src="/icons/Beyond the Last Click.png" alt="Beyond Last Click" /></div><div><h4>Beyond the Last Click</h4><p>To prove &ldquo;Net-New&rdquo; growth, brands must utilize probabilistic modeling and lift testing. This ensures that programmatic spend isn&apos;t merely poaching organic installs but driving genuine, incremental scale.</p></div></div>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch1)' }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><img className="ic-img" src="/icons/Contextual Resonance.png" alt="Contextual Resonance" /></div><div><h4>Contextual Resonance</h4><p>High-performing creatives are now context-aware. Tailoring themes to match local seasonal events or &ldquo;dayparting&rdquo; (aligning ads with peak viewing or usage hours) has become a key lever in driving down the cost per subscription.</p></div></div>
          </div>
        </div></div>
      </section>

      {/* 1.4 Bid-Level Visibility */}
      <section className="sec sec-l">
        <div className="wrap"><div className="story reverse rv">
          <div className="story-text rv-r">
            <span className="tag" style={{ color: 'var(--ch1)', borderColor: 'var(--ch1)' }}>Section 1.4</span>
            <h3>The Transparency Requirement: Bid-Level Visibility</h3>
            <p>You cannot scale what you cannot see. The &ldquo;black box&rdquo; approach to programmatic is being rejected in favor of total supply-chain visibility.</p>
          </div>
          <div className="rv-l" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch1)' }}><div className="ic-icon"><img className="ic-img" src="/icons/inventory quality control.png" alt="Inventory QC" /></div><div><h4>Inventory Quality Control</h4><p>Scaling requires granular control via automated whitelisting (targeting top-tier platforms) and blacklisting (filtering low-intent inventory).</p></div></div>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch1)' }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><img className="ic-img" src="/icons/Winning the Auction.png" alt="Winning Auction" /></div><div><h4>Winning the Auction</h4><p>Visibility into bid floors, session depth, and loss notifications is essential. This data allows growth teams to identify high-value &ldquo;pockets&rdquo; of inventory that competitors overlook, optimizing for <strong>quality over volume</strong>.</p></div></div>
          </div>
        </div></div>
      </section>

      {/* Data Table: Gaming Sessions YoY */}
      <section className="sec sec-l">
        <div className="wrap">
          <h3 style={{ fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text)' }} className="rv">Gaming Sessions YoY by Region</h3>
          <table className="data-table rv">
            <thead><tr><th>Rank</th><th>Region</th><th>Sessions YoY</th><th>Trend</th></tr></thead>
            <tbody>
              <tr><td><span className="rank-badge">1</span></td><td>MENA</td><td><span className="delta pos">&#9650; +7%</span></td><td><div style={{ background: 'rgba(38,190,129,.3)', width: '70%', height: '14px', borderRadius: '4px' }}></div></td></tr>
              <tr><td><span className="rank-badge" style={{ background: 'var(--purple)' }}>2</span></td><td>Europe</td><td><span className="delta pos">&#9650; +3%</span></td><td><div style={{ background: 'rgba(38,190,129,.3)', width: '30%', height: '14px', borderRadius: '4px' }}></div></td></tr>
              <tr><td><span className="rank-badge" style={{ background: 'var(--cyan)' }}>3</span></td><td>Global</td><td><span className="delta pos">&#9650; +1%</span></td><td><div style={{ background: 'rgba(38,190,129,.3)', width: '10%', height: '14px', borderRadius: '4px' }}></div></td></tr>
              <tr><td><span className="rank-badge" style={{ background: 'var(--yellow)' }}>4</span></td><td>LATAM</td><td><span className="delta pos">&#9650; +0.4%</span></td><td><div style={{ background: 'rgba(244,203,0,.3)', width: '5%', height: '14px', borderRadius: '4px' }}></div></td></tr>
              <tr><td><span className="rank-badge" style={{ background: 'var(--text-faint)' }}>5</span></td><td>APAC</td><td><span className="delta neg">&#9660; -1%</span></td><td><div style={{ background: 'rgba(248,113,113,.3)', width: '10%', height: '14px', borderRadius: '4px' }}></div></td></tr>
              <tr><td><span className="rank-badge" style={{ background: 'var(--delta-neg)' }}>6</span></td><td>N. America</td><td><span className="delta neg">&#9660; -2%</span></td><td><div style={{ background: 'rgba(248,113,113,.3)', width: '20%', height: '14px', borderRadius: '4px' }}></div></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Budget Allocation Chart (Ch1) */}
      <section className="sec sec-w">
        <div className="wrap">
          <div className="chart-card-new rv">
            <h4>Traditional vs Optimized Channel Mix</h4>
            <div className="chart-subtitle">Budget allocation by channel — shift spend to high-intent inventory</div>
            <div className="chart-wrap">{!chartsReady && <div className="chart-skeleton" style={{ height: 260 }}></div>}<canvas id="chartBudgetFlow" style={{ display: chartsReady ? 'block' : 'none' }}></canvas></div>
          </div>
        </div>
      </section>

      {/* Paycell Case Study */}
      <section className="sec sec-w">
        <div className="wrap"><div className="case-card rv">
          <div>
            <div className="case-tag">Case Study</div>
            <h4 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--green)', marginBottom: '4px', fontFamily: 'var(--font-h)' }}>Paycell</h4>
            <h4>Paycell Celebrated High-Intent Users with AppSamurai DSP</h4>
            <p>By leveraging AppSamurai&apos;s programmatic engine, Paycell achieved significant improvements in user acquisition quality and cost efficiency.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
              <div style={{ background: 'rgba(38,190,129,.12)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}><div style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--green)' }}>32%</div><div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.5)' }}>Increase in MAU</div></div>
              <div style={{ background: 'rgba(38,190,129,.12)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}><div style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--green)' }}>+120K</div><div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.5)' }}>Users Gained</div></div>
            </div>
            <div style={{ background: 'rgba(38,190,129,.12)', borderRadius: '12px', padding: '16px', textAlign: 'center', marginTop: '10px' }}><div style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--green)' }}>49%</div><div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.5)' }}>Install-to-QR Payment Increased</div></div>
          </div>
          <div className="case-chart" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <img src="/paycell-banner.png" alt="Paycell Case Study" style={{ width: '100%', borderRadius: '12px', marginBottom: '8px' }} />
            {!chartsReady && <div className="chart-skeleton" style={{ height: 180 }}></div>}<canvas id="chartPaycell" height={180} style={{ display: chartsReady ? 'block' : 'none' }}></canvas>
          </div>
        </div></div>
      </section>

      {/* Paycell CTA */}
      <section className="cta-banner" style={{ background: 'var(--dark2)' }}><div className="wrap"><div className="cta-flex rv">
        <h3 style={{ color: '#fff' }}>Learn More About What AppSamurai DSP Can Achieve for Your App<small style={{ color: 'rgba(255,255,255,.4)' }}>See how our programmatic engine delivers real results.</small></h3>
        <button className="btn-primary" style={{ whiteSpace: 'nowrap' }}>Book a Demo &rarr;</button>
      </div></div></section>

      {/* 1.5 Retention Loop */}
      <section className="sec sec-l">
        <div className="wrap"><div className="story reverse rv">
          <div className="story-text rv-r">
            <span className="tag" style={{ color: 'var(--ch1)', borderColor: 'var(--ch1)' }}>Section 1.5</span>
            <h3>The Retention Loop: Full-Funnel Re-engagement</h3>
            <p>The average mobile app loses 77% of its DAUs within 3 days. Global in-app spend hit $150B in 2024, yet competition keeps CPIs elevated. Re-engaging existing users is far more efficient than hunting new installs.</p>
            <div className="stat-callout" style={{ borderLeftColor: 'var(--delta-neg)' }}>
              <div className="big-num" style={{ color: 'var(--delta-neg)' }} data-count="77" data-suffix="%">0%</div>
              <div className="stat-body"><h4>DAU Loss in 3 Days</h4><p>Average mobile app retention cliff</p></div>
            </div>
          </div>
          <div className="rv-l" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="info-card" style={{ margin: 0 }}><div className="ic-icon"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M22 5l-4 2 2 4"/><circle cx="12" cy="12" r="2"/></svg></div><div><h4>Data-Driven Buckets</h4><p>Users segmented by churn risk. Inactive 10+ days receives awareness messaging. High-value inactive 7 days receives personalized rewards.</p></div></div>
            <div className="info-card" style={{ margin: 0 }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><circle cx="12" cy="12" r="10"/><path d="M12 7v5l3.5 3.5"/></svg></div><div><h4>The &ldquo;Churn Window&rdquo; Insight</h4><p>Using recency and frequency rules to identify the exact tipping point where a user is likely to churn permanently.</p></div></div>
          </div>
        </div></div>
      </section>

      {/* LTV Comparison Teaser (pre-gate) */}
      <section className={`sec sec-l${!gateUnlocked ? ' gate-tease' : ''}`}>
        <div className="wrap">
          <div className="chart-card-new rv">
            <h4>LTV Comparison by Acquisition Model</h4>
            <div className="chart-subtitle">Rewarded Playtime delivers 2-3x higher LTV than traditional models</div>
            <div className="chart-wrap">{!chartsReady && <div className="chart-skeleton" style={{ height: 260 }}></div>}<canvas id="chartLTVTeaser" style={{ display: chartsReady ? 'block' : 'none' }}></canvas></div>
          </div>
        </div>
      </section>

      {/* EMAIL GATE */}
      <section
        className={`gate${gateLiftingDone ? ' gate-lifting' : ''}`}
        id="emailGate"
        style={{ display: gateUnlocked && !initialUnlocked ? 'none' : undefined }}
        onAnimationEnd={(e) => { if (e.animationName === 'liftUp') { (e.currentTarget as HTMLElement).style.display = 'none'; } }}
      >
        <div className="gate-inner rv">
          {gateSuccess ? (
            <div className="gate-success">
              <div className="checkmark">&#10003;</div>
              <div className="success-msg">Welcome! Unlocking your content...</div>
            </div>
          ) : (
            <>
              <div className="gate-icon">&#128274;</div>
              <h2>Unlock the Full 2026 Playbook</h2>
              <p>You&apos;ve seen Chapter 1. Get instant access to all 4 chapters — including Rewarded Models, OEM Discovery, ASA strategies, and advanced growth tactics.</p>
              <div className="gate-form" id="gateForm" ref={gateFormRef}>
                <input
                  className="gate-input"
                  type="email"
                  placeholder="Enter your work email"
                  id="gateEmail"
                  ref={emailRef}
                  required
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGateSubmit(); } }}
                />
                <button
                  className={`gate-submit${gateLoading ? ' btn-loading' : ''}`}
                  id="gateBtn"
                  onClick={handleGateSubmit}
                >
                  {gateLoading ? (
                    <>
                      <svg className="spinner" viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Unlocking...
                    </>
                  ) : 'Get Access'}
                </button>
              </div>
              {gateError && <div className="gate-error-msg" style={{ opacity: 1, fontSize: '.75rem', color: '#F87171', marginTop: '8px', textAlign: 'center' }}>{gateError}</div>}
              <div className="social-proof" style={{ marginTop: '12px' }}>Join <strong>2,500+</strong> growth leaders who&apos;ve read this playbook</div>
              <div className="gate-note">No spam. Instant access. Unsubscribe anytime.</div>
            </>
          )}
        </div>
      </section>

      {/* GATED CONTENT */}
      <div id="gatedContent" className={`${gateUnlocked ? 'gated-locked unlocked' : 'gated-locked'}${gateUnlocked && !initialUnlocked ? ' gated-reveal' : ''}`}>

        {/* CHAPTER 2 */}
        <hr className="divider purple" />
        <section className="ch-head ch-purple" id="ch2">
          <div className="wrap rv ch-enter-scale" style={{ position: 'relative' }}>
            <span className="ch-bg-num">02</span>
            <div className="ch-num" style={{ color: 'var(--ch2)' }}>2.0</div>
            <h2>Rewarded Models<br />Mastering the Value-Exchange Economy</h2>
            <div className="ch-desc">In 2026, the mobile growth landscape has shifted from passive ad consumption to a Value-Exchange Economy. Rewarded Playtime is at the center of sustainable growth strategies, transforming how developers acquire, engage, and monetize their audiences.</div>
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap"><div className="story rv">
            <div className="story-text rv-l">
              <span className="tag" style={{ color: 'var(--ch2)', borderColor: 'var(--ch2)' }}>Section 2.1</span>
              <h3>Defining Rewarded Playtime: The Engagement Engine</h3>
              <p>Rewarded Playtime rewards users based on actual time spent and milestones achieved within an app. Unlike traditional install-focused models, it fosters a continuous relationship from the first minute of gameplay.</p>
              <div className="stat-callout" style={{ borderLeftColor: 'var(--ch2)' }}>
                <div className="big-num" style={{ color: 'var(--ch2)' }} data-count="90" data-suffix=" day">0 day</div>
                <div className="stat-body"><h4>Extended LTV Window</h4><p>From Day 1 metrics to 60-90 day sustainability</p></div>
              </div>
            </div>
            <div className="rv-r" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch2)' }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><circle cx="8" cy="8" r="5"/><rect x="6" y="16" width="4" height="6" rx="1"/><path d="M14 4h8M14 8h6M14 12h4"/></svg></div><div><h4>The 60-90 Day LTV Window</h4><p>Developers are moving away from volatile Day 1 metrics and focusing on long-term sustainability by rewarding users over a 60-90 day period.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch2)' }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><circle cx="8" cy="8" r="4"/><circle cx="16" cy="8" r="4"/><circle cx="12" cy="16" r="4"/></svg></div><div><h4>Systematic Segment Optimization</h4><p>By analyzing mobile interests, demographics, and geographic data, growth teams can optimize each segment individually for maximum ROI.</p></div></div>
            </div>
          </div></div>
        </section>

        {/* LTV Comparison Full (Ch2) */}
        <section className="sec sec-l">
          <div className="wrap">
            <div className="chart-card-new rv">
              <h4>LTV Comparison by Acquisition Model</h4>
              <div className="chart-subtitle">Rewarded Playtime users generate significantly higher lifetime value at every milestone</div>
              <div className="chart-wrap">{!gatedChartsReady && <div className="chart-skeleton" style={{ height: 260 }}></div>}<canvas id="chartLTVFull" style={{ display: gatedChartsReady ? 'block' : 'none' }}></canvas></div>
            </div>
          </div>
        </section>

        <section className="cta-banner"><div className="wrap"><div className="cta-flex rv">
          <h3>Want to Know Your Rewarded UA Potential?<small>Find out with our ROAS forecaster, before you invest.</small></h3>
          <button className="btn-primary" style={{ whiteSpace: 'nowrap' }}>Try ROAS Forecaster &rarr;</button>
        </div></div></section>

        {/* 2.2 Aha Moment */}
        <section className="sec sec-l">
          <div className="wrap rv">
            <span className="tag" style={{ color: 'var(--ch2)', borderColor: 'var(--ch2)' }}>Section 2.2</span>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Finding the &ldquo;Aha! Moment&rdquo; Across Genres</h3>
            <p style={{ fontSize: '.9rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '24px', maxWidth: '720px' }}>The &ldquo;Aha! Moment&rdquo; is the specific point where a user recognizes the core value of an app. In a rewarded ecosystem, the structure is mapped directly to these milestones to ensure users don&apos;t just install, but &ldquo;hook&rdquo; into the experience.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch2)', flexDirection: 'column' }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div><div><h4>Hypercasual Games</h4><p>Playtime uses event-based campaigns to reward users for every level completed. By continuously rewarding the user for their gameplay, the model drives extended session times and higher ARPU.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch2)', flexDirection: 'column' }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg></div><div><h4>Casual &amp; Puzzle Games</h4><p>For titles like &ldquo;merge&rdquo; or &ldquo;mystery&rdquo; games, the focus is on repeated gaming sessions and user attachment. Playtime provides a visually appealing way to drive users to continue playing and become more hooked on the core gameplay loop.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch2)', flexDirection: 'column' }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg></div><div><h4>Mid-Core &amp; High-Friction Apps</h4><p>For apps with mixed monetization strategies or complex onboarding (like FinTech or E-commerce), Playtime provides an entertaining rewards experience. This high-retention approach has a promising impact on revenue and LTV.</p></div></div>
            </div>
          </div>
        </section>

        {/* Genre + Retention Charts */}
        <section className="sec sec-w">
          <div className="wrap"><div className="story rv">
            <div className="story-chart rv-l">
              <div className="chart-h" style={{ fontSize: '.95rem' }}>Download Channels Share by Genre</div>
              <div className="chart-sub">Share of downloads by product model</div>
              <div className="chart-wrap" style={{ height: '300px' }}>{!gatedChartsReady && <div className="chart-skeleton" style={{ height: 300 }}></div>}<canvas id="chartGenre" style={{ display: gatedChartsReady ? 'block' : 'none' }}></canvas></div>
            </div>
            <div className="story-chart rv-r">
              <div className="chart-h" style={{ fontSize: '.95rem' }}>Mobile Game Retention Trends</div>
              <div className="tabs-center"><div className="tabs" id="retTabs">
                {['d7', 'd30', 'd1', 'd365'].map((t) => (
                  <button key={t} className={`tab-btn${retTab === t ? ' active' : ''}`} onClick={() => setRetTab(t)}>{t === 'd7' ? 'D7' : t === 'd30' ? 'D30' : t === 'd1' ? 'D1' : 'D365'}</button>
                ))}
              </div></div>
              <div className="chart-wrap" style={{ height: '260px' }}>{!gatedChartsReady && <div className="chart-skeleton" style={{ height: 260 }}></div>}<canvas id="chartRetention" style={{ display: gatedChartsReady ? 'block' : 'none' }}></canvas></div>
            </div>
          </div></div>
        </section>

        {/* 2.3 + Trends Chart */}
        <section className="sec sec-l">
          <div className="wrap"><div className="story rv">
            <div className="story-text rv-l">
              <span className="tag" style={{ color: 'var(--ch2)', borderColor: 'var(--ch2)' }}>Section 2.3</span>
              <h3>Solving the Scaling Paradox: Smart Bidding</h3>
              <p>Achieving high conversion rates while maintaining strict CPI constraints requires moving from acquiring volume toward acquiring value.</p>
              <div className="info-card" style={{ margin: '8px 0', borderLeft: '3px solid var(--ch2)' }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="var(--purple)" stroke="none"/></svg></div><div><h4>Targeting Precision</h4><p>Using precise age and gender targeting allows teams to bid accurately for each audience segment. This ensures you reach users more effectively and avoid the trap of acquiring low-quality users.</p></div></div>
              <div className="info-card" style={{ margin: '8px 0', borderLeft: '3px solid var(--ch2)' }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><path d="M12 2a10 10 0 1 0 10 10"/><path d="M22 5l-4 2 2 4"/><circle cx="12" cy="12" r="2"/></svg></div><div><h4>The Revenue Flywheel</h4><p>Initial tests with Playtime often reveal high retention rates. This stability allows growth teams to optimize segments individually and capitalize on the strengths of diverse audience groups, leading to a much more sustainable performance.</p></div></div>
            </div>
            <div className="story-chart rv-r">
              <div className="chart-h" style={{ fontSize: '.95rem' }}>Annual Trends by Product Model</div>
              <div className="tabs-center"><div className="tabs" id="trendTabs">
                {['revenue', 'downloads', 'sessions'].map((t) => (
                  <button key={t} className={`tab-btn${trendTab === t ? ' active' : ''}`} onClick={() => setTrendTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                ))}
              </div></div>
              <div className="chart-wrap" style={{ height: '280px' }}>{!gatedChartsReady && <div className="chart-skeleton" style={{ height: 280 }}></div>}<canvas id="chartTrends" style={{ display: gatedChartsReady ? 'block' : 'none' }}></canvas></div>
            </div>
          </div></div>
        </section>

        {/* Mert Quote */}
        <section className="quote-block" style={{ background: 'var(--purple-l)' }}>
          <div className="wrap"><div className="quote-inner rv">
            <div className="quote-avatar" style={{ background: 'var(--purple)' }}>MS</div>
            <div>
              <p className="quote-text">IAPs have become even more important for hypercasual game publishers, offering a more reliable revenue stream compared to the volatile nature of ad revenue. Through Rewarded UA we can reach a wider audience and attract players who are more likely to make in-app purchases while providing them with a richer gaming experience.</p>
              <p className="quote-attr">Mert Simsek, Co-founder &amp; CMO at APPS</p>
            </div>
          </div></div>
        </section>

        {/* 2.4 AppsPrize */}
        <section className="sec sec-w">
          <div className="wrap rv">
            <span className="tag" style={{ color: 'var(--ch2)', borderColor: 'var(--ch2)' }}>Section 2.4</span>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Publisher Monetization: The AppsPrize Ecosystem</h3>
            <p style={{ color: '#666', fontSize: '.88rem', marginBottom: '16px', maxWidth: '640px' }}>For publishers, maximizing yield in 2026 requires a monetization strategy that feels like a feature, not a disruption. This is the core philosophy behind <span style={{ color: 'var(--ch2)', fontWeight: 700 }}>AppsPrize.</span></p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--ch2)', flexDirection: 'column' }}><div className="ic-icon" style={{ background: 'var(--purple-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><rect x="5" y="5" width="14" height="14" rx="2"/><circle cx="10" cy="14" r="2"/><circle cx="14" cy="14" r="2"/><circle cx="12" cy="10" r="2"/></svg></div><h4>A &ldquo;Native&rdquo; Rewards Experience</h4><p>AppsPrize acts as a loyalty layer, rewarding users in the app&apos;s native currency for seamless exploration.</p></div>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--ch2)', flexDirection: 'column' }}><div className="ic-icon" style={{ background: 'var(--purple-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><circle cx="12" cy="12" r="5"/><path d="M12 7a5 5 0 0 1 0 10"/><path d="M9 5l-2-2M15 5l2-2M9 19l-2 2M15 19l2 2"/></svg></div><h4>Verified Human Engagement</h4><p>Built on playtime and level-based events, it inherently filters out low-quality traffic. Publishers provide a platform for verified user attachment.</p></div>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--ch2)', flexDirection: 'column' }}><div className="ic-icon" style={{ background: 'var(--purple-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><rect x="5" y="5" width="14" height="14" rx="2"/><circle cx="10" cy="14" r="2"/><circle cx="14" cy="14" r="2"/><circle cx="12" cy="10" r="2"/></svg></div><h4>Visual &amp; Interactive Appeal</h4><p>A visually engaging way to discover new content, ensuring positive UX and greater attachment to both the advertised game and the host app.</p></div>
            </div>
          </div>
        </section>

        {/* CHAPTER 3 */}
        <hr className="divider dark" />
        <section className="ch-head ch-dark" id="ch3">
          <div className="wrap rv ch-enter-left" style={{ position: 'relative' }}>
            <span className="ch-bg-num">03</span>
            <div className="ch-num" style={{ color: 'var(--green)' }}>3.0</div>
            <h2>OEM &amp; On-Device Discovery</h2>
            <div className="ch-desc">The most sophisticated growth teams have moved &ldquo;upstream.&rdquo; By partnering with manufacturers like Samsung, Xiaomi, and Oppo, brands gain unprecedented system-level access to users that traditional ad networks simply cannot replicate.</div>
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap"><div className="story rv">
            <div className="story-text rv-l">
              <span className="tag" style={{ color: 'var(--ch3)', borderColor: 'var(--ch3)' }}>Section 3.1</span>
              <h3>Beyond the Banner: The OEM Difference</h3>
              <p>OEM ads appear at natural touchpoints — the home screen, lock screen, and within native system apps — instead of interrupting a user&apos;s session.</p>
              <ul className="blist">
                <li><strong>The Integrated Journey:</strong> OEM ads are woven into the OS fabric, not interrupting sessions.</li>
                <li><strong>The Android Powerhouse:</strong> 70-72% global market share, exceeding 85% in India and Brazil.</li>
              </ul>
              <div className="stat-callout" style={{ borderLeftColor: 'var(--green)' }}>
                <div className="big-num" style={{ color: 'var(--green)' }} data-count="3" data-suffix="B+">0B+</div>
                <div className="stat-body"><h4>Active Android Users</h4><p>Reachable via OEM partners</p></div>
              </div>
            </div>
            <div className="story-chart sticky rv-r">
              <div className="chart-h" style={{ fontSize: '.95rem' }}>iPhone vs Android Market Share</div>
              <div className="chart-sub">2009 — 2024</div>
              <div className="chart-wrap" style={{ height: '300px' }}>{!gatedChartsReady && <div className="chart-skeleton" style={{ height: 300 }}></div>}<canvas id="chartMarketShare" style={{ display: gatedChartsReady ? 'block' : 'none' }}></canvas></div>
            </div>
          </div></div>
        </section>

        {/* Creative Best Practices -- iOS & Android */}
        <section className="sec sec-l">
          <div className="wrap rv">
            <div style={{ textAlign: 'right', marginBottom: '8px' }}><span style={{ fontSize: '.72rem', color: '#999' }}>Source:</span> <span style={{ fontFamily: 'var(--font-h)', fontWeight: 600, fontSize: '.82rem', color: '#666' }}>Alison.Ai</span></div>
            {/* iOS */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '32px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}><img src="/ios-android-age-1.png" alt="iOS Creative Best Practices" style={{ maxWidth: '100%', borderRadius: '12px' }} /></div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}><span style={{ fontSize: '28px' }}>&#127822;</span><h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 700, color: '#222' }}>iOS Creative Best Practices</h4></div>
                <p style={{ fontSize: '.88rem', color: '#666', lineHeight: 1.75 }}>iOS users respond well to a sound-off design (+24%), that open with close-up shots (+16%) of gameplay (+45%), introduce free-offer text early (+30%), and feature a large centered logo (+29%) at the end paired with the CTA text &apos;Play Now!&apos; (+14%).</p>
              </div>
            </div>
            {/* Android */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}><img src="/ios-android-age-2.png" alt="Android Creative Best Practices" style={{ maxWidth: '100%', borderRadius: '12px' }} /></div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}><span style={{ fontSize: '28px' }}>&#129302;</span><h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 700, color: '#222' }}>Android Creative Best Practices</h4></div>
                <p style={{ fontSize: '.88rem', color: '#666', lineHeight: 1.75 }}>Android users respond well to videos that use sound effects (+12%), split-screen (+51%) scenes showcasing gameplay (+13%), and multiple scenes (+42%), with an end card that omits a CTA (+31%) but features falling coins (+11%).</p>
              </div>
            </div>
          </div>
        </section>

        {/* OEM Format Table */}
        <section className="sec sec-l">
          <div className="wrap">
            <h3 style={{ fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text)' }} className="rv">OEM Ad Format Comparison</h3>
            <table className="data-table rv">
              <thead><tr><th>Format</th><th>Reach</th><th>Cost Efficiency</th><th>Best Use Case</th></tr></thead>
              <tbody>
                <tr><td><strong>PAI (Play-Auto-Install)</strong></td><td>Very High</td><td><span className="delta pos">&#9650; Best</span></td><td>App launch, first-day strategy</td></tr>
                <tr><td><strong>Icon Placements</strong></td><td>High</td><td><span className="delta pos">&#9650; Excellent</span></td><td>Brand awareness, sustained growth</td></tr>
                <tr><td><strong>Native Splash</strong></td><td>High</td><td><span className="delta pos">&#9650; Very Good</span></td><td>High-intent retargeting</td></tr>
                <tr><td><strong>Smart Push</strong></td><td>Medium-High</td><td><span className="delta pos">&#9650; Good</span></td><td>Re-engagement messaging</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* OEM Format Radar (Ch3) */}
        <section className="sec sec-w">
          <div className="wrap">
            <div className="chart-card-new rv">
              <h4>OEM Format Comparison</h4>
              <div className="chart-subtitle">Radar analysis across 5 key dimensions — PAI leads in reach and brand safety</div>
              <div className="chart-wrap" style={{ maxWidth: '500px', margin: '0 auto' }}>{!gatedChartsReady && <div className="chart-skeleton" style={{ height: 260 }}></div>}<canvas id="chartOEMRadar" style={{ display: gatedChartsReady ? 'block' : 'none' }}></canvas></div>
            </div>
          </div>
        </section>

        {/* 3.3 Sophisticated Targeting */}
        <section className="sec sec-w">
          <div className="wrap rv">
            <span className="tag" style={{ color: 'var(--ch3)', borderColor: 'var(--ch3)' }}>Section 3.3</span>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Sophisticated Targeting: Moving Beyond Demographics</h3>
            <p style={{ color: '#666', fontSize: '.88rem', marginBottom: '16px', maxWidth: '640px' }}>The true power of OEM lies in the depth of data available at the hardware level. We&apos;ve moved beyond simple age and gender filters to a more holistic understanding of user intent.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--green)', flexDirection: 'column' }}><div className="ic-icon" style={{ marginBottom: '8px' }}><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg></div><h4>Behavioral &amp; App Category</h4><p>Reach users based on their actual app usage patterns. Surface your game to users who frequently engage with similar genres.</p></div>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--green)', flexDirection: 'column' }}><div className="ic-icon" style={{ marginBottom: '8px' }}><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg></div><h4>Geographic &amp; Device Precision</h4><p>Tailor campaigns to specific device models. Promote flagship titles on premium hardware, utility apps on the broader mid-range market.</p></div>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--green)', flexDirection: 'column' }}><div className="ic-icon" style={{ background: 'var(--purple-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></div><h4>Keyword &amp; Retargeting</h4><p>Capture intent the moment a user searches for a solution, or re-engage users who interacted with your brand but haven&apos;t converted.</p></div>
            </div>
          </div>
        </section>

        {/* 3.4 Cost Advantage */}
        <section className="sec sec-l">
          <div className="wrap rv">
            <span className="insight-badge">Cost Advantage</span>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>3.4 The Economic Edge: Cost-Effectiveness at Scale</h3>
            <div className="grid-3">
              <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--green)' }}><div className="big-num" style={{ color: 'var(--green)', fontSize: '1.6rem' }}>Lower CPM</div><div className="stat-body"><p style={{ fontSize: '.82rem' }}>OEM provides lower entry costs vs traditional digital.</p></div></div>
              <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--green)' }}><div className="big-num" style={{ color: 'var(--green)', fontSize: '1.6rem' }}>Less Waste</div><div className="stat-body"><p style={{ fontSize: '.82rem' }}>Precise targeting ensures no wasted impressions.</p></div></div>
              <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--green)' }}><div className="big-num" style={{ color: 'var(--green)', fontSize: '1.6rem' }}>Uncluttered</div><div className="stat-body"><p style={{ fontSize: '.82rem' }}>Brands stand out in a clean system environment.</p></div></div>
            </div>
          </div>
        </section>

        {/* TapNation Case Study */}
        <section className="sec sec-w">
          <div className="wrap"><div className="case-card rv">
            <div>
              <div className="case-tag">Case Study</div>
              <h4 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--purple)', marginBottom: '4px', fontFamily: 'var(--font-h)' }}>TapNation</h4>
              <h4>How TapNation Achieved ROAS+ via AppSamurai&apos;s OEM (AppDiscovery) Campaign</h4>
              <p>TapNation leveraged AppSamurai&apos;s OEM channel to reach users at the device level, achieving strong ROAS targets through pre-install strategies and on-device discovery.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '16px' }}>
                <div style={{ background: 'rgba(175,156,255,.12)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}><div style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--purple)' }}>45%</div><div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.5)' }}>OEM Discovery Share</div></div>
                <div style={{ background: 'rgba(175,156,255,.12)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}><div style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--purple)' }}>35%</div><div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.5)' }}>Programmatic Share</div></div>
                <div style={{ background: 'rgba(175,156,255,.12)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}><div style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--green)' }}>ROAS+</div><div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.5)' }}>Target Achieved</div></div>
              </div>
            </div>
            <div className="case-chart">{!gatedChartsReady && <div className="chart-skeleton" style={{ height: 200 }}></div>}<canvas id="chartTapNation" height={200} style={{ display: gatedChartsReady ? 'block' : 'none' }}></canvas></div>
          </div></div>
        </section>

        {/* CHAPTER 4 */}
        <hr className="divider cyan" />
        <section className="ch-head ch-cyan" id="ch4">
          <div className="wrap rv ch-enter-bottom" style={{ position: 'relative' }}>
            <span className="ch-bg-num">04</span>
            <div className="ch-num" style={{ color: 'var(--ch4)' }}>4.0</div>
            <h2>Apple Search Ads &amp; ASO Synergy</h2>
            <div className="ch-desc">In 2026, the App Store is a high-intent search engine where every query is a signal of immediate need. The real &ldquo;growth hack&rdquo; lies in the seamless synergy between paid search (ASA) and organic optimization (ASO).</div>
          </div>
        </section>

        {/* 4.1 Performance-Led Optimization */}
        <section className="sec sec-w">
          <div className="wrap rv">
            <span className="tag" style={{ color: 'var(--ch4)', borderColor: 'var(--ch4)' }}>Section 4.1</span>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Performance-Led Optimization</h3>
            <p style={{ color: '#666', fontSize: '.88rem', marginBottom: '16px', maxWidth: '640px' }}>The most successful strategies are rooted in CPA and deep-funnel event optimization.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch4)' }}><div className="ic-icon" style={{ background: 'rgba(0,244,244,.1)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--ch4)' }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div><div><h4>Targeting Registrations, Not Just Installs</h4><p>We optimize campaigns to achieve a target CPA for registrations — ensuring the budget buys active users, not just downloads.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch4)' }}><div className="ic-icon" style={{ background: 'rgba(0,244,244,.1)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--ch4)' }}><path d="M3 3v18h18"/><path d="M7 16l4-6 4 4 5-8"/></svg></div><div><h4>Event-Driven Bidding</h4><p>We prioritize keywords that yield high event conversion rates — tutorial completion, first purchase, profile setup — tying every dollar to long-term LTV.</p></div></div>
            </div>
            <table className="data-table">
              <thead><tr><th>Keyword</th><th>Search Volume</th><th>Competition</th><th>Opportunity</th></tr></thead>
              <tbody>
                <tr><td><strong>puzzle games free</strong></td><td><span className="delta pos">Very High</span></td><td>High</td><td>Brand + Generic</td></tr>
                <tr><td><strong>racing game</strong></td><td><span className="delta pos">High</span></td><td>Medium</td><td>Discovery</td></tr>
                <tr><td><strong>idle tycoon</strong></td><td><span className="delta pos">High</span></td><td>Low</td><td>Competitor Conquest</td></tr>
                <tr><td><strong>match 3 games</strong></td><td><span className="delta pos">High</span></td><td>High</td><td>Brand Defense</td></tr>
                <tr><td><strong>action rpg</strong></td><td><span className="delta pos">Medium</span></td><td>Medium</td><td>Category</td></tr>
                <tr><td><strong>strategy war game</strong></td><td><span className="delta pos">Medium</span></td><td>Low</td><td>Long-tail</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ASA Keyword Strategy Map (Ch4) */}
        <section className="sec sec-w">
          <div className="wrap">
            <div className="chart-card-new rv">
              <h4>ASA Keyword Strategy Map</h4>
              <div className="chart-subtitle">X: Search Volume, Y: Conversion Rate, Size: Opportunity Score</div>
              <div className="chart-wrap">{!gatedChartsReady && <div className="chart-skeleton" style={{ height: 260 }}></div>}<canvas id="chartASABubble" style={{ display: gatedChartsReady ? 'block' : 'none' }}></canvas></div>
            </div>
          </div>
        </section>

        {/* 4.2 Brand Protection */}
        <section className="sec sec-l">
          <div className="wrap rv">
            <span className="tag" style={{ color: 'var(--ch4)', borderColor: 'var(--ch4)' }}>Section 4.2</span>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>Brand Protection &amp; Share of Voice</h3>
            <p style={{ color: '#666', fontSize: '.88rem', marginBottom: '16px' }}>Your brand name is your most valuable App Store asset. Defending your &ldquo;home turf&rdquo; is non-negotiable.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--ch4)', flexDirection: 'column', textAlign: 'center', padding: '24px 16px' }}><div className="ic-icon" style={{ background: 'rgba(0,244,244,.1)', margin: '0 auto 8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--ch4)' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><h4>Dominate SOV</h4><p style={{ fontSize: '.82rem' }}>Maximize Share of Voice for your brand keywords. Competitors bidding on your name should never appear above you.</p></div>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--ch4)', flexDirection: 'column', textAlign: 'center', padding: '24px 16px' }}><div className="ic-icon" style={{ background: 'rgba(0,244,244,.1)', margin: '0 auto 8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--ch4)' }}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></div><h4>Defensive Bidding</h4><p style={{ fontSize: '.82rem' }}>Use Custom Product Pages for specific features or promotions to capture competitor-related search intent.</p></div>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--ch4)', flexDirection: 'column', textAlign: 'center', padding: '24px 16px' }}><div className="ic-icon" style={{ background: 'rgba(0,244,244,.1)', margin: '0 auto 8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--ch4)' }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></div><h4>Conquest Campaigns</h4><p style={{ fontSize: '.82rem' }}>Strategically bid on competitor brand names to capture users actively searching for alternatives in your category.</p></div>
            </div>
          </div>
        </section>

        <section className="sec sec-l">
          <div className="wrap rv">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="info-card rv" style={{ margin: 0, borderTop: '3px solid var(--ch4)', flexDirection: 'column' }}>
                <span className="tag" style={{ color: 'var(--ch4)', borderColor: 'var(--ch4)', marginBottom: '4px' }}>4.3</span>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>The ASA-ASO &ldquo;Halo Effect&rdquo;</h4>
                <ul className="blist" style={{ margin: 0 }}><li><strong>Keyword Intelligence:</strong> ASA acts as the R&amp;D lab for ASO. Winning keywords are integrated into App Store metadata to boost organic rankings.</li><li><strong>Conversion Rate Synergy:</strong> Insights from ASA creative testing — which screenshots drive the highest TTR — iterate on the organic store listing.</li></ul>
              </div>
              <div className="info-card rv" style={{ margin: 0, borderTop: '3px solid var(--ch4)', flexDirection: 'column' }}>
                <span className="tag" style={{ color: 'var(--ch4)', borderColor: 'var(--ch4)', marginBottom: '4px' }}>4.4</span>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Custom Product Pages: Matching Intent</h4>
                <ul className="blist" style={{ margin: 0 }}><li><strong>Intent-Based Visuals:</strong> Users searching competitive keywords land on pages highlighting your competitive edge. Utility searches see efficiency-focused visuals.</li><li><strong>Seamless Continuity:</strong> This alignment significantly increases conversion rates, as Apple&apos;s algorithm rewards relevance over raw spend with lower CPAs.</li></ul>
              </div>
            </div>
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap rv">
            <div style={{ background: 'linear-gradient(135deg,var(--dark2),#0a1628)', borderRadius: 'var(--r-lg)', padding: '40px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '32px', alignItems: 'center', color: '#fff' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 700, color: 'var(--ch4)', lineHeight: 1.2, marginBottom: '8px' }}>DSP + OEM<br />+ ASA</div>
                <span className="insight-badge" style={{ background: 'rgba(0,244,244,.1)', color: 'var(--ch4)', borderColor: 'rgba(0,244,244,.2)' }}>Cross-Channel</span>
              </div>
              <div>
                <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>4.5 The Demand Capture Flywheel</h4>
                <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.88rem', lineHeight: 1.7 }}>When you run high-impact campaigns via DSP or OEM, brand searches surge. By increasing your ASA presence during these periods, you capture 100% of that &ldquo;manufactured&rdquo; demand at the most efficient price point. ASA does not exist in a vacuum — it is the net that catches the demand created by your other channels.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CALCULATOR TEASER */}
        <section className="sec sec-l rv" id="calculatorTeaser">
          <div className="wrap" style={{ textAlign: 'center' }}>
            <span className="insight-badge" style={{ marginBottom: '12px', display: 'inline-block' }}>Interactive Tool</span>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>
              Calculate Your Optimal Channel Mix
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 20px', fontSize: '0.92rem' }}>
              Input your app category, budget, and goals — get a personalized channel allocation with estimated CAC and ROAS.
            </p>
            <a href="/calculator" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '14px 36px' }}
               onClick={() => trackEvent('cta_click', 'calculator_teaser', { destination: 'calculator' })}>
              Open ROI Calculator &rarr;
            </a>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="sec sec-l" style={{ padding: '56px 0' }}>
          <div className="wrap">
            <div className="toc-label rv">What Our Partners Say</div>
            <h3 className="rv" style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: 700, textAlign: 'center', color: '#222', marginBottom: '36px' }}>Trusted by Growth Teams Worldwide</h3>
            <div className="testimonial-grid rv">
              <div className="testimonial-card">
                <div className="testi-quote">&ldquo;AppSamurai has been a vital partner for Magiclab Studio&apos;s games via their rewarded UA campaigns. Their ability to deliver high-quality users at scale has been instrumental in our growth strategy.&rdquo;</div>
                <div className="testi-author"><div className="testi-avatar" style={{ background: 'var(--green)' }}>ME</div><div><strong>Mert Ersoz</strong><br /><span>Head of Growth, MagicLab</span></div></div>
              </div>
              <div className="testimonial-card">
                <div className="testi-quote">&ldquo;AppSamurai&apos;s strategic programmatic advertising expertise helped SHAHID boost user acquisition and achieve our subscription targets in a highly competitive streaming market.&rdquo;</div>
                <div className="testi-author"><img className="testi-avatar" src="/ali-shahid.png" alt="Ali Aktas" style={{ objectFit: 'cover' }} /><div><strong>Ali Aktas</strong><br /><span>Head of Performance, Shahid</span></div></div>
              </div>
              <div className="testimonial-card">
                <div className="testi-quote">&ldquo;Partnering with AppSamurai has been a game-changer for us. Their growth strategies helped us exceed CPA and ROAS goals while maintaining user quality across all channels.&rdquo;</div>
                <div className="testi-author"><div className="testi-avatar" style={{ background: 'var(--purple)' }}>AC</div><div><strong>Aleyna Cerrah</strong><br /><span>UA Manager, APPS</span></div></div>
              </div>
            </div>
            {/* Success metrics strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px', marginTop: '24px' }} className="rv success-grid">
              {[
                { val: '72.3%', label: 'Purchase Increase', co: 'Beymen', color: 'var(--green)' },
                { val: '4\u00d7', label: 'ROAS KPI Surpassed', co: 'Gram Games', color: 'var(--purple)' },
                { val: '230%', label: 'DAU Increase', co: 'Fitplan', color: 'var(--green)' },
                { val: '107%', label: 'ROAS Achieved', co: 'APPS', color: 'var(--purple)' },
                { val: '46%', label: 'Retention Boost', co: 'Amazon Photos', color: 'var(--green)' },
              ].map((item) => (
                <div key={item.co} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '20px 16px', textAlign: 'center', borderTop: `3px solid ${item.color}` }}>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.6rem', fontWeight: 800, color: item.color }}>{item.val}</div>
                  <div style={{ fontSize: '.78rem', color: '#666', margin: '4px 0' }}>{item.label}</div>
                  <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '.5px' }}>{item.co}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PDF Gate */}
        <section className="gate" style={{ padding: '36px 0' }}>
          <div className="gate-inner rv">
            <div className="gate-icon">&#128196;</div>
            <h2>Download the Full Report as PDF</h2>
            <p>Save the complete 2026 Growth Strategy Guide — all 4 chapters, charts, case studies, and frameworks.</p>
            <div className="gate-form"><input className="gate-input" type="email" placeholder="Enter your work email" /><button className="gate-submit">Download PDF</button></div>
            <div className="gate-note">Instant download. No spam.</div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="about" id="about">
          <div className="wrap"><div className="about-grid">
            <div className="rv">
              <div className="about-tag">About AppSamurai</div>
              <h2>The Growth Platform Built for Mobile</h2>
              <p>AppSamurai is a global mobile growth platform empowering apps to scale through AI-powered programmatic advertising, rewarded user acquisition, OEM on-device discovery, and Apple Search Ads management.</p>
              <p>Our integrated ecosystem — including the AppsPrize rewards platform — enables growth teams to acquire high-value users, optimize retention, and maximize lifetime value across every stage of the funnel.</p>
              <div className="about-stats">
                <div><strong>10,000+</strong><span>Campaigns Managed</span></div>
                <div><strong>3B+</strong><span>Users Reached</span></div>
                <div><strong>50+</strong><span>Countries</span></div>
              </div>
              <a href="https://appsamurai.com/contact" className="btn-primary" style={{ marginTop: '16px' }} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('cta_click', 'about', { destination: 'contact' })}>Get in Touch &rarr;</a>
            </div>
            <div className="rv-r">
              <div className="pillar-grid">
                <div className="pillar"><div className="pillar-icon">&#128640;</div><h4>DSP</h4><p>AI-Powered Programmatic</p></div>
                <div className="pillar"><div className="pillar-icon">&#127918;</div><h4>Rewarded</h4><p>Playtime &amp; Offerwalls</p></div>
                <div className="pillar"><div className="pillar-icon">&#128241;</div><h4>OEM</h4><p>On-Device Discovery</p></div>
                <div className="pillar"><div className="pillar-icon">&#128269;</div><h4>ASA</h4><p>Search Ads &amp; ASO</p></div>
                <div className="pillar"><div className="pillar-icon">&#127942;</div><h4>AppsPrize</h4><p>Publisher Monetization</p></div>
                <div className="pillar"><div className="pillar-icon">&#128200;</div><h4>Analytics</h4><p>Attribution &amp; LTV</p></div>
              </div>
            </div>
          </div></div>
        </section>

        {/* FINAL CTA */}
        <section className="sec sec-w" style={{ textAlign: 'center' }}>
          <div className="wrap">
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>
              Ready to Put This Playbook Into Action?
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto 24px', lineHeight: 1.7 }}>
              Our growth team has helped 500+ apps scale with the exact strategies in this playbook. Let&apos;s build your custom growth plan.
            </p>
            <a href="https://appsamurai.com/contact" target="_blank" rel="noopener noreferrer"
               className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', fontSize: '1rem', padding: '16px 40px' }}
               onClick={() => trackEvent('cta_click', 'final_cta', { destination: 'contact' })}>
              Talk to Our Growth Team &rarr;
            </a>
          </div>
        </section>

      </div>{/* END gatedContent */}

      {/* FOOTER */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">App<span>Samurai</span></div>
              <p>The Growth Platform Built for Mobile</p>
            </div>
            <div className="footer-col">
              <h4>Solutions</h4>
              <a href="https://appsamurai.com/dsp" target="_blank" rel="noopener noreferrer">DSP Engine</a>
              <a href="https://appsamurai.com/rewarded-playtime" target="_blank" rel="noopener noreferrer">Rewarded Playtime</a>
              <a href="https://appsamurai.com/oem" target="_blank" rel="noopener noreferrer">OEM Discovery</a>
              <a href="https://appsamurai.com/apple-search-ads" target="_blank" rel="noopener noreferrer">Apple Search Ads</a>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <a href="https://appsamurai.com/blog" target="_blank" rel="noopener noreferrer">Blog</a>
              <a href="https://appsamurai.com/success-stories" target="_blank" rel="noopener noreferrer">Success Stories</a>
              <a href="https://appsamurai.com/documentation" target="_blank" rel="noopener noreferrer">Documentation</a>
              <a href="#hero">This Playbook</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="https://appsamurai.com/about" target="_blank" rel="noopener noreferrer">About</a>
              <a href="https://appsamurai.com/culture" target="_blank" rel="noopener noreferrer">Culture</a>
              <a href="https://appsamurai.com/careers" target="_blank" rel="noopener noreferrer">Careers</a>
              <a href="https://appsamurai.com/contact" target="_blank" rel="noopener noreferrer">Contact</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 AppSamurai. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* LEAD BAR */}
      <div className="lead-bar" id="leadBar">
        <p>Get the full 2026 Mobile Growth Playbook</p>
        <button className="btn-primary" onClick={() => { trackEvent('cta_click', 'lead_bar', { destination: 'gate' }); scrollTo('emailGate'); }}>Unlock Full Report</button>
      </div>
    </>
  );
}
