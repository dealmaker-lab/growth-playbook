'use client';

import { useRef, useState, useCallback } from 'react';

interface EmailGateProps {
  title?: string;
  description?: string;
  socialProof?: string;
  ebookSlug?: string;
  onUnlock: (scroll: boolean) => void;
  trackEvent: (event_type: string, section?: string, metadata?: Record<string, unknown>) => void;
}

export default function EmailGate({
  title = 'Unlock the Full 2026 Strategy Guide',
  description = 'The rest covers Rewarded Playtime (Chapter 2), OEM preloads on Samsung, Xiaomi, and Huawei (Chapter 3), and Apple Search Ads + ASO strategy (Chapter 4), plus the interactive ROI calculator.',
  socialProof = 'Join <strong>2,500+</strong> growth leaders who\u2019ve read this playbook',
  ebookSlug,
  onUnlock,
  trackEvent,
}: EmailGateProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | false>(false);
  const [success, setSuccess] = useState(false);
  const [liftingDone, setLiftingDone] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(async () => {
    const email = emailRef.current?.value.trim() || '';
    setError(false);

    if (formRef.current) {
      formRef.current.classList.remove('shake', 'invalid');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (emailRef.current) emailRef.current.style.borderColor = '#F87171';
      if (formRef.current) {
        formRef.current.classList.add('invalid');
        void formRef.current.offsetWidth;
        formRef.current.classList.add('shake');
      }
      setError('Please enter a valid work email address');
      return;
    }

    setLoading(true);
    if (emailRef.current) emailRef.current.style.borderColor = 'var(--green)';

    try {
      const params = new URLSearchParams(window.location.search);

      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          playbook_slug: ebookSlug || 'growth-playbook',
          utm_source: params.get('utm_source') || undefined,
          utm_medium: params.get('utm_medium') || undefined,
          utm_campaign: params.get('utm_campaign') || undefined,
          referrer: document.referrer || undefined,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        trackEvent('gate_unlock', 'gate', { email_domain: email.split('@')[1] });
        setTimeout(() => {
          setLiftingDone(true);
          onUnlock(true);
        }, 1500);
      } else {
        const data = await res.json().catch(() => null);
        if (res.status === 429) {
          setError('Too many attempts. Please try again later.');
        } else if (data?.error) {
          setError(data.error);
        } else {
          setError('Something went wrong. Please try again.');
        }
        setLoading(false);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }, [ebookSlug, onUnlock, trackEvent]);

  return (
    <section
      className={`gate${liftingDone ? ' gate-lifting' : ''}`}
      id="emailGate"
      onAnimationEnd={(e) => { if (e.animationName === 'liftUp') { (e.currentTarget as HTMLElement).style.display = 'none'; } }}
    >
      <div className="gate-inner rv">
        {success ? (
          <div className="gate-success">
            <div className="checkmark">&#10003;</div>
            <div className="success-msg">Welcome! Unlocking your content...</div>
          </div>
        ) : (
          <>
            <div className="gate-icon">&#128274;</div>
            <h2>{title}</h2>
            <p>{description}</p>
            <div className="gate-form" id="gateForm" ref={formRef}>
              <input
                className="gate-input"
                type="email"
                placeholder="Enter your work email"
                id="gateEmail"
                ref={emailRef}
                required
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); } }}
              />
              <button
                className={`gate-submit${loading ? ' btn-loading' : ''}`}
                id="gateBtn"
                onClick={handleSubmit}
              >
                {loading ? (
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
            {error && <div className="gate-error-msg" style={{ opacity: 1, fontSize: '.75rem', color: '#F87171', marginTop: '8px', textAlign: 'center' }}>{error}</div>}
            <div className="social-proof" style={{ marginTop: '12px' }} dangerouslySetInnerHTML={{ __html: socialProof }} />
            <div className="gate-note">No spam. Instant access. Unsubscribe anytime.</div>
          </>
        )}
      </div>
    </section>
  );
}
