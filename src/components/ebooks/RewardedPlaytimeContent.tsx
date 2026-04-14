'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import TopNav from '../shared/TopNav';
import Footer from '../shared/Footer';
import SideNav from '../shared/SideNav';
import ProgressBar from '../shared/ProgressBar';
import EmailGate from '../shared/EmailGate';
import LeadBar from '../shared/LeadBar';
import FAQ from '../FAQ';
import RelatedEbooks from '../shared/RelatedEbooks';
import RevenueByModelChart from '../charts/rp/RevenueByModelChart';
import CasualMonetizationChart from '../charts/rp/CasualMonetizationChart';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useAnimatedCounters } from '@/hooks/useAnimatedCounters';
import { useSideNav } from '@/hooks/useSideNav';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useProgressBar } from '@/hooks/useProgressBar';

const ANALYTICS_SECTIONS = ['rp-hero', 'rp-toc', 'rp-ch1', 'rp-ch2', 'rp-ch3', 'rp-ch4', 'rp-ch5', 'rp-ch6', 'emailGate'];

const SIDE_NAV_SECTIONS = [
  { id: 'rp-hero', color: '#af9cff' },
  { id: 'rp-toc', color: '#af9cff' },
  { id: 'rp-ch1', color: '#af9cff' },
  { id: 'rp-ch2', color: '#af9cff' },
  { id: 'rp-ch3', color: '#26BE81' },
  { id: 'rp-ch4', color: '#f4cb00' },
  { id: 'rp-ch5', color: '#00f4f4' },
  { id: 'rp-ch6', color: '#f48dff' },
];

const SIDE_NAV_ITEMS = [
  { id: 'rp-hero', label: 'Home', defaultColor: 'var(--purple)' },
  { id: 'rp-toc', label: 'Contents' },
  { id: 'rp-ch1', label: 'Introduction' },
  { id: 'rp-ch2', label: 'Mechanics' },
  { id: 'rp-ch3', label: 'Trends' },
  { id: 'rp-ch4', label: 'Best Practices' },
  { id: 'rp-ch5', label: 'KPIs' },
  { id: 'rp-ch6', label: 'Future' },
];

const RP_FAQ = [
  { question: 'What is Rewarded Playtime?', answer: 'Rewarded Playtime is a user acquisition and engagement model where players receive real-world monetary rewards (coupons, gift cards, or cash) for their time spent playing mobile games. Unlike traditional install-focused models, it incentivizes sustained engagement and deeper funnel events.' },
  { question: 'How does Rewarded Playtime differ from rewarded video ads?', answer: 'Rewarded video ads give users a small in-game bonus for watching a short ad. Rewarded Playtime goes further by rewarding actual gameplay time and milestone achievements with real-world value, driving higher retention and LTV.' },
  { question: 'What metrics should I track for Rewarded Playtime campaigns?', answer: 'Track player engagement (DAU, session length), lifetime value (LTV), retention rates (D1, D7, D30), return on ad spend (ROAS), and event completion rates. Together, these five metrics show whether a campaign is profitable and sustainable.' },
  { question: 'Is Rewarded Playtime only for gaming apps?', answer: 'It started in gaming, but the model works wherever sustained engagement matters: fintech, e-commerce, streaming, and utility apps all run rewarded engagement campaigns today.' },
];

interface RewardedPlaytimeContentProps {
  initialUnlocked: boolean;
}

