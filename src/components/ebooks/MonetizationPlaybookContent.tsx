'use client';

import { useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import TopNav from '../shared/TopNav';
import Footer from '../shared/Footer';
import SideNav from '../shared/SideNav';
import ProgressBar from '../shared/ProgressBar';
import EmailGate from '../shared/EmailGate';
import LeadBar from '../shared/LeadBar';
import RelatedEbooks from '../shared/RelatedEbooks';
import RevenueSplitChart from '../charts/mp/RevenueSplitChart';
import DTCAdoptionChart from '../charts/mp/DTCAdoptionChart';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useAnimatedCounters } from '@/hooks/useAnimatedCounters';
import { useSideNav } from '@/hooks/useSideNav';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useProgressBar } from '@/hooks/useProgressBar';

const ANALYTICS_SECTIONS = ['mp-hero', 'mp-intro', 'mp-toc', 'mp-ch1', 'mp-ch2', 'mp-ch3', 'mp-ch4', 'mp-ch5', 'mp-ch6', 'mp-ch7', 'mp-ch8', 'mp-ch9', 'mp-ch10', 'emailGate'];

const SIDE_NAV_SECTIONS = [
  { id: 'mp-hero', color: '#f48dff' },
  { id: 'mp-toc', color: '#f48dff' },
  { id: 'mp-ch1', color: '#af9cff' },
  { id: 'mp-ch2', color: '#f4cb00' },
  { id: 'mp-ch3', color: '#26BE81' },
  { id: 'mp-ch4', color: '#00c4c4' },
  { id: 'mp-ch5', color: '#f48dff' },
  { id: 'mp-ch6', color: '#af9cff' },
  { id: 'mp-ch7', color: '#f4cb00' },
  { id: 'mp-ch8', color: '#26BE81' },
  { id: 'mp-ch9', color: '#00c4c4' },
  { id: 'mp-ch10', color: '#f48dff' },
];

const SIDE_NAV_ITEMS = [
  { id: 'mp-hero', label: 'Home', defaultColor: 'var(--pink)' },
  { id: 'mp-toc', label: 'Contents' },
  { id: 'mp-ch1', label: 'Genres' },
  { id: 'mp-ch2', label: 'Why Evolve' },
  { id: 'mp-ch3', label: 'The Stack' },
  { id: 'mp-ch4', label: 'LiveOps' },
  { id: 'mp-ch5', label: 'DTC' },
  { id: 'mp-ch6', label: 'Retention' },
  { id: 'mp-ch7', label: 'UA' },
  { id: 'mp-ch8', label: 'Principles' },
  { id: 'mp-ch9', label: 'Metrics' },
  { id: 'mp-ch10', label: 'Takeaways' },
];

interface MonetizationPlaybookContentProps {
  initialUnlocked: boolean;
}

// Branded insight callout — reuses the .rp-play visual system with a custom label.
function PlayTip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rp-play rv">
      <div className="rp-play-label">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M10 8.5l5 3.5-5 3.5z" fill="currentColor" stroke="none" />
        </svg>
        {label}
      </div>
      {children}
    </div>
  );
}

