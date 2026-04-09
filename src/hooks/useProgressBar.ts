import { useEffect, useRef } from 'react';

export function useProgressBar(gateUnlocked: boolean) {
  const lastY = useRef(0);

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
      const hiding = y > lastY.current && y > 200;
      if (nav) nav.classList.toggle('hide', hiding);
      lastY.current = y;
    }

    function onScroll() {
      updateProgress();
      updateNav();

      // Lead bar — only show when content is locked
      const bar = document.getElementById('leadBar');
      const gate = document.getElementById('emailGate');
      if (bar) {
        if (gateUnlocked) {
          bar.classList.remove('show');
        } else if (gate) {
          const gateTop = gate.getBoundingClientRect().top;
          bar.classList.toggle(
            'show',
            window.scrollY > window.innerHeight && gateTop > 0
          );
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [gateUnlocked]);
}
