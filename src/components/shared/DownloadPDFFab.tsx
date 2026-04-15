'use client';

import { useCallback, useEffect, useState } from 'react';

interface DownloadPDFFabProps {
  slug: string;
  unlocked: boolean;
  gateAnchor?: string;
  trackEvent?: (event_type: string, section?: string, metadata?: Record<string, unknown>) => void;
}

/**
 * Mobile-only floating "Download PDF" action button. CSS gates it to
 * viewports ≤ 900px, so desktop users see the regular in-page button.
 * Hidden until the user has scrolled past the hero.
 */
export default function DownloadPDFFab({
  slug,
  unlocked,
  gateAnchor = 'emailGate',
  trackEvent,
}: DownloadPDFFabProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = useCallback(() => {
    if (!unlocked) {
      trackEvent?.('cta_click', 'pdf_fab', { slug, destination: 'gate', locked: true });
      document.getElementById(gateAnchor)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    trackEvent?.('pdf_download', 'pdf_fab', { slug });
    setTimeout(() => window.print(), 120);
  }, [unlocked, trackEvent, slug, gateAnchor]);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="pdf-fab"
      data-locked={unlocked ? 'false' : 'true'}
      onClick={handleClick}
      aria-label={unlocked ? 'Download as PDF' : 'Unlock to download PDF'}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {unlocked ? (
          <>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </>
        ) : (
          <>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </>
        )}
      </svg>
      {unlocked ? 'PDF' : 'Unlock PDF'}
    </button>
  );
}
