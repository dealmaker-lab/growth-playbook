'use client';

import { useCallback, useState, type ReactNode } from 'react';

interface DownloadPDFButtonProps {
  /** Playbook slug — emitted on analytics events and used in the cookie check. */
  slug: string;
  /** When content is locked, clicking the button scrolls to this element id. */
  gateAnchor?: string;
  /** Button label. Defaults to "Download PDF". */
  label?: ReactNode;
  /** Visual variant. */
  variant?: 'primary' | 'outline' | 'ghost';
  /** Extra className appended to the rendered <button>. */
  className?: string;
  /** Inline style overrides. */
  style?: React.CSSProperties;
  /** Whether the playbook content is unlocked (from the email gate). */
  unlocked: boolean;
  /** Called when the user tries to download while locked (so callers can unlock first). */
  onLocked?: () => void;
  /** Analytics hook. */
  trackEvent?: (event_type: string, section?: string, metadata?: Record<string, unknown>) => void;
  /** Analytics section name. */
  section?: string;
}

/**
 * Triggers window.print() so the user can save the page as a PDF on any device
 * (iOS Safari, Android Chrome, desktop browsers — all expose "Save as PDF" from
 * the native print dialog). We lean on the existing print stylesheet to clean
 * up the layout.
 *
 * If the content is still gated, clicking this scrolls to the email gate
 * instead of printing the locked preview.
 */
export default function DownloadPDFButton({
  slug,
  gateAnchor = 'emailGate',
  label,
  variant = 'outline',
  className,
  style,
  unlocked,
  onLocked,
  trackEvent,
  section = 'download_pdf',
}: DownloadPDFButtonProps) {
  const [preparing, setPreparing] = useState(false);

  const handleClick = useCallback(() => {
    if (!unlocked) {
      trackEvent?.('cta_click', section, { slug, destination: 'gate', locked: true });
      onLocked?.();
      const el = document.getElementById(gateAnchor);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    trackEvent?.('pdf_download', section, { slug });
    setPreparing(true);

    // Give the button a beat to reflect the state, then fire the print dialog.
    // window.print() is synchronous and modal; we reset state on the next tick.
    setTimeout(() => {
      try {
        window.print();
      } finally {
        setPreparing(false);
      }
    }, 120);
  }, [unlocked, trackEvent, section, slug, onLocked, gateAnchor]);

  const baseClass =
    variant === 'primary' ? 'btn-primary' : variant === 'ghost' ? 'btn-ghost' : 'btn-outline';

  return (
    <button
      type="button"
      className={`${baseClass} download-pdf-btn${className ? ` ${className}` : ''}`}
      style={style}
      onClick={handleClick}
      aria-label={unlocked ? 'Download this playbook as PDF' : 'Unlock to download PDF'}
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
        style={{ marginRight: 8, flexShrink: 0 }}
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {preparing ? 'Preparing…' : label ?? 'Download PDF'}
    </button>
  );
}