export default function MonetizationPlaybookContent({ initialUnlocked }: MonetizationPlaybookContentProps) {
  const [gateUnlocked, setGateUnlocked] = useState(initialUnlocked);

  const initReveal = useScrollReveal();
  const initCounters = useAnimatedCounters();
  const initSideNav = useSideNav(SIDE_NAV_SECTIONS);
  const { trackEvent } = useAnalytics(ANALYTICS_SECTIONS);
  useProgressBar(gateUnlocked);

  useEffect(() => {
    initReveal();
    initCounters();
    initSideNav();
    if (gateUnlocked) {
      setTimeout(() => requestAnimationFrame(() => { initReveal(); initCounters(); }));
    }
  }, [initReveal, initCounters, initSideNav, gateUnlocked]);

  const unlockGatedContent = useCallback((scroll: boolean) => {
    setGateUnlocked(true);
    setTimeout(() => { initReveal(); initCounters(); }, 500);
    if (scroll) {
      setTimeout(() => { document.getElementById('mp-ch3')?.scrollIntoView({ behavior: 'smooth' }); }, 500);
    }
  }, [initReveal, initCounters]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const ebookLinks = useMemo(() => [
    { href: '/growth-playbook', label: 'Mobile Growth Playbook' },
    { href: '/rewarded-playtime', label: 'Rewarded Playtime Handbook' },
    { href: '/monetization-playbook', label: 'Monetization Playbook' },
    { href: '/calculator', label: 'ROI Calculator' },
  ], []);

  return (
    <>
      <ProgressBar />
      <TopNav ebookLinks={ebookLinks} />
      <SideNav sections={SIDE_NAV_ITEMS} />

      {/* HERO */}
      <div className="hero-wrap" style={{ background: 'linear-gradient(180deg, #2a0845 0%, #1A1A2E 100%)' }}>
        <section className="hero hero-dark" id="mp-hero" style={{ minHeight: '70vh' }}>
          <div className="rv" style={{ textAlign: 'center' }}>
            <span className="hero-badge" style={{ background: 'rgba(244,141,255,.15)', color: '#f48dff', border: '1px solid rgba(244,141,255,.3)' }}>AppSamurai for Games</span>
            <h1 style={{ color: '#fff' }}>
              Monetization <em style={{ fontStyle: 'normal', color: '#f48dff' }}>Playbook</em>
            </h1>
            <p style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1rem,2vw,1.3rem)', fontWeight: 600, marginBottom: '16px', letterSpacing: '-.01em' }}>
              For Casual &amp; Hybrid Casual Games
            </p>
            <p className="hero-sub">
              A 2025&ndash;2026 field guide to revenue strategy, LiveOps, ad models, IAP, and emerging channels &mdash; built for game developers, product managers, and monetization leads.
            </p>
            <div className="hero-cta">
              <button className="btn-primary" onClick={() => scrollTo('mp-toc')}>
                Explore the Playbook <span>&darr;</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* KEY METRICS BENTO */}
      <section className="bento" id="mpBento">
        <div className="wrap">
          <div className="bento-grid">
            <div className="bento-card b-green rv">
              <div className="bento-val" style={{ color: 'var(--green)' }} data-count="82" data-prefix="$" data-suffix="B">$0B</div>
              <div className="bento-lbl">Total Mobile Game IAP Spend, 2024</div>
              <span className="delta pos">Source: Sensor Tower</span>
            </div>
            <div className="bento-card b-pink rv">
              <div className="bento-val" style={{ color: 'var(--pink)' }} data-count="37" data-prefix="+" data-suffix="%">+0%</div>
              <div className="bento-lbl">Hybrid Casual IAP Revenue Growth, 2024</div>
              <span className="delta pos">YoY &middot; Sensor Tower</span>
            </div>
            <div className="bento-card b-purple rv">
              <div className="bento-val" style={{ color: 'var(--purple)' }} data-count="84" data-suffix="%">0%</div>
              <div className="bento-lbl">Of Mobile IAP Revenue Came From LiveOps Games</div>
              <span className="delta pos">2024 &middot; Adjust</span>
            </div>
            <div className="bento-card b-cyan rv">
              <div className="bento-val" style={{ color: 'var(--cyan-d)' }} data-count="48" data-prefix="~" data-suffix="%">~0%</div>
              <div className="bento-lbl">Of Top-50 US iOS Grossing Games Run DTC</div>
              <span className="delta pos">Nov 2025 &middot; Naavik</span>
            </div>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="sec sec-w" id="mp-intro">
        <div className="wrap rv">
          <span className="insight-badge">Introduction</span>
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>The Monetization Landscape Has Changed</h3>
          <p style={{ fontSize: '.95rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px', marginBottom: '14px' }}>
            The mobile gaming industry has matured well past the heyday of hyper-casual &mdash; and the rules of monetization have matured with it. The pure ad-based models that once powered chart-topping hyper-casual titles can no longer sustain profitability on their own. A richer, more layered approach has taken their place: one that combines ads, in-app purchases, subscriptions, LiveOps, and, increasingly, direct-to-consumer channels.
          </p>
          <p style={{ fontSize: '.95rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px', marginBottom: '14px' }}>
            Casual and hybrid casual games sit at the center of this shift. They are the genres best positioned to capture the full spectrum of modern monetization: accessible enough to acquire users at scale, engaging enough to convert them into spenders.
          </p>
          <p style={{ fontSize: '.95rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px' }}>
            This playbook is written for game developers, product managers, and monetization leads working in casual and hybrid casual mobile games. It replaces outdated frameworks with current, data-backed strategies drawn from the latest industry reports and market behavior as of mid-2026.
          </p>
        </div>
      </section>

      {/* TOC */}
      <section className="toc" id="mp-toc">
        <div className="wrap">
          <div className="toc-label rv">What&apos;s Inside</div>
          <h2 className="rv">Monetization Playbook</h2>
          <div className="toc-grid">
            <a href="#mp-ch1" className="toc-card rv" style={{ borderLeftColor: 'var(--purple)' }}><div className="toc-num" style={{ color: 'var(--purple)' }}>01</div><h3>The Genre Landscape</h3><p>The genre spectrum, the hybrid casual formula, and the meta layers that set the genre apart.</p></a>
            <a href="#mp-ch2" className="toc-card rv" style={{ borderLeftColor: 'var(--yellow)' }}><div className="toc-num" style={{ color: 'var(--yellow)' }}>02</div><h3>Why Strategy Must Evolve</h3><p>What broke the hyper-casual model, and the hybrid casual opportunity by the numbers.</p></a>
            <a href="#mp-ch3" className="toc-card rv" style={{ borderLeftColor: 'var(--green)' }}><div className="toc-num" style={{ color: 'var(--green)' }}>03</div><h3>The Monetization Stack</h3><p>IAA, IAP, subscriptions, and battle passes &mdash; the layered framework that wins.</p></a>
            <a href="#mp-ch4" className="toc-card rv" style={{ borderLeftColor: 'var(--cyan)' }}><div className="toc-num" style={{ color: 'var(--cyan-d)' }}>04</div><h3>LiveOps</h3><p>The engine of long-term revenue: calendars, core-loop alignment, and AI personalization.</p></a>
            <a href="#mp-ch5" className="toc-card rv" style={{ borderLeftColor: 'var(--pink)' }}><div className="toc-num" style={{ color: 'var(--pink)' }}>05</div><h3>Direct-to-Consumer</h3><p>The emerging revenue frontier: web stores, platform-fee bypass, and adoption data.</p></a>
            <a href="#mp-ch6" className="toc-card rv" style={{ borderLeftColor: 'var(--purple)' }}><div className="toc-num" style={{ color: 'var(--purple)' }}>06</div><h3>Retention</h3><p>The foundation of all monetization: benchmarks, design elements, and KPIs.</p></a>
            <a href="#mp-ch7" className="toc-card rv" style={{ borderLeftColor: 'var(--yellow)' }}><div className="toc-num" style={{ color: 'var(--yellow)' }}>07</div><h3>User Acquisition</h3><p>Post-ATT UA, rewarded playtime and engagement campaigns, and creative strategy.</p></a>
            <a href="#mp-ch8" className="toc-card rv" style={{ borderLeftColor: 'var(--green)' }}><div className="toc-num" style={{ color: 'var(--green)' }}>08</div><h3>Design Principles</h3><p>Day-one monetization design, the 95/5 rule, experience balance, and localization.</p></a>
            <a href="#mp-ch9" className="toc-card rv" style={{ borderLeftColor: 'var(--cyan)' }}><div className="toc-num" style={{ color: 'var(--cyan-d)' }}>09</div><h3>Metrics &amp; Benchmarks</h3><p>The signal system for monetization health, with target ranges per metric.</p></a>
            <a href="#mp-ch10" className="toc-card rv" style={{ borderLeftColor: 'var(--pink)' }}><div className="toc-num" style={{ color: 'var(--pink)' }}>10</div><h3>Key Takeaways</h3><p>Seven foundational principles for monetizing casual and hybrid casual games.</p></a>
          </div>
        </div>
      </section>

      {/* ───────────── CH 1: GENRE LANDSCAPE ───────────── */}
      <hr className="divider purple" />
      <section className="ch-head ch-purple" id="mp-ch1">
        <div className="wrap rv ch-enter-right" style={{ position: 'relative' }}>
          <span className="ch-bg-num">01</span>
          <div className="ch-num" style={{ color: 'var(--purple)' }}>1.0</div>
          <h2>Understanding the Genre Landscape</h2>
          <p style={{ fontSize: '.85rem', color: 'rgba(175,156,255,.8)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>Where your game sits determines how it earns</p>
          <div className="ch-desc">Before designing a monetization strategy, you need to know where your game sits on the genre spectrum. Each genre carries distinct player expectations, session behaviors, and revenue potential.</div>
        </div>
      </section>

      <section className="sec sec-w">
        <div className="wrap rv">
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>1.1 The Game Genre Spectrum</h3>
          <div className="table-scroll">
            <table className="infographic-table">
              <thead>
                <tr><th>Genre</th><th>Core Traits</th><th>Typical Session</th><th>Primary Revenue</th></tr>
              </thead>
              <tbody>
                <tr><td>Hyper-Casual</td><td>One-tap mechanic, minimal UI, instant action, no meta</td><td>30&ndash;90 seconds</td><td>90&ndash;95% ads</td></tr>
                <tr><td>Casual</td><td>Simple mechanics + meta layers (match-3, puzzle, arcade)</td><td>5&ndash;10 minutes</td><td>50/50 ads + IAP</td></tr>
                <tr><td>Hybrid Casual</td><td>Hyper-casual core + mid-core meta + multi-stream monetization</td><td>10&ndash;25 minutes</td><td>Balanced IAP + ads + subs</td></tr>
                <tr><td>Mid-core</td><td>Complex mechanics, progression systems, community features</td><td>20&ndash;45 minutes</td><td>60&ndash;80% IAP</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="sec sec-l">
        <div className="wrap rv">
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text)' }}>1.2 The Hybrid Casual Formula</h3>
          <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px', marginBottom: '20px' }}>
            Hybrid casual games pair the viral simplicity of hyper-casual with the depth and monetization infrastructure of mid-core titles. The result is a game that acquires users easily and retains them profitably.
          </p>
          <div className="stat-callout rv" style={{ borderLeftColor: 'var(--purple)', marginBottom: '24px' }}>
            <div className="big-num" style={{ color: 'var(--purple)', fontSize: '1.5rem', minWidth: 'auto' }}>&#43;</div>
            <div className="stat-body">
              <h4>The Hybrid Casual Recipe</h4>
              <p>Casual/hyper-casual core game mechanic <strong>+</strong> mid-core meta layers (narrative, collecting, building, customization) <strong>+</strong> multi-stream monetization (ads + IAP + subscriptions) <strong>=</strong> hybrid casual game.</p>
            </div>
          </div>
          <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>Meta layers are the key differentiator:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { t: 'Narrative / Storyline', d: 'A game universe that creates emotional investment.', c: '#FCA5A5' },
              { t: 'Collecting', d: 'Completion mechanics that reward long-term engagement.', c: '#C4B5FD' },
              { t: 'Decorating / Building', d: 'Visible progression tied to the narrative.', c: '#DDA0DD' },
              { t: 'Customization', d: 'Player identity and attachment.', c: '#93E1F6' },
              { t: 'Game Modes', d: 'Variety that prevents repetition fatigue.', c: '#86EFAC' },
              { t: 'Progression Systems', d: 'XP, levels, season passes, and achievement ladders.', c: '#F9A8D4' },
            ].map((m) => (
              <div key={m.t} className="info-card" style={{ margin: 0, borderTop: `3px solid ${m.c}`, flexDirection: 'column' }}>
                <h4>{m.t}</h4>
                <p>{m.d}</p>
              </div>
            ))}
          </div>
          <PlayTip label="The Benchmark: Royal Match">
            <p>Royal Match is the reference example: a globally popular puzzle game with a decoration meta layer, where players earn stars per level to build and upgrade a game-world mansion. That combination of instant puzzle action and visual progression carried it to one of the most-played and highest-grossing titles in mobile gaming history.</p>
          </PlayTip>
        </div>
      </section>

      {/* ───────────── CH 2: WHY STRATEGY MUST EVOLVE ───────────── */}
      <hr className="divider yellow" />
      <section className="ch-head" id="mp-ch2" style={{ borderTop: '4px solid var(--yellow)' }}>
        <div className="wrap rv ch-enter-scale" style={{ position: 'relative' }}>
          <span className="ch-bg-num">02</span>
          <div className="ch-num" style={{ color: 'var(--yellow)' }}>2.0</div>
          <h2>Why Monetization Strategy Must Evolve</h2>
          <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>What broke the hyper-casual model</p>
          <div className="ch-desc">Hyper-casual built its dominance on massive download volume monetized purely through advertising. Three structural shifts eroded that model&rsquo;s profitability &mdash; and reshaped how every casual studio earns.</div>
        </div>
      </section>

      <section className="sec sec-w">
        <div className="wrap rv">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
            <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--yellow)', flexDirection: 'column' }}>
              <div className="ic-icon" style={{ background: 'var(--yellow-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></div>
              <h4>Apple&apos;s App Tracking Transparency</h4>
              <p>Introduced with iOS 14.5 in April 2021, ATT requires explicit user permission before tracking activity across apps and websites. Opt-in rates settled well below 50% in most markets &mdash; degrading ad-targeting precision, reducing eCPMs, and pushing up user acquisition costs for developers who rely on performance advertising.</p>
            </div>
            <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--yellow)', flexDirection: 'column' }}>
              <div className="ic-icon" style={{ background: 'var(--yellow-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg></div>
              <h4>Market Saturation</h4>
              <p>Hyper-casual games were easy to produce, so supply exploded. By 2022 the genre still led global downloads, but its repetitive nature drove engagement down: players churned faster, day-7 and day-30 retention fell, and LTVs stagnated. Publishers like Rollic saw game LTVs drop to ~$0.40 and made a deliberate shift toward $1.00+ LTVs through hybrid approaches.</p>
            </div>
            <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--yellow)', flexDirection: 'column' }}>
              <div className="ic-icon" style={{ background: 'var(--yellow-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><path d="M3 3v18h18" /><path d="M7 8l4 6 4-4 5 8" /></svg></div>
              <h4>Ad Revenue Compression</h4>
              <p>In 2024, publisher-side eCPMs dropped 20&ndash;30% while ad networks reported record profits &mdash; a structural shift in leverage that hurt studios relying on a single ad revenue stream. Hybrid monetization stopped being merely a growth strategy and became a survival strategy.</p>
            </div>
          </div>
          <PlayTip label="Key Insight">
            <p>Ad monetization alone is no longer a viable foundation for casual game profitability. The studios winning in 2025&ndash;2026 treat advertising as one layer in a multi-stream model &mdash; not the whole stack.</p>
          </PlayTip>
        </div>
      </section>

      <section className="sec sec-l">
        <div className="wrap rv">
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text)' }}>2.2 The Hybrid Casual Opportunity by the Numbers</h3>
          <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px', marginBottom: '20px' }}>
            The data leaves little room for debate: hybrid casual is the highest-growth segment in mobile gaming.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '20px' }}>
            <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--yellow)', margin: 0, padding: '20px', gap: '4px' }}>
              <div className="big-num" style={{ color: 'var(--yellow)', fontSize: '1.8rem', minWidth: 'auto' }} data-count="34" data-decimal="1" data-suffix="%">0%</div>
              <div className="stat-body"><h4>Download Growth</h4><p>Hybrid casual, YoY 2024 (Sensor Tower)</p></div>
            </div>
            <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--pink)', margin: 0, padding: '20px', gap: '4px' }}>
              <div className="big-num" style={{ color: 'var(--pink)', fontSize: '1.8rem', minWidth: 'auto' }} data-count="37" data-suffix="%">0%</div>
              <div className="stat-body"><h4>IAP Revenue Growth</h4><p>Hybrid casual, YoY 2024 (Sensor Tower)</p></div>
            </div>
            <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--green)', margin: 0, padding: '20px', gap: '4px' }}>
              <div className="big-num" style={{ color: 'var(--green)', fontSize: '1.8rem', minWidth: 'auto' }}>$174.8M</div>
              <div className="stat-body"><h4>App Store Revenue</h4><p>Hybrid casual, March 2025 alone (Gamigion)</p></div>
            </div>
            <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--cyan-d)', margin: 0, padding: '20px', gap: '4px' }}>
              <div className="big-num" style={{ color: 'var(--cyan-d)', fontSize: '1.8rem', minWidth: 'auto' }} data-count="13" data-suffix="%+">0%+</div>
              <div className="stat-body"><h4>Casual Market Growth</h4><p>Projected 2025, reaching $19.4B (Verve/Beresnev)</p></div>
            </div>
          </div>
          <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px' }}>
            These numbers describe a genre that has cracked the hard problem of combining broad accessibility with deep monetization. IAP spend growing 37% in a single year &mdash; while the broader mobile market grew IAP at just 4% &mdash; confirms that hybrid casual isn&rsquo;t merely growing. It is outperforming every other genre on the revenue dimension that matters most.
          </p>
        </div>
      </section>

      {/* EMAIL GATE — after Section 2 */}
      {!gateUnlocked && (
        <EmailGate
          title="Unlock the Full Monetization Playbook"
          description="Continue reading for the complete monetization stack (IAA, IAP, subscriptions, battle passes), the LiveOps engine, direct-to-consumer web stores, retention frameworks, UA strategy, and the metrics that define success."
          socialProof={<>Join <strong>2,500+</strong> growth leaders who read our playbooks</>}
          ebookSlug="monetization-playbook"
          onUnlock={unlockGatedContent}
          trackEvent={trackEvent}
        />
      )}

      {/* GATED CONTENT */}
      <div id="gatedContent" data-nosnippet className={`${gateUnlocked ? 'gated-locked unlocked' : 'gated-locked'}${gateUnlocked && !initialUnlocked ? ' gated-reveal' : ''}`}>

        {/* ───────────── CH 3: THE MONETIZATION STACK ───────────── */}
        <hr className="divider green" />
        <section className="ch-head ch-green" id="mp-ch3">
          <div className="wrap rv ch-enter-left" style={{ position: 'relative' }}>
            <span className="ch-bg-num">03</span>
            <div className="ch-num" style={{ color: 'var(--green)' }}>3.0</div>
            <h2>The Monetization Stack</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>No single channel is enough</p>
            <div className="ch-desc">Modern casual and hybrid casual games run a layered monetization stack. The winning framework combines every layer below, tuned to your specific game and player base.</div>
          </div>
        </section>

        {/* 3.1 IAA */}
        <section className="sec sec-w">
          <div className="wrap rv">
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text)' }}>3.1 In-App Advertising (IAA)</h3>
            <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px', marginBottom: '16px' }}>
              <strong style={{ color: 'var(--text)' }}>The role of ads in 2025&ndash;2026.</strong> Even with IAP on the rise, advertising remains the largest monetization channel for casual and hyper-casual games. Its real job: monetizing the 95%+ of players who will never make a purchase &mdash; a segment that would otherwise generate zero direct revenue.
            </p>
            <PlayTip label="Benchmark">
              <p>82% of players prefer free games with optional ads over paid games &mdash; yet 46.8% cite ads as their biggest frustration. Balance and placement are everything. (Business of Apps, 2025)</p>
            </PlayTip>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, margin: '24px 0 8px', color: 'var(--text)' }}>Ad Formats and Where They Fit</h4>
            <div className="table-scroll">
              <table className="infographic-table">
                <thead>
                  <tr><th>Format</th><th>Best Use Case</th><th>Performance Notes</th></tr>
                </thead>
                <tbody>
                  <tr><td>Rewarded Video</td><td>After level fail, at energy depletion, before boss level</td><td>87% of players view positively; 80&ndash;90% completion rate (eMarketer, Apr 2025)</td></tr>
                  <tr><td>Interstitial</td><td>Between natural game breaks (level completion, session restart)</td><td>Strong CPMs; use sparingly to avoid churn</td></tr>
                  <tr><td>Playable Ads</td><td>UA creatives; in-game cross-promotion</td><td>High conversion; best for acquisition funnels</td></tr>
                  <tr><td>Banner</td><td>Ambient visibility; low-engagement moments</td><td>Lowest eCPM but non-intrusive</td></tr>
                  <tr><td>Native / Audio</td><td>Narrative and story-driven games</td><td>Emerging formats; non-disruptive; growing eCPMs</td></tr>
                </tbody>
              </table>
            </div>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, margin: '24px 0 8px', color: 'var(--text)' }}>Ad Pacing and Segmentation</h4>
            <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px', marginBottom: '16px' }}>
              Top studios in 2025 no longer apply one uniform ad strategy across their whole player base. They segment:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '16px' }}>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--green)' }}><div><h4>By UA Campaign Type</h4><p>Players acquired through paid UA and organic players often show different ad sensitivity.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--green)' }}><div><h4>By Lifecycle Stage</h4><p>New users get lighter ad loads; re-engaged users can support more.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--green)' }}><div><h4>By Spend Propensity</h4><p>Players who have made IAP purchases should see fewer ads and more purchase offers.</p></div></div>
            </div>
            <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px', marginBottom: '20px' }}>
              Studios like the team behind Hexa Sort have pioneered UA-campaign-aware monetization logic, where ad frequency and placement adapt based on which channel brought the player in.
            </p>
            <div className="chart-card-new rv">
              <h4>Revenue Split Benchmark (2025&ndash;2026)</h4>
              <div className="chart-subtitle">Ads vs. IAP share by genre &mdash; bars plot the midpoint of each published range; hybrid casual is drawn as an even split per its &ldquo;balanced blend&rdquo; description. Hover for the published figures (Source: Audiencelab, 2026)</div>
              <RevenueSplitChart />
              <p style={{ fontSize: '.8rem', color: 'var(--text-faint)', marginTop: '10px' }}>Published ranges: hyper-casual 85&ndash;95% ads / 5&ndash;15% IAP &middot; casual 40&ndash;60% ads / 40&ndash;60% IAP &middot; hybrid casual: balanced blend, weighted by meta depth &middot; mid-core 20&ndash;40% ads / 60&ndash;80% IAP.</p>
            </div>
          </div>
        </section>

        {/* 3.2 IAP */}
        <section className="sec sec-l">
          <div className="wrap rv">
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text)' }}>3.2 In-App Purchases (IAP)</h3>
            <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px', marginBottom: '16px' }}>
              <strong style={{ color: 'var(--text)' }}>The economics of IAP.</strong> Only about 5% of free-to-play players ever make a purchase. The entire IAP model is built to serve that engaged minority while keeping the game accessible and fun for everyone else. Those paying players punch far above their weight: the top 5% of iOS players account for roughly 20% of gaming revenue.
            </p>
            <div className="stat-callout rv" style={{ borderLeftColor: 'var(--green)', marginBottom: '20px' }}>
              <div className="big-num" style={{ color: 'var(--green)' }}>$80.9B</div>
              <div className="stat-body"><h4>Total Mobile Game IAP Revenue in 2024</h4><p>Mostly iOS-driven (Sensor Tower)</p></div>
            </div>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, margin: '0 0 12px', color: 'var(--text)' }}>Core IAP Categories</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
              {[
                { t: 'Virtual Currency', d: 'The universal in-game economy layer: coins, gems, tokens.' },
                { t: 'Consumables & Boosters', d: 'Power-ups, extra moves, skip-level items.' },
                { t: 'Lives / Energy Refills', d: 'Session extension when players hit natural gates.' },
                { t: 'Bundles', d: 'High-value starter packs and limited-time offers.' },
                { t: 'Exclusive Unlockables', d: 'Characters, skins, game modes.' },
                { t: 'Cosmetic Customizations', d: 'Player identity items that don’t affect game balance.' },
                { t: 'Battle Passes', d: 'Seasonal progression tracks with timed rewards.' },
                { t: 'Subscriptions', d: 'Recurring access to an ad-free experience, bonuses, or premium content.' },
              ].map((c) => (
                <div key={c.t} className="info-card" style={{ margin: 0, borderTop: '3px solid var(--green)', flexDirection: 'column', padding: '18px 16px' }}>
                  <h4 style={{ fontSize: '.85rem' }}>{c.t}</h4>
                  <p style={{ fontSize: '.78rem' }}>{c.d}</p>
                </div>
              ))}
            </div>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>IAP Conversion: Timing Decides</h4>
            <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px', marginBottom: '12px' }}>
              Contextually-timed IAP offers perform 3&ndash;5&times; better than scheduled promotions. The highest-converting moments:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', maxWidth: '780px' }}>
              {[
                'After 2–3 consecutive level failures',
                'At energy or life depletion',
                'During boss or key-level encounters',
                'Immediately after tutorial completion, while motivation is highest',
                'During limited-time events — scarcity triggers urgency',
              ].map((m) => (
                <li key={m} style={{ fontSize: '.88rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '18px', position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: 'var(--green)', fontWeight: 700 }}>&bull;</span>{m}</li>
              ))}
            </ul>
            <PlayTip label="Playbook Tip">
              <p>Identify your game&rsquo;s highest-friction moments early in development &mdash; these are your primary IAP trigger points. Event-level analytics platforms can measure conversion lift per trigger for ongoing optimization. Teams using this approach report 15&ndash;25% ARPU lifts. (SolarEngine, 2026)</p>
            </PlayTip>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, margin: '24px 0 8px', color: 'var(--text)' }}>Pricing Strategy</h4>
            <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px', marginBottom: '12px' }}>
              Don&rsquo;t lean on a single price point. An effective IAP ladder includes:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '780px' }}>
              {[
                ['Entry-level offers ($0.99–$2.99)', 'to lower the first-purchase barrier'],
                ['Mid-tier bundles ($4.99–$9.99)', 'as the volume driver'],
                ['High-value whale packages ($19.99–$99.99+)', 'for your most engaged spenders'],
                ['Personalized dynamic pricing', 'adapted to regional purchasing power'],
                ['Limited-time discounts', 'refreshed every 7–10 days to maintain urgency without fatigue'],
              ].map(([t, d]) => (
                <li key={t} style={{ fontSize: '.88rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '18px', position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: 'var(--green)', fontWeight: 700 }}>&bull;</span><strong style={{ color: 'var(--text)' }}>{t}</strong> {d}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3.3 Subscriptions + 3.4 Battle Passes */}
        <section className="sec sec-w">
          <div className="wrap rv">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="chart-card-new rv" style={{ margin: 0, borderTop: '3px solid var(--green)' }}>
                <h4 style={{ marginBottom: '10px' }}>3.3 Subscriptions</h4>
                <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '12px' }}>Subscriptions are the fastest-growing IAP format in mobile gaming, and increasingly viable for casual and hybrid casual titles. They deliver predictable recurring revenue and encourage long-term engagement. What works in a subscription:</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    'An ad-free experience — the most universally valued benefit',
                    'Daily bonus currency or boosters for subscribers',
                    'Early access to new content, levels, or seasonal events',
                    'VIP status signals (badges, exclusive cosmetics)',
                  ].map((s) => (
                    <li key={s} style={{ fontSize: '.85rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '18px', position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: 'var(--green)', fontWeight: 700 }}>&bull;</span>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="chart-card-new rv" style={{ margin: 0, borderTop: '3px solid var(--purple)' }}>
                <h4 style={{ marginBottom: '10px' }}>3.4 Battle Passes &amp; Seasonal Content</h4>
                <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '12px' }}>Popularized by Fortnite and now ubiquitous across mid-core, the battle pass has proven highly effective in hybrid casual games. A well-designed battle pass:</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    'Creates a timed progression track players engage with over 4–6 weeks',
                    'Rewards both free-tier and premium-tier players, keeping non-payers engaged',
                    'Provides natural IAP upsell moments (unlock tiers, accelerate progress)',
                    'Drives D7 and D30 retention as players return for daily and weekly missions',
                  ].map((s) => (
                    <li key={s} style={{ fontSize: '.85rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '18px', position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: 'var(--purple)', fontWeight: 700 }}>&bull;</span>{s}</li>
                  ))}
                </ul>
                <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>Battle passes also work symbiotically with LiveOps: each season becomes a content event that re-energizes the player base and creates urgency around the current pass before it expires.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── CH 4: LIVEOPS ───────────── */}
        <hr className="divider cyan" />
        <section className="ch-head" id="mp-ch4" style={{ borderTop: '4px solid var(--cyan)' }}>
          <div className="wrap rv ch-enter-right" style={{ position: 'relative' }}>
            <span className="ch-bg-num">04</span>
            <div className="ch-num" style={{ color: 'var(--cyan-d)' }}>4.0</div>
            <h2>LiveOps: The Engine of Long-Term Revenue</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>From launch-and-forget to launch-and-operate</p>
            <div className="ch-desc">Live Operations is the ongoing process of updating, optimizing, and expanding a game after launch &mdash; through real-time content, events, and personalized experiences, with no new app store submission required.</div>
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap rv">
            <PlayTip label="Industry Benchmark">
              <p>In 2024, 84% of all mobile IAP revenue came from games using LiveOps &mdash; and 95% of studios are now building or maintaining a live service title. (Adjust, 2025)</p>
            </PlayTip>
            <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px', margin: '20px 0' }}>
              LiveOps turns a static game into a living product. It matters most in free-to-play ecosystems, where revenue depends on keeping existing players engaged rather than constantly acquiring new ones &mdash; a priority that has only intensified as UA costs have risen.
            </p>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, margin: '0 0 12px', color: 'var(--text)' }}>4.2 LiveOps in 2025: What the Data Shows</h4>
            <p style={{ fontSize: '.9rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '780px', marginBottom: '12px' }}>From GameDesignBites&rsquo; analysis of the 2025 mobile landscape:</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '780px' }}>
              {[
                'The average number of LiveOps events per month rose from 73 to 89 in 2025',
                'Casual games run shorter, more frequent events to monetize quickly before disengagement',
                'Mid-core games favor longer events with fewer launches (~76/month)',
                'Short-term albums are replacing long-running collection systems',
                'Milestone-based progression and repeatable tournaments dominate LiveOps calendars',
              ].map((s) => (
                <li key={s} style={{ fontSize: '.88rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '18px', position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: 'var(--cyan-d)', fontWeight: 700 }}>&bull;</span>{s}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Oliver Yeh quote */}
        <section className="quote-block" style={{ background: 'var(--cyan-l)' }}>
          <div className="wrap"><div className="quote-inner rv">
            <div className="quote-avatar" style={{ width: 64, height: 64, background: 'var(--cyan-d)' }} aria-hidden="true">OY</div>
            <div>
              <p className="quote-text">The mobile gaming ecosystem has matured, with developers now doubling down on retention, engagement, and monetization. With user acquisition costs rising, studios have embraced strategies such as LiveOps and hybrid monetization to maximize long-term revenue.</p>
              <p className="quote-attr">Oliver Yeh, CEO at Sensor Tower</p>
            </div>
          </div></div>
        </section>

        <section className="sec sec-l">
          <div className="wrap rv">
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>4.3 Building a LiveOps Calendar</h4>
            <p style={{ fontSize: '.9rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '780px', marginBottom: '12px' }}>
              A LiveOps calendar has to balance event variety against pacing &mdash; a predictable or overloaded schedule breeds player fatigue. The recommended mix:
            </p>
            <div className="table-scroll">
              <table className="infographic-table">
                <thead>
                  <tr><th>Event Type</th><th>Frequency</th><th>Monetization Role</th></tr>
                </thead>
                <tbody>
                  <tr><td>Seasonal Events</td><td>Quarterly</td><td>Battle pass sales; limited IAP bundles</td></tr>
                  <tr><td>Limited-Time Offers (LTOs)</td><td>Weekly</td><td>Urgent IAP; first-purchase conversion</td></tr>
                  <tr><td>Daily Challenges</td><td>Daily</td><td>D1/D7 retention; rewarded ad engagement</td></tr>
                  <tr><td>Tournaments / Leaderboards</td><td>Weekly/Bi-weekly</td><td>Social competition; premium entry IAP</td></tr>
                  <tr><td>Milestone Campaigns</td><td>Monthly</td><td>Long-session encouragement; bundle upsell</td></tr>
                  <tr><td>Story Chapter Updates</td><td>Monthly/Seasonal</td><td>Retention; narrative meta deepening</td></tr>
                </tbody>
              </table>
            </div>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, margin: '24px 0 8px', color: 'var(--text)' }}>4.4 LiveOps and Core Loop Alignment</h4>
            <p style={{ fontSize: '.9rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '780px', marginBottom: '12px' }}>
              The most common LiveOps mistake is treating events as a layer separate from the core game. Top studios make their events feed the core loop:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '780px' }}>
              {[
                'Events should provide currency, boosters, or items that are useful in the main game',
                'Event rewards should tie into the meta layer (furniture for a decorating game, characters for a narrative RPG)',
                'Event mechanics should be recognizable extensions of the core mechanic — not arbitrary mini-games',
              ].map((s) => (
                <li key={s} style={{ fontSize: '.88rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '18px', position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: 'var(--cyan-d)', fontWeight: 700 }}>&bull;</span>{s}</li>
              ))}
            </ul>
            <PlayTip label="LiveOps Principle">
              <p>LiveOps should act as a bridge, not a detour. If your core game is a Match-3 puzzler about renovating a mansion, your events should provide the currency, boosters, or unique furniture needed to progress in that mansion. (AppSamurai, 2026)</p>
            </PlayTip>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, margin: '24px 0 8px', color: 'var(--text)' }}>4.5 Personalization and AI-Driven LiveOps</h4>
            <p style={{ fontSize: '.9rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '780px', marginBottom: '12px' }}>
              2025 marked the arrival of AI-driven personalization in LiveOps at scale. Studios now use machine learning to:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                'Predict which players are most likely to churn, and trigger retention events proactively',
                'Personalize offer timing and content based on individual player behavior',
                'Dynamically adjust event difficulty to keep players in the flow state',
                'Run simultaneous A/B tests across player cohorts without new app submissions',
              ].map((s) => (
                <div key={s} className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--cyan-d)' }}><div><p style={{ fontSize: '.85rem' }}>{s}</p></div></div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────── CH 5: DTC ───────────── */}
        <hr className="divider pink" />
        <section className="ch-head" id="mp-ch5" style={{ borderTop: '4px solid var(--pink)' }}>
          <div className="wrap rv ch-enter-bottom" style={{ position: 'relative' }}>
            <span className="ch-bg-num">05</span>
            <div className="ch-num" style={{ color: 'var(--pink)' }}>5.0</div>
            <h2>Direct-to-Consumer: The Emerging Revenue Frontier</h2>
            <p style={{ fontSize: '.85rem', color: 'rgba(244,141,255,.7)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>Possibly the biggest structural change since ATT</p>
            <div className="ch-desc">The rise of direct-to-consumer web stores may be the most significant structural change in mobile game monetization since ATT. After US court rulings against App Store restrictions (the Epic v. Apple ruling of April 2025), the EU&rsquo;s Digital Markets Act, Japan&rsquo;s FTC action, and similar moves worldwide, publishers now have unprecedented freedom to direct players to web storefronts that bypass the 30% platform fee.</div>
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap rv">
            <div className="stat-callout rv" style={{ borderLeftColor: 'var(--pink)', marginBottom: '24px' }}>
              <div className="big-num" style={{ color: 'var(--pink)' }}>~$41M</div>
              <div className="stat-body"><h4>Paid in App-Store Fees Every Day</h4><p>What top mobile publishers collectively hand over daily (Appcharge, 2026)</p></div>
            </div>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, margin: '0 0 12px', color: 'var(--text)' }}>5.2 DTC Adoption by the Numbers</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--pink)', margin: 0, padding: '20px', gap: '4px' }}>
                <div className="big-num" style={{ color: 'var(--pink)', fontSize: '1.8rem', minWidth: 'auto' }}>$1B+</div>
                <div className="stat-body"><h4>DTC Transactions</h4><p>Processed by Appcharge alone by early 2026</p></div>
              </div>
              <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--cyan-d)', margin: 0, padding: '20px', gap: '4px' }}>
                <div className="big-num" style={{ color: 'var(--cyan-d)', fontSize: '1.8rem', minWidth: 'auto' }} data-count="48" data-prefix="~" data-suffix="%">~0%</div>
                <div className="stat-body"><h4>Top-50 US iOS Grossing Games</h4><p>With some DTC implementation (Nov 2025, Naavik)</p></div>
              </div>
            </div>
            <div className="chart-card-new rv">
              <h4>Major Publishers Are Scaling DTC Aggressively</h4>
              <div className="chart-subtitle">DTC share of revenue, 2025 &mdash; hover each bar for the detail</div>
              <DTCAdoptionChart />
              <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  'Playtika (casual/casino): 25%+ of revenue from web stores in 2025; targeting a 40% share',
                  'Stillfront Group: DTC reached 39% of net revenue in Q2 2025',
                  'MTG: DTC revenue grew to 24% of total sales, up from 19% in 2024',
                  'Dorian: DTC revenue share grew from 10% to 40%+ in just four months after launching web stores',
                ].map((s) => (
                  <li key={s} style={{ fontSize: '.82rem', color: 'var(--text-muted)', lineHeight: 1.55, paddingLeft: '16px', position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: 'var(--pink)', fontWeight: 700 }}>&bull;</span>{s}</li>
                ))}
              </ul>
            </div>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, margin: '24px 0 8px', color: 'var(--text)' }}>5.3 How to Implement DTC for Casual &amp; Hybrid Casual Games</h4>
            <p style={{ fontSize: '.9rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '780px', marginBottom: '12px' }}>
              DTC is not reserved for mid-core or casino titles. Casual games with engaged, spending player bases are well-positioned. The key approaches:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                ['Web shop exclusive deals', 'Items and bundles not available in-app — drives web store discovery'],
                ['App-to-web payment links', 'In-game prompts directing players to the web store for savings'],
                ['Weekly web store rotations', 'Exclusive cosmetics and limited-time bundles'],
                ['Free gift claims', 'Send players to the web store with a free reward to reduce friction'],
                ['Loyalty programs & VIP tiers', 'Historically a casino mechanic, now expanding to all casual genres'],
              ].map(([t, d]) => (
                <div key={t} className="info-card" style={{ margin: 0, borderTop: '3px solid var(--pink)', flexDirection: 'column', padding: '18px 16px' }}>
                  <h4 style={{ fontSize: '.85rem' }}>{t}</h4>
                  <p style={{ fontSize: '.78rem' }}>{d}</p>
                </div>
              ))}
            </div>
            <PlayTip label="DTC Playbook Tip">
              <p>Don&rsquo;t build DTC infrastructure from scratch. A healthy ecosystem of third-party solutions (Appcharge, Neon, FastSpring) now provides branded web stores, global payment methods, and gamified checkout experiences. Some publishers have seen D2C revenue run rates more than double within months of launching. (FastSpring, 2025)</p>
            </PlayTip>
          </div>
        </section>

        {/* ───────────── CH 6: RETENTION ───────────── */}
        <hr className="divider purple" />
        <section className="ch-head ch-purple" id="mp-ch6">
          <div className="wrap rv ch-enter-left" style={{ position: 'relative' }}>
            <span className="ch-bg-num">06</span>
            <div className="ch-num" style={{ color: 'var(--purple)' }}>6.0</div>
            <h2>Retention: The Foundation of All Monetization</h2>
            <p style={{ fontSize: '.85rem', color: 'rgba(175,156,255,.8)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>No retention, no revenue</p>
            <div className="ch-desc">Every strategy in this playbook rests on one precondition: players staying in the game. A player who churns on day 3 can&rsquo;t be converted to a subscriber, can&rsquo;t be served 30 rewarded ads, and can&rsquo;t buy a seasonal battle pass.</div>
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap rv">
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, margin: '0 0 12px', color: 'var(--text)' }}>Retention Benchmarks to Target (GameAnalytics)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '20px' }}>
              <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--purple)', margin: 0, padding: '20px', gap: '4px' }}>
                <div className="big-num" style={{ color: 'var(--purple)', fontSize: '1.8rem', minWidth: 'auto' }} data-count="35" data-suffix="%+">0%+</div>
                <div className="stat-body"><h4>Day 1 (D1)</h4><p>Strong performance</p></div>
              </div>
              <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--purple)', margin: 0, padding: '20px', gap: '4px' }}>
                <div className="big-num" style={{ color: 'var(--purple)', fontSize: '1.8rem', minWidth: 'auto' }}>10&ndash;15%+</div>
                <div className="stat-body"><h4>Day 7 (D7)</h4><p>Healthy for casual games</p></div>
              </div>
              <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--purple)', margin: 0, padding: '20px', gap: '4px' }}>
                <div className="big-num" style={{ color: 'var(--purple)', fontSize: '1.8rem', minWidth: 'auto' }}>5&ndash;10%+</div>
                <div className="stat-body"><h4>Day 30 (D30)</h4><p>Benchmark for monetization maturity</p></div>
              </div>
            </div>
            <div className="stat-callout rv" style={{ borderLeftColor: 'var(--purple)', marginBottom: '24px' }}>
              <div className="big-num" style={{ color: 'var(--purple)', fontSize: '1.5rem', minWidth: 'auto' }}>&minus;7% / +4%</div>
              <div className="stat-body"><h4>The Telling Divergence</h4><p>Mobile game downloads fell 7% YoY in 2024, yet IAP revenue grew 4%. There&rsquo;s no clearer evidence that the industry has shifted its focus from acquisition volume to retention quality.</p></div>
            </div>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>6.2 Retention-Driving Game Design</h4>
            <p style={{ fontSize: '.9rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '780px', marginBottom: '12px' }}>
              These design elements have the strongest empirically-supported impact on retention in casual and hybrid casual games:
            </p>
            <div className="table-scroll">
              <table className="infographic-table">
                <thead>
                  <tr><th>Design Element</th><th>Retention Mechanism</th></tr>
                </thead>
                <tbody>
                  <tr><td>Daily Tasks &amp; Challenges</td><td>Creates habitual daily return; drives D7 retention</td></tr>
                  <tr><td>Leaderboards &amp; Rankings</td><td>Social competition creates return urgency</td></tr>
                  <tr><td>Narrative Progression</td><td>Story continuation creates curiosity loops</td></tr>
                  <tr><td>Visual Progression (building/decorating)</td><td>Tangible rewards for time investment</td></tr>
                  <tr><td>Team / Guild Features</td><td>Social accountability and belonging</td></tr>
                  <tr><td>Map / World Systems</td><td>Long-term goals; prevents completion fatigue</td></tr>
                  <tr><td>Streak Rewards</td><td>Behavioral conditioning for daily return</td></tr>
                  <tr><td>Seasonal Battle Pass</td><td>4&ndash;6 week retention horizon; clear goals</td></tr>
                </tbody>
              </table>
            </div>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, margin: '24px 0 8px', color: 'var(--text)' }}>6.3 Key Retention KPIs to Track</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', maxWidth: '820px' }}>
              {[
                ['D1, D7, D30 retention rates', 'your retention health indicators'],
                ['Session length and sessions per day', 'engagement depth'],
                ['ARPDAU (Average Revenue Per Daily Active User)', 'monetization efficiency'],
                ['Conversion rate (non-spender to spender)', 'IAP funnel health'],
                ['Ad ARPU', 'effectiveness of your ad monetization per user'],
                ['LTV (Lifetime Value) by cohort', 'overall business health'],
              ].map(([t, d]) => (
                <li key={t} style={{ fontSize: '.88rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '18px', position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: 'var(--purple)', fontWeight: 700 }}>&bull;</span><strong style={{ color: 'var(--text)' }}>{t}</strong> &mdash; {d}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───────────── CH 7: UA ───────────── */}
        <hr className="divider yellow" />
        <section className="ch-head" id="mp-ch7" style={{ borderTop: '4px solid var(--yellow)' }}>
          <div className="wrap rv ch-enter-right" style={{ position: 'relative' }}>
            <span className="ch-bg-num">07</span>
            <div className="ch-num" style={{ color: 'var(--yellow)' }}>7.0</div>
            <h2>User Acquisition in a Hybrid Monetization World</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>From volume acquisition to quality acquisition</p>
            <div className="ch-desc">ATT fundamentally rewired the economics of mobile game UA. With reduced IDFA availability and degraded targeting signals, CPI rose while conversion signals turned noisier. The industry&rsquo;s answer: shift investment from volume to quality &mdash; targeting players with higher predicted LTV rather than maximizing raw install counts.</div>
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap rv">
            <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px', marginBottom: '24px' }}>
              Hybrid casual games benefit from this environment on two fronts: they generate richer creative assets than hyper-casual titles, and their longer retention curves allow more time for retargeting, push-notification re-engagement, and upsell campaigns.
            </p>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>7.2 Rewarded Playtime Campaigns</h4>
            <p style={{ fontSize: '.9rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '780px', marginBottom: '12px' }}>
              Rewarded Playtime (also called play-to-earn) campaigns reward players with coins, points, or real-world value &mdash; gift cards, in-app currency &mdash; based on the time they spend in the game. The model is particularly effective for casual and hybrid casual titles because:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[
                'It incentivizes longer sessions, which increases ad revenue and IAP probability',
                'It improves retention metrics (D7, D30) as players return to accumulate rewards',
                'It does not require developers to create new ad creatives — assets can be taken from the Play Store listing',
                'It attracts a highly motivated player segment already inclined to engage deeply',
              ].map((s) => (
                <div key={s} className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--yellow)' }}><div><p style={{ fontSize: '.85rem' }}>{s}</p></div></div>
              ))}
            </div>
          </div>
        </section>

        {/* Ryan Chadwick quote */}
        <section className="quote-block sec-l">
          <div className="wrap"><div className="quote-inner rv">
            <div className="quote-avatar" style={{ width: 64, height: 64, background: 'var(--yellow)' }} aria-hidden="true">RC</div>
            <div>
              <p className="quote-text">Rewarded playtime is a great user acquisition source for Tripledot Studios and other ad-monetized publishers. Time-based incentives increase the number of ads watched per user, resulting in a win-win situation: more fulfilling gameplay for users and more ad revenue for publishers.</p>
              <p className="quote-attr">Ryan Chadwick, Senior Marketing Analyst at Tripledot Studios</p>
            </div>
          </div></div>
        </section>

        <section className="sec sec-w">
          <div className="wrap rv">
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>7.3 Rewarded Engagement Campaigns</h4>
            <p style={{ fontSize: '.9rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '780px', marginBottom: '12px' }}>
              Rewarded Engagement campaigns reward players for completing specific in-game tasks and milestones &mdash; reaching a level, completing a challenge, unlocking a character. The advantages:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '780px' }}>
              {[
                'Fully player-initiated, with no forced interruptions — players engage on their own terms',
                'A conversion-based structure that delivers ROAS-positive results',
                'Significantly higher ARPU, as players spend more time interacting with ad content',
                'Stronger player attachment through achievement reinforcement',
                'Higher IAP conversion — engaged players are markedly more likely to purchase',
              ].map((s) => (
                <li key={s} style={{ fontSize: '.88rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '18px', position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: 'var(--yellow)', fontWeight: 700 }}>&bull;</span>{s}</li>
              ))}
            </ul>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>7.4 Creative Strategy for Hybrid Casual UA</h4>
            <p style={{ fontSize: '.9rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '780px', marginBottom: '12px' }}>
              Hybrid casual games hold a structural advantage in creative production: their meta layers provide the narrative and visual richness that compelling ad creatives are made of.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
              {[
                ['Puzzle / challenge mechanics', '“Can you solve this?” hooks with immediate interactivity'],
                ['Narrative curiosity', '“What happens next?” story teasers'],
                ['Meta-layer showcases', 'Decorating, building, and customization in action'],
                ['Live-action & dramatic ads', 'Merge Mansion’s theatrical approach is the benchmark'],
                ['Playable ads', 'Show the core mechanic instantly — players self-select based on genuine interest'],
              ].map(([t, d]) => (
                <div key={t} className="info-card" style={{ margin: 0, borderTop: '3px solid var(--yellow)', flexDirection: 'column', padding: '18px 16px' }}>
                  <h4 style={{ fontSize: '.85rem' }}>{t}</h4>
                  <p style={{ fontSize: '.78rem' }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────── CH 8: DESIGN PRINCIPLES ───────────── */}
        <hr className="divider green" />
        <section className="ch-head ch-green" id="mp-ch8">
          <div className="wrap rv ch-enter-scale" style={{ position: 'relative' }}>
            <span className="ch-bg-num">08</span>
            <div className="ch-num" style={{ color: 'var(--green)' }}>8.0</div>
            <h2>Monetization Design Principles</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>The rules that keep revenue and player experience aligned</p>
            <div className="ch-desc">Four principles: build monetization in from day one, serve both player populations, balance experience against revenue, and localize your strategy.</div>
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap rv">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--green)' }}>
                <div className="ic-icon"><svg viewBox="0 0 24 24"><path d="M12 2v20M2 12h20" /></svg></div>
                <div>
                  <h4>8.1 Build Monetization In From Day One</h4>
                  <p>Monetization can&rsquo;t be bolted on after a game is built. The game&rsquo;s structure, difficulty curve, energy systems, meta layers, and content gates all depend on the monetization model chosen. Retroactively adding IAP to a game designed for pure ad monetization produces friction and poor conversion.</p>
                </div>
              </div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--green)' }}>
                <div className="ic-icon"><svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div>
                <div>
                  <h4>8.2 Monetize the Majority Without Alienating the Minority</h4>
                  <p style={{ marginBottom: '8px' }}>Your stack serves two fundamentally different populations at once:</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li style={{ fontSize: '.85rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '16px', position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: 'var(--green)', fontWeight: 700 }}>&bull;</span><strong style={{ color: 'var(--text)' }}>The 95% who will never pay</strong> &mdash; monetize via ads, but respect their experience; ad frequency caps and rewarded formats are essential.</li>
                    <li style={{ fontSize: '.85rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '16px', position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: 'var(--green)', fontWeight: 700 }}>&bull;</span><strong style={{ color: 'var(--text)' }}>The 5% who pay</strong> &mdash; offer an IAP experience that feels rewarding and fair; remove ads for subscribers or heavy spenders.</li>
                  </ul>
                  <p>The most effective approach is progressive disclosure: new players see only rewarded video ads and gentle IAP prompts, with more monetization options introduced as engagement deepens, based on behavioral signals.</p>
                </div>
              </div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--green)' }}>
                <div className="ic-icon"><svg viewBox="0 0 24 24"><path d="M12 3v18" /><path d="M5 8l7-5 7 5" /><path d="M3 21h18" /></svg></div>
                <div>
                  <h4>8.3 Balance Experience Against Revenue Extraction</h4>
                  <p style={{ marginBottom: '8px' }}>Aggressive monetization that damages player experience is not a long-term strategy. The key principles:</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      'Never gate mandatory progression behind hard paywalls in a casual game',
                      'Ensure IAP offers feel like genuine value, not desperation taxes',
                      'Cap ad frequency per session and per level',
                      'Reward players for engaging with ads — never punish them for not watching',
                      'Build systems where non-paying players feel respected and included',
                    ].map((s) => (
                      <li key={s} style={{ fontSize: '.85rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '16px', position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: 'var(--green)', fontWeight: 700 }}>&bull;</span>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--green)' }}>
                <div className="ic-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg></div>
                <div>
                  <h4>8.4 Localize Your Monetization</h4>
                  <p style={{ marginBottom: '8px' }}>A single global strategy doesn&rsquo;t work. The key variables by market:</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      ['IAP price points', '$2.99 in the US may be prohibitive in Southeast Asia — use regional pricing tiers'],
                      ['Ad sensitivity', 'some markets tolerate more ads than others; adjust frequency accordingly'],
                      ['Payment methods', 'local wallets, carrier billing, and alternative payment methods are critical in many markets'],
                      ['Event timing', 'seasonal events should align with local holidays and cultural moments'],
                    ].map(([t, d]) => (
                      <li key={t} style={{ fontSize: '.85rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '16px', position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: 'var(--green)', fontWeight: 700 }}>&bull;</span><strong style={{ color: 'var(--text)' }}>{t}</strong> &mdash; {d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── CH 9: METRICS ───────────── */}
        <hr className="divider cyan" />
        <section className="ch-head" id="mp-ch9" style={{ borderTop: '4px solid var(--cyan)' }}>
          <div className="wrap rv ch-enter-left" style={{ position: 'relative' }}>
            <span className="ch-bg-num">09</span>
            <div className="ch-num" style={{ color: 'var(--cyan-d)' }}>9.0</div>
            <h2>Key Metrics and Success Benchmarks</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>What to track from day one</p>
            <div className="ch-desc">Track these metrics from day one &mdash; they are the signal system for your monetization health.</div>
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap rv">
            <div className="table-scroll">
              <table className="infographic-table">
                <thead>
                  <tr><th>Metric</th><th>Definition</th><th>Benchmark (Casual / Hybrid Casual)</th></tr>
                </thead>
                <tbody>
                  <tr><td>D1 Retention</td><td>% of players returning the day after their first session</td><td className="num-pos">35%+ = strong</td></tr>
                  <tr><td>D7 Retention</td><td>% of players active 7 days after install</td><td className="num-pos">10&ndash;15%+ = healthy</td></tr>
                  <tr><td>D30 Retention</td><td>% of players active 30 days after install</td><td className="num-pos">5&ndash;10%+ = monetization-ready</td></tr>
                  <tr><td>ARPDAU</td><td>Average revenue per daily active user (ads + IAP)</td><td>Varies widely by genre; track the trend</td></tr>
                  <tr><td>IAP Conversion Rate</td><td>% of players who make at least one purchase</td><td className="num-pos">1&ndash;5% = normal range</td></tr>
                  <tr><td>LTV</td><td>Total revenue per user over their lifetime</td><td className="num-pos">Target $1+ for sustainable UA</td></tr>
                  <tr><td>ROAS</td><td>Return on ad spend from UA campaigns</td><td className="num-pos">100%+ within 30&ndash;90 days</td></tr>
                  <tr><td>Ad ARPU</td><td>Ad revenue per user over a period</td><td>Compare to UA cost to assess profitability</td></tr>
                  <tr><td>Session Length</td><td>Average time per game session</td><td>Casual: 5&ndash;10 min; hybrid casual: 10&ndash;25 min</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ───────────── CH 10: TAKEAWAYS ───────────── */}
        <hr className="divider pink" />
        <section className="ch-head" id="mp-ch10" style={{ borderTop: '4px solid var(--pink)' }}>
          <div className="wrap rv ch-enter-bottom" style={{ position: 'relative' }}>
            <span className="ch-bg-num">10</span>
            <div className="ch-num" style={{ color: 'var(--pink)' }}>10.0</div>
            <h2>Key Takeaways</h2>
            <p style={{ fontSize: '.85rem', color: 'rgba(244,141,255,.7)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>The bottom line for 2025&ndash;2026</p>
            <div className="ch-desc">The monetization landscape for casual and hybrid casual games in 2025&ndash;2026 is defined by depth, diversity, and data. Seven foundational principles:</div>
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap rv">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '860px' }}>
              {[
                ['Hybrid monetization is the standard, not the exception.', 'The most successful games combine ads, IAP, subscriptions, and battle passes. Each stream serves a different player segment. Relying on any single channel leaves significant revenue on the table.'],
                ['Hybrid casual is the highest-growth genre in mobile gaming.', 'With 37% YoY IAP revenue growth in 2024 and sustained momentum in 2025, hybrid casual outperforms every other genre category on the revenue dimensions that matter most.'],
                ['LiveOps is no longer optional.', '84% of mobile IAP revenue in 2024 came from games with active LiveOps. The shift from launch-and-forget to launch-and-operate is complete — your revenue model must include a content operations strategy.'],
                ['DTC is a genuine revenue opportunity, now.', 'Regulatory changes have opened the door. Early movers are seeing DTC account for 25–40% of total revenue. Even partial adoption dramatically improves margins by bypassing the 30% platform tax.'],
                ['Retention is the precondition for monetization.', 'Downloads are declining. IAP is growing. The signal is unmistakable: the industry has shifted to maximizing LTV from existing players. Invest in retention mechanics before, during, and after launch.'],
                ['Rewarded formats protect experience while driving revenue.', 'Rewarded video ads, rewarded playtime campaigns, and rewarded engagement campaigns consistently outperform interruptive formats on both revenue and retention metrics. Player-initiated monetization is the framework that scales.'],
                ['Build monetization into your game architecture from day one.', 'Difficulty curves, energy systems, meta layers, and content gates are all monetization design. Games that treat monetization as a post-launch feature are structurally disadvantaged from the start.'],
              ].map(([t, d], i) => (
                <div key={t} className="info-card rv" style={{ margin: 0, borderLeft: '3px solid var(--pink)' }}>
                  <div className="big-num" style={{ color: 'var(--pink)', fontSize: '1.6rem', fontFamily: 'var(--font-h)', fontWeight: 800, minWidth: '40px', flexShrink: 0 }}>{i + 1}</div>
                  <div>
                    <h4>{t}</h4>
                    <p>{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="sec sec-w" style={{ textAlign: 'center', padding: '56px 0' }}>
          <div className="wrap">
            <span className="hero-badge" style={{ background: 'var(--pink-l)', color: 'var(--pink)', border: '1px solid rgba(244,141,255,.3)', marginBottom: '16px', display: 'inline-block' }}>AppSamurai for Games</span>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>
              Ready to Put This Playbook to Work?
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto 24px', lineHeight: 1.7 }}>
              Our growth team has scaled 500+ apps with rewarded UA, LiveOps-ready acquisition, and hybrid monetization strategy. Tell us about your game, and we&rsquo;ll build the plan around it.
            </p>
            <a href="https://appsamurai.com/contact" target="_blank" rel="noopener noreferrer"
               className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', fontSize: '1rem', padding: '16px 40px' }}
               onClick={() => trackEvent('cta_click', 'mp_final_cta', { destination: 'contact' })}>
              Talk to Our Growth Team &rarr;
            </a>
          </div>
        </section>

        <RelatedEbooks currentSlug="monetization-playbook" />

      </div>{/* END gatedContent */}

      <Footer />

      <LeadBar
        message="Get the full Monetization Playbook"
        buttonText="Unlock Full Playbook"
        onCtaClick={() => { trackEvent('cta_click', 'lead_bar', { destination: 'gate' }); scrollTo('emailGate'); }}
      />
    </>
  );
}
