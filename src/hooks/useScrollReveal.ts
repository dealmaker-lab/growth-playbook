import { useCallback } from 'react';

export function useScrollReveal() {
  return useCallback(() => {
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
}
