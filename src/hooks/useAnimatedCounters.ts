import { useCallback } from 'react';

export function useAnimatedCounters() {
  return useCallback(() => {
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
}
