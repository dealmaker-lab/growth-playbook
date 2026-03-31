'use client';
import { useEffect, useRef } from 'react';
import { Chart } from '@antv/g2';

type ChartConfigurator = (chart: Chart) => void;

/**
 * Shared hook for AntV G2 charts. Handles lifecycle (create → render → destroy)
 * and optional data updates via changeData.
 *
 * @param configure - Called once to set up marks, encodings, scales, etc.
 * @param deps - When deps change and the chart exists, calls chart.changeData(buildData(deps))
 * @param options.buildData - Produces new data array from deps (for tab-switching charts)
 * @param options.height - Fixed chart height (omit for autoFit-only)
 */
export function useG2Chart(
  configure: ChartConfigurator,
  deps: unknown[] = [],
  options?: {
    buildData?: (...args: unknown[]) => unknown[];
    height?: number;
  }
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // If chart exists and we have a data builder, just swap data
    if (chartRef.current && options?.buildData) {
      const newData = options.buildData(...deps);
      chartRef.current.changeData(newData);
      return;
    }

    // Don't re-create if chart already exists (static charts)
    if (chartRef.current) return;

    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
      ...(options?.height ? { height: options.height } : {}),
    });

    configure(chart);

    chart.render();
    chartRef.current = chart;

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}
