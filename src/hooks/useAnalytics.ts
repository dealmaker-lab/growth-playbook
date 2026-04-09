import { useCallback, useEffect, useRef } from 'react';

export function useAnalytics(sectionIds: string[]) {
  const sessionId = useRef('');
  const maxScrollDepth = useRef(0);

  const trackEvent = useCallback((event_type: string, section?: string, metadata?: Record<string, unknown>) => {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId.current, event_type, section, metadata }),
    }).catch(() => {}); // fire and forget
  }, []);

  // page_view + scroll_depth on beforeunload
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

  // section_view via IntersectionObserver
  useEffect(() => {
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
    return () => obs.disconnect();
  }, [trackEvent, sectionIds]);

  return { trackEvent };
}