export default function RewardedPlaytimeContent({ initialUnlocked }: RewardedPlaytimeContentProps) {
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
      setTimeout(() => { document.getElementById('rp-ch3')?.scrollIntoView({ behavior: 'smooth' }); }, 500);
    }
  }, [initReveal, initCounters]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const ebookLinks = useMemo(() => [
    { href: '/growth-playbook', label: 'Mobile Growth Playbook' },
    { href: '/rewarded-playtime', label: 'Rewarded Playtime Handbook' },
    { href: '/hybrid-casual', label: 'Hybrid-Casual Games' },
    { href: '/calculator', label: 'ROI Calculator' },
  ], []);

  return (
    <>
      <ProgressBar />
      <TopNav ebookLinks={ebookLinks} />
      <SideNav sections={SIDE_NAV_ITEMS} />

      {/* HERO */}
      <div className="hero-wrap" style={{ background: 'linear-gradient(180deg, #1A1A2E 0%, #2d1b69 50%, #1A1A2E 100%)' }}>
        <section className="hero hero-dark" id="rp-hero" style={{ minHeight: '70vh' }}>
          <div className="rv" style={{ textAlign: 'center' }}>
            <span className="hero-badge" style={{ background: 'rgba(175,156,255,.15)', color: '#af9cff', border: '1px solid rgba(175,156,255,.3)' }}>AppSamurai Handbook</span>
            <h1 style={{ color: '#fff' }}>
              Rewarded <em style={{ fontStyle: 'normal', color: '#af9cff' }}>Playtime</em>
            </h1>
            <p style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1rem,2vw,1.3rem)', fontWeight: 600, marginBottom: '16px', letterSpacing: '-.01em' }}>
              Engage, Retain, Monetize in Mobile Gaming
            </p>
            <p className="hero-sub">
              How rewarded playtime works, the market data behind it, campaign strategy for casual, mid-core, and hybrid-casual games, and the KPIs that separate winners from underperformers.
            </p>
            <div className="hero-cta">
              <button className="btn-primary" onClick={() => scrollTo('rp-toc')}>
                Explore the Handbook <span>&darr;</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* KEY METRICS BENTO */}
      <section className="bento" id="rpBento">
        <div className="wrap">
          <div className="bento-grid">
            <div className="bento-card b-purple rv">
              <div className="bento-val" style={{ color: 'var(--purple)' }}>2.7x</div>
              <div className="bento-lbl">Increase in eCPM</div>
              <span className="delta pos">vs. standard ad formats</span>
            </div>
            <div className="bento-card b-green rv">
              <div className="bento-val" style={{ color: 'var(--green)' }}>5x</div>
              <div className="bento-lbl">Increase in CTR</div>
              <span className="delta pos">rewarded vs. non-rewarded</span>
            </div>
            <div className="bento-card b-cyan rv">
              <div className="bento-val" style={{ color: 'var(--cyan)' }}>1.6x</div>
              <div className="bento-lbl">Increase in ARPDAU</div>
              <span className="delta pos">for participating publishers</span>
            </div>
            <div className="bento-card b-yellow rv">
              <div className="bento-val" style={{ color: 'var(--yellow)' }} data-count="45" data-suffix="%">0%</div>
              <div className="bento-lbl">Day 1 Retention</div>
              <span className="delta pos">Source: Mistplay</span>
            </div>
          </div>
        </div>
      </section>

      {/* TOC */}
      <section className="toc" id="rp-toc">
        <div className="wrap">
          <div className="toc-label rv">What&apos;s Inside</div>
          <h2 className="rv">Rewarded Playtime Handbook</h2>
          <div className="toc-grid">
            <a href="#rp-ch1" className="toc-card rv" style={{ borderLeftColor: 'var(--purple)' }}><div className="toc-num" style={{ color: 'var(--purple)' }}>01</div><h3>The Rise of Casual &amp; Mid-core Games</h3><p>Market landscape, $159B industry, and why monetization is shifting from ads to hybrid models.</p></a>
            <a href="#rp-ch2" className="toc-card rv" style={{ borderLeftColor: 'var(--purple)' }}><div className="toc-num" style={{ color: 'var(--purple)' }}>02</div><h3>Rewarded Playtime Mechanics</h3><p>How rewarded playtime emerged, the play-to-earn model, and how it drives engagement.</p></a>
            <a href="#rp-ch3" className="toc-card rv" style={{ borderLeftColor: 'var(--green)' }}><div className="toc-num" style={{ color: 'var(--green)' }}>03</div><h3>Mobile Gaming Trends &amp; IAPs</h3><p>In-app purchase data, channel diversification, and advertiser + monetization insights.</p></a>
            <a href="#rp-ch4" className="toc-card rv" style={{ borderLeftColor: 'var(--yellow)' }}><div className="toc-num" style={{ color: 'var(--yellow)' }}>04</div><h3>Best Practices &amp; Campaign Strategy</h3><p>Designing reward experiences, campaign goals, target audiences, and competitive analysis.</p></a>
            <a href="#rp-ch5" className="toc-card rv" style={{ borderLeftColor: 'var(--cyan)' }}><div className="toc-num" style={{ color: 'var(--cyan)' }}>05</div><h3>Measuring Performance (KPIs)</h3><p>Player engagement, LTV, retention rates, ROAS, and event completion metrics.</p></a>
            <a href="#rp-ch6" className="toc-card rv" style={{ borderLeftColor: 'var(--pink)' }}><div className="toc-num" style={{ color: 'var(--pink)' }}>06</div><h3>Future Trends</h3><p>AI/ML personalization, predictive analytics, regulatory landscape, and market forecasts.</p></a>
          </div>
        </div>
      </section>

      {/* CH 1: INTRODUCTION + RISE OF CASUAL GAMES */}
      <hr className="divider purple" />
      <section className="ch-head ch-purple" id="rp-ch1">
        <div className="wrap rv ch-enter-right" style={{ position: 'relative' }}>
          <span className="ch-bg-num">01</span>
          <div className="ch-num" style={{ color: 'var(--purple)' }}>1.0</div>
          <h2>The Rise of Casual and Mid-core Games</h2>
          <p style={{ fontSize: '.85rem', color: 'rgba(175,156,255,.7)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>Understanding the Mobile Gaming Landscape</p>
          <div className="ch-desc">The global mobile gaming market hit $159 billion in 2023 and grows roughly 10% per year through 2027. Casual games now account for 38% of mobile game revenue ($28.6 billion), up 8% year over year.</div>
        </div>
      </section>

      <section className="sec sec-w">
        <div className="wrap"><div className="story rv">
          <div className="story-text rv-l">
            <span className="tag" style={{ color: 'var(--purple)', borderColor: 'var(--purple)' }}>Section 1.1</span>
            <h3>Why Casual and Mid-core Games Dominate</h3>
            <p>Casual games win on simplicity. Royal Match and Monopoly GO! pull players in with quick sessions and polished visuals. Mid-core titles like Clash Royale go deeper: strategic mechanics, competitive ladders, and session lengths that push past 15 minutes.</p>
            <div className="stat-callout" style={{ borderLeftColor: 'var(--purple)' }}>
              <div className="big-num" style={{ color: 'var(--purple)' }}>$159B</div>
              <div className="stat-body"><h4>Global Mobile Gaming Market</h4><p>Projected ~10% annual growth through 2027 (Newzoo)</p></div>
            </div>
          </div>
          <div className="story-chart rv-r">
            <h4 style={{ fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '.85rem', marginBottom: '12px', textAlign: 'center', color: 'var(--text)' }}>Revenue Share by Product Model</h4>
            <div className="chart-sub" style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--text-faint)', marginBottom: '12px' }}>2020-2023 (Source: Sensor Tower)</div>
            <div className="chart-wrap" style={{ maxHeight: '320px' }}><RevenueByModelChart /></div>
          </div>
        </div></div>
      </section>

      {/* CH 2: REWARDED PLAYTIME MECHANICS */}
      <hr className="divider purple" />
      <section className="ch-head ch-purple" id="rp-ch2">
        <div className="wrap rv ch-enter-scale" style={{ position: 'relative' }}>
          <span className="ch-bg-num">02</span>
          <div className="ch-num" style={{ color: 'var(--purple)' }}>2.0</div>
          <h2>Rewarded Playtime: How It Works</h2>
          <p style={{ fontSize: '.85rem', color: 'rgba(175,156,255,.7)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>The Play-to-Earn Model</p>
          <div className="ch-desc">Players earn real money for their time in-game: coupons, gift cards, or cash. Rewards trigger on milestones, level completions, or accumulated playtime, turning engagement into a direct value exchange.</div>
        </div>
      </section>

      <section className="sec sec-w">
        <div className="wrap rv">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--purple)', flexDirection: 'column' }}>
              <div className="ic-icon" style={{ background: 'var(--purple-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div>
              <h4>Time-Based Rewards</h4>
              <p>Players earn coins or points per minute of gameplay. More time in-game means more earned value, compounding session length.</p>
            </div>
            <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--purple)', flexDirection: 'column' }}>
              <div className="ic-icon" style={{ background: 'var(--purple-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
              <h4>Milestone Achievements</h4>
              <p>Hitting in-game milestones triggers bonus payouts, pulling players further into the game&apos;s progression systems.</p>
            </div>
            <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--purple)', flexDirection: 'column' }}>
              <div className="ic-icon" style={{ background: 'var(--purple-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><rect x="5" y="5" width="14" height="14" rx="2"/><circle cx="10" cy="14" r="2"/><circle cx="14" cy="14" r="2"/><circle cx="12" cy="10" r="2"/></svg></div>
              <h4>Real-World Redemption</h4>
              <p>Earned points convert to gift cards, cash, or coupons. Real monetary value drives word-of-mouth and sets rewarded playtime apart from ad-only models.</p>
            </div>
          </div>
        </div>
      </section>

      {/* EMAIL GATE — after Chapter 2 */}
      {!gateUnlocked && (
        <EmailGate
          title="Unlock the Full Rewarded Playtime Handbook"
          description="Continue reading for mobile gaming trends, campaign best practices, KPI measurement frameworks, and future predictions from industry leaders."
          socialProof='Join <strong>2,500+</strong> growth leaders who read our handbooks'
          ebookSlug="rewarded-playtime"
          onUnlock={unlockGatedContent}
          trackEvent={trackEvent}
        />
      )}

      {/* GATED CONTENT */}
      <div id="gatedContent" data-nosnippet className={`${gateUnlocked ? 'gated-locked unlocked' : 'gated-locked'}${gateUnlocked && !initialUnlocked ? ' gated-reveal' : ''}`}>

        {/* CH 3: MOBILE GAMING TRENDS & IAPs */}
        <hr className="divider green" />
        <section className="ch-head ch-green" id="rp-ch3">
          <div className="wrap rv ch-enter-left" style={{ position: 'relative' }}>
            <span className="ch-bg-num">03</span>
            <div className="ch-num" style={{ color: 'var(--green)' }}>3.0</div>
            <h2>Mobile Gaming Trends and Rewarded Playtime</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>The Rising Importance of In-App Purchases</p>
            <div className="ch-desc">Mobile gaming monetization has moved from ad-only revenue to hybrid models that mix advertising, IAPs, and subscriptions. Rewarded Playtime sits at that intersection.</div>
          </div>
        </section>

        {/* Mert Simsek Quote */}
        <section className="quote-block" style={{ background: 'var(--purple-l)' }}>
          <div className="wrap"><div className="quote-inner rv">
            <img className="quote-avatar" src="/images/mert-simsek.png" alt="Mert Simsek" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <p className="quote-text">IAPs have become even more important for hypercasual game publishers, offering a more reliable revenue stream. By partnering with reputable incentivized UA platforms, we can reach a wider audience and attract players more likely to make in-app purchases.</p>
              <p className="quote-attr">Mert Simsek, Co-founder &amp; CMO at APPS</p>
            </div>
          </div></div>
        </section>

        <section className="sec sec-l">
          <div className="wrap">
            <div className="chart-card-new rv">
              <h4>How Casual Games Monetize</h4>
              <div className="chart-subtitle">Revenue breakdown by monetization type (Source: Statista, 2023)</div>
              <div className="chart-wrap" style={{ height: '280px' }}><CasualMonetizationChart /></div>
            </div>
          </div>
        </section>

        {/* Advertiser Data section */}
        <section className="sec sec-w">
          <div className="wrap rv">
            <span className="insight-badge">Advertiser Data</span>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>Data Surrounding Rewarded Playtime</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--purple)' }}>
                <div className="big-num" style={{ color: 'var(--purple)', fontSize: '2rem' }}>76%</div>
                <div className="stat-body"><h4>Completed Multiple In-Game Tasks</h4><p>From AppSamurai Rewarded Playtime campaign data</p></div>
              </div>
              <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--green)' }}>
                <div className="big-num" style={{ color: 'var(--green)', fontSize: '2rem' }}>24%</div>
                <div className="stat-body"><h4>Uplift in D2 Retention</h4><p>Observed in Rewarded Playtime campaigns</p></div>
              </div>
            </div>
            <div className="info-card rv" style={{ borderLeft: '3px solid var(--yellow)' }}>
              <div className="ic-icon" style={{ background: 'var(--yellow-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg></div>
              <div><h4>Loyalty Program Impact</h4><p>79% of players not only take part in loyalty programs but also spend more in-game in exchange for extra points or monetary rewards (51%). (Source: Mistplay)</p></div>
            </div>
          </div>
        </section>

        {/* Peggy Anne Salz Quote */}
        <section className="quote-block sec-l">
          <div className="wrap"><div className="quote-inner rv">
            <img className="quote-avatar" src="/images/peggy-salz.png" alt="Peggy Anne Salz" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <p className="quote-text">Signal loss, rising CPIs, and the reality that traditional UA channels alone no longer cut it are driving a shift from high-volume user acquisition to high-value player experiences. Marketers who diversify channels and explore alternatives like rewarded ads will achieve sustainable growth.</p>
              <p className="quote-attr">Peggy Anne Salz, Mobile Analyst &amp; Content Marketing Strategist</p>
            </div>
          </div></div>
        </section>

        {/* CH 4: BEST PRACTICES */}
        <hr className="divider" style={{ borderColor: 'var(--yellow)' }} />
        <section className="ch-head" id="rp-ch4" style={{ borderTop: '4px solid var(--yellow)' }}>
          <div className="wrap rv ch-enter-right" style={{ position: 'relative' }}>
            <span className="ch-bg-num">04</span>
            <div className="ch-num" style={{ color: 'var(--yellow)' }}>4.0</div>
            <h2>Best Practices &amp; Campaign Strategy</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>Designing Rewarded Playtime Experiences</p>
            <div className="ch-desc">A Rewarded Playtime campaign that performs needs three things: clear goals, a well-defined audience, and ongoing optimization of reward types, segments, and competitive positioning.</div>
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap rv">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--yellow)', flexDirection: 'column' }}>
                <div className="ic-icon" style={{ background: 'var(--yellow-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div>
                <h4>Uninterrupted UX</h4>
                <p>Players opt in voluntarily, so rewards fit naturally into gameplay. No interruptions means longer sessions and higher satisfaction.</p>
              </div>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--yellow)', flexDirection: 'column' }}>
                <div className="ic-icon" style={{ background: 'var(--yellow-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg></div>
                <h4>Tiered Reward System</h4>
                <p>Start with small rewards for early achievements and scale up at major milestones. Each tier pulls players toward the next, building visible momentum.</p>
              </div>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--yellow)', flexDirection: 'column' }}>
                <div className="ic-icon" style={{ background: 'var(--yellow-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="var(--yellow)" stroke="none"/></svg></div>
                <h4>Reward Player Investment</h4>
                <p>Match reward value to player effort. Players who invest more time and skill earn proportionally more, with milestone-based triggers unlocking higher-tier payouts.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Faheem Quote */}
        <section className="quote-block" style={{ background: 'var(--purple-l)' }}>
          <div className="wrap"><div className="quote-inner rv">
            <img className="quote-avatar" src="/images/faheem-saiyad.png" alt="Faheem Saiyad" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <p className="quote-text">The key to an effective campaign strategy lies in understanding the user journey and delivering value at the right moments. Coupled with thoughtful audience segmentation and ongoing data-driven adjustments, a rewarded playtime campaign can drive higher session time, increase retention and LTVs, and deliver a higher overall ROAS.</p>
              <p className="quote-attr">Faheem Saiyad, Director at AppSamurai</p>
            </div>
          </div></div>
        </section>

        <section className="sec sec-l">
          <div className="wrap rv">
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>Campaign Strategy Pillars</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--yellow)' }}><div className="ic-icon" style={{ background: 'var(--yellow-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div><div><h4>Campaign Goals &amp; Objectives</h4><p>Set specific objectives guiding design and execution. Retention campaigns prioritize daily logins; IAP campaigns offer incentives for purchases during the campaign period.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--yellow)' }}><div className="ic-icon" style={{ background: 'var(--yellow-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></div><div><h4>Target Audience</h4><p>Identify demographics, playtime patterns, and spending habits. Newer players respond to smaller, frequent rewards; seasoned players prefer larger milestone-based incentives.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--yellow)' }}><div className="ic-icon" style={{ background: 'var(--yellow-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><path d="M12 2a10 10 0 1 0 10 10"/><path d="M22 5l-4 2 2 4"/><circle cx="12" cy="12" r="2"/></svg></div><div><h4>Reward Optimization</h4><p>A/B test different reward types and values. Compare digital gift cards vs. cash-back rewards, and measure which drives higher engagement and ROAS.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--yellow)' }}><div className="ic-icon" style={{ background: 'var(--yellow-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><path d="M3 3v18h18"/><path d="M7 16l4-6 4 4 5-8"/></svg></div><div><h4>Competitive Analysis</h4><p>Monitor competitor reward strategies and player responses. If a competitor has high-value rewards but complex redemption, offer similar rewards with a simpler claim process.</p></div></div>
            </div>
          </div>
        </section>

        {/* CH 5: KPIs */}
        <hr className="divider" style={{ borderColor: 'var(--cyan)' }} />
        <section className="ch-head" id="rp-ch5" style={{ borderTop: '4px solid var(--cyan)' }}>
          <div className="wrap rv ch-enter-bottom" style={{ position: 'relative' }}>
            <span className="ch-bg-num">05</span>
            <div className="ch-num" style={{ color: 'var(--cyan)' }}>5.0</div>
            <h2>Measuring and Analyzing Performance</h2>
            <p style={{ fontSize: '.85rem', color: 'rgba(0,244,244,.6)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>Key Performance Indicators (KPIs)</p>
            <div className="ch-desc">The right metrics tell you what&apos;s working and what&apos;s burning budget. Growth teams that track these KPIs can tune campaigns in near-real-time.</div>
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap rv">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
              {[
                { title: 'Player Engagement', desc: 'Session length, DAU, WAU. An increase in session length indicates players are more immersed due to rewards.', icon: '&#128101;', color: 'var(--cyan)' },
                { title: 'Lifetime Value (LTV)', desc: 'Average revenue generated per player over the entire engagement period. An LTV increase signals sustained interaction and in-app purchases.', icon: '&#128176;', color: 'var(--green)' },
                { title: 'Retention Rates', desc: 'D1, D7, D30 retention. High retention rates suggest the Rewarded Playtime model is effectively encouraging players to return.', icon: '&#128200;', color: 'var(--purple)' },
                { title: 'Return on Ad Spend', desc: 'ROAS measures profitability by comparing revenue generated to ad spend. Identify which campaigns and reward structures are most profitable.', icon: '&#128184;', color: 'var(--yellow)' },
                { title: 'Event Completion', desc: 'Track how Rewarded Playtime influences player progression through specific in-game events and milestones.', icon: '&#127942;', color: 'var(--pink)' },
              ].map((kpi) => (
                <div key={kpi.title} className="info-card" style={{ margin: 0, borderTop: `3px solid ${kpi.color}`, flexDirection: 'column' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '8px' }} dangerouslySetInnerHTML={{ __html: kpi.icon }} />
                  <h4>{kpi.title}</h4>
                  <p>{kpi.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CH 6: FUTURE TRENDS */}
        <hr className="divider" style={{ borderColor: 'var(--pink)' }} />
        <section className="ch-head" id="rp-ch6" style={{ borderTop: '4px solid var(--pink)' }}>
          <div className="wrap rv ch-enter-right" style={{ position: 'relative' }}>
            <span className="ch-bg-num">06</span>
            <div className="ch-num" style={{ color: 'var(--pink)' }}>6.0</div>
            <h2>Future Trends in Rewarded Playtime</h2>
            <p style={{ fontSize: '.85rem', color: 'rgba(244,141,255,.7)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>Emerging Technologies and Innovations</p>
            <div className="ch-desc">AI and predictive analytics are already changing how Rewarded Playtime campaigns target, personalize, and optimize in real time.</div>
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap rv">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--pink)' }}><div className="ic-icon" style={{ background: 'var(--pink-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--pink)' }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div><div><h4>AI-Personalized Ads</h4><p>Predictive models will analyze player data to forecast preferences and behavior, placing ads where they convert, not just where they&apos;re visible.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--pink)' }}><div className="ic-icon" style={{ background: 'var(--pink-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--pink)' }}><path d="M3 3v18h18"/><path d="M7 16l4-6 4 4 5-8"/></svg></div><div><h4>Predictive Analytics</h4><p>AI can spot disengagement signals before they surface, flagging at-risk players and adjusting rewards to pull them back before they churn.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--pink)' }}><div className="ic-icon" style={{ background: 'var(--pink-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--pink)' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div><h4>Regulatory Landscape</h4><p>Data privacy regulations keep tightening. Rewarded Playtime&apos;s opt-in model has a built-in edge: players voluntarily participate, putting it on solid ground under GDPR and ATT.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--pink)' }}><div className="ic-icon" style={{ background: 'var(--pink-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--pink)' }}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="var(--pink)" stroke="none"/></svg></div><div><h4>Higher Reward Values</h4><p>As competition heats up, reward values will climb. Publishers who offer more tangible value per session will win the attention war.</p></div></div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FAQ items={RP_FAQ} chapterColor="var(--purple)" />

        {/* FINAL CTA */}
        <section className="sec sec-w" style={{ textAlign: 'center', padding: '56px 0' }}>
          <div className="wrap">
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>
              Ready to Launch a Rewarded Playtime Campaign?
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto 24px', lineHeight: 1.7 }}>
              Our growth team has scaled 500+ apps with rewarded UA. Tell us your game, and we&apos;ll design a campaign strategy around it.
            </p>
            <a href="https://appsamurai.com/contact" target="_blank" rel="noopener noreferrer"
               className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', fontSize: '1rem', padding: '16px 40px' }}
               onClick={() => trackEvent('cta_click', 'rp_final_cta', { destination: 'contact' })}>
              Talk to Our Growth Team &rarr;
            </a>
          </div>
        </section>

        <RelatedEbooks currentSlug="rewarded-playtime" />

      </div>{/* END gatedContent */}

      <Footer />

      <LeadBar
        message="Get the full Rewarded Playtime Handbook"
        buttonText="Unlock Full Handbook"
        onCtaClick={() => { trackEvent('cta_click', 'lead_bar', { destination: 'gate' }); scrollTo('emailGate'); }}
      />
    </>
  );
}
