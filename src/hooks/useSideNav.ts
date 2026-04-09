import { useCallback } from 'react';

export interface SideNavSection {
  id: string;
  color: string;
}

export function useSideNav(sections: SideNavSection[]) {
  return useCallback(() => {
    const ids = sections.map((s) => s.id);
    const colorMap: Record<string, string> = {};
    sections.forEach((s) => { colorMap[s.id] = s.color; });

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
              const c = colorMap[entry.target.id] || '#26BE81';
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
  }, [sections]);
}
