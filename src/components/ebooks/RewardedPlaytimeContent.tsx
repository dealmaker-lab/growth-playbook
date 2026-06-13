'use client';

import { useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import TopNav from '../shared/TopNav';
import Footer from '../shared/Footer';
import SideNav from '../shared/SideNav';
import ProgressBar from '../shared/ProgressBar';
import EmailGate from '../shared/EmailGate';
import LeadBar from '../shared/LeadBar';
import FAQ from '../FAQ';
import RelatedEbooks from '../shared/RelatedEbooks';
import USAnnualTrendsChart from '../charts/rp/USAnnualTrendsChart';
import JapanRevenueShareChart from '../charts/rp/JapanRevenueShareChart';
import BrazilAdVsIapChart from '../charts/rp/BrazilAdVsIapChart';
import KoreaRevenueByGenreChart from '../charts/rp/KoreaRevenueByGenreChart';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useAnimatedCounters } from '@/hooks/useAnimatedCounters';
import { useSideNav } from '@/hooks/useSideNav';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useProgressBar } from '@/hooks/useProgressBar';

const ANALYTICS_SECTIONS = ['rp-hero', 'rp-toc', 'rp-ch1', 'rp-ch2', 'rp-ch3', 'rp-ch4', 'rp-ch5', 'rp-ch6', 'rp-ch7', 'emailGate'];

const SIDE_NAV_SECTIONS = [
  { id: 'rp-hero', color: '#af9cff' },
  { id: 'rp-toc', color: '#af9cff' },
  { id: 'rp-ch1', color: '#af9cff' },
  { id: 'rp-ch2', color: '#2EC97E' },
  { id: 'rp-ch3', color: '#f4cb00' },
  { id: 'rp-ch4', color: '#00c4c4' },
  { id: 'rp-ch5', color: '#af9cff' },
  { id: 'rp-ch6', color: '#f4cb00' },
  { id: 'rp-ch7', color: '#2EC97E' },
];

const SIDE_NAV_ITEMS = [
  { id: 'rp-hero', label: 'Home', defaultColor: 'var(--purple)' },
  { id: 'rp-toc', label: 'Contents' },
  { id: 'rp-ch1', label: 'Introduction' },
  { id: 'rp-ch2', label: 'How It Works' },
  { id: 'rp-ch3', label: 'Genre Landscape' },
  { id: 'rp-ch4', label: 'Regional Landscape' },
  { id: 'rp-ch5', label: 'Trends & IAPs' },
  { id: 'rp-ch6', label: 'Best Practices' },
  { id: 'rp-ch7', label: 'KPIs' },
];

const RP_FAQ = [
  { question: 'What is Rewarded Playtime?', answer: 'Rewarded Playtime is a user acquisition and engagement model where players earn real-world value (gift cards, coupons, or cash) for the time they spend playing, alongside premium in-game incentives. Instead of paying for installs, advertisers pay for sustained engagement and deep-funnel milestones, which produces higher retention and LTV.' },
  { question: 'What is the difference between outbound UA and an inbound offerwall?', answer: 'Outbound UA means listing your game on a rewarded platform or offerwall to buy high-intent traffic. You pay only when acquired players cross milestones like finishing a tutorial or hitting Level 70. Inbound integration means hosting the offerwall inside your own game, so your existing players earn your premium currency by trying partner apps. One acquires users; the other monetizes the ones you already have.' },
  { question: 'How does Rewarded Playtime differ from rewarded video ads?', answer: 'A rewarded video gives a small in-game bonus for watching a short ad. Rewarded Playtime rewards actual gameplay time and milestone achievements with real-world value, which pulls players deeper into a game rather than briefly interrupting it.' },
  { question: 'What metrics should I track for Rewarded Playtime campaigns?', answer: 'Track player engagement (session length, DAU, WAU), lifetime value (LTV), retention (D1, D7, D30), return on ad spend (ROAS), and event completion rates. Together they show whether a campaign is profitable and sustainable.' },
  { question: 'Is Rewarded Playtime only for gaming apps?', answer: 'It started in gaming, but the value-exchange model works wherever sustained engagement matters: fintech, e-commerce, streaming, and utility apps all run rewarded engagement campaigns today.' },
];

interface RewardedPlaytimeContentProps {
  initialUnlocked: boolean;
}

// Recurring branded insight callout used in every region of the landscape section.
function RpPlay({ children }: { children: ReactNode }) {
  return (
    <div className="rp-play rv">
      <div className="rp-play-label">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M10 8.5l5 3.5-5 3.5z" fill="currentColor" stroke="none" />
        </svg>
        The Rewarded Playtime Play
      </div>
      {children}
    </div>
  );
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
      setTimeout(() => { document.getElementById('rp-ch5')?.scrollIntoView({ behavior: 'smooth' }); }, 500);
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
              How rewarded playtime works, the regional data behind it, genre-by-genre campaign strategy, and the KPIs that separate winners from underperformers. Built for growth teams scaling casual, hybrid-casual, and mid-core games.
            </p>
            <div className="hero-cta">
              <button className="btn-primary" onClick={() => scrollTo('rp-toc')}>
                Explore the Handbook <span>&darr;</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* KEY METRICS BENTO — market-scale stats */}
      <section className="bento" id="rpBento">
        <div className="wrap">
          <div className="bento-grid">
            <div className="bento-card b-green rv">
              <div className="bento-val" style={{ color: 'var(--green)' }} data-count="82" data-prefix="$" data-suffix="B">$0B</div>
              <div className="bento-lbl">Global Mobile Game IAP Revenue, 2025</div>
              <span className="delta pos">+1.4% YoY &middot; Sensor Tower</span>
            </div>
            <div className="bento-card b-purple rv">
              <div className="bento-val" style={{ color: 'var(--purple)' }} data-count="50" data-suffix="B">0B</div>
              <div className="bento-lbl">Global Mobile Game Downloads, 2025</div>
              <span className="delta neg">&minus;7.0% YoY &middot; Sensor Tower</span>
            </div>
            <div className="bento-card b-cyan rv">
              <div className="bento-val" style={{ color: 'var(--cyan-d)' }} data-count="72" data-suffix="%">0%</div>
              <div className="bento-lbl">Cite Real-World Rewards as an Install Driver</div>
              <span className="delta pos">Almedia Rewarded Returns</span>
            </div>
            <div className="bento-card b-yellow rv">
              <div className="bento-val" style={{ color: 'var(--yellow)' }} data-count="5" data-suffix="x">0x</div>
              <div className="bento-lbl">More Likely to Convert to IAP Spender</div>
              <span className="delta pos">After 10 hrs of week-one playtime</span>
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
            <a href="#rp-ch1" className="toc-card rv" style={{ borderLeftColor: 'var(--purple)' }}><div className="toc-num" style={{ color: 'var(--purple)' }}>01</div><h3>Introduction</h3><p>How rewarded playtime matured into a foundational pillar of mobile UA and retention.</p></a>
            <a href="#rp-ch2" className="toc-card rv" style={{ borderLeftColor: 'var(--green)' }}><div className="toc-num" style={{ color: 'var(--green)' }}>02</div><h3>How It Works</h3><p>The dual-value loop, the three reward pillars, and the player / advertiser / publisher angles.</p></a>
            <a href="#rp-ch3" className="toc-card rv" style={{ borderLeftColor: 'var(--yellow)' }}><div className="toc-num" style={{ color: 'var(--yellow)' }}>03</div><h3>Genre-Specific Landscape</h3><p>How casual, hybrid-casual, and mid-core games monetize, and where rewarded playtime fits each.</p></a>
            <a href="#rp-ch4" className="toc-card rv" style={{ borderLeftColor: 'var(--cyan-d)' }}><div className="toc-num" style={{ color: 'var(--cyan-d)' }}>04</div><h3>Regional Landscape</h3><p>Monetization and reward behavior across the US, South Korea, Japan, Brazil, and Europe.</p></a>
            <a href="#rp-ch5" className="toc-card rv" style={{ borderLeftColor: 'var(--purple)' }}><div className="toc-num" style={{ color: 'var(--purple)' }}>05</div><h3>Trends &amp; IAPs</h3><p>The shift to player value, channel diversification, and the data behind rewarded playtime.</p></a>
            <a href="#rp-ch6" className="toc-card rv" style={{ borderLeftColor: 'var(--yellow)' }}><div className="toc-num" style={{ color: 'var(--yellow)' }}>06</div><h3>Best Practices &amp; Campaign Strategy</h3><p>Designing reward experiences, setting goals, segmenting audiences, and optimizing rewards.</p></a>
            <a href="#rp-ch7" className="toc-card rv" style={{ borderLeftColor: 'var(--green)' }}><div className="toc-num" style={{ color: 'var(--green)' }}>07</div><h3>Measuring Performance</h3><p>The five KPIs that tell you whether a rewarded playtime campaign is actually working.</p></a>
          </div>
        </div>
      </section>

      {/* ───────────────────────── CH 1: INTRODUCTION ───────────────────────── */}
      <hr className="divider purple" />
      <section className="ch-head ch-purple" id="rp-ch1">
        <div className="wrap rv ch-enter-right ch-head-art" style={{ position: 'relative' }}>
          <span className="ch-bg-num">01</span>
          <div className="ch-head-copy">
            <div className="ch-num" style={{ color: 'var(--purple)' }}>1.0</div>
            <h2>The Mobile Gaming Landscape &amp; Rewarded Playtime</h2>
            <p style={{ fontSize: '.85rem', color: 'rgba(175,156,255,.8)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>From experimental tactic to foundational cornerstone</p>
            <div className="ch-desc">Once treated as an experimental tactic, rewarded playtime has matured into a proven cornerstone of mobile user acquisition and retention. It runs on a simple psychological lever (positive reinforcement) that keeps players engaged in order to earn more.</div>
          </div>
          <img className="ch-head-img" src="/images/rp/ch1.webp" alt="Rewarded playtime in a merge-style mobile game with floating coin rewards" loading="lazy" width="880" height="880" />
        </div>
      </section>

      <section className="sec sec-w">
        <div className="wrap rv">
          <p style={{ fontSize: '.95rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '760px', marginBottom: '24px' }}>
            Far from a passing novelty, the model has built a long-term track record of driving sustainable growth. Four findings make the case:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px' }}>
            <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--purple)', flexDirection: 'column' }}>
              <div className="big-num" style={{ color: 'var(--purple)', fontSize: '2rem', fontFamily: 'var(--font-h)', fontWeight: 800 }}>72%</div>
              <h4>Powerful First Impressions</h4>
              <p>In Almedia&rsquo;s <em>Rewarded Returns</em> global study, 72% of players say real-world rewards are a critical factor in their decision to install and try a new game.</p>
            </div>
            <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--purple)', flexDirection: 'column' }}>
              <div className="big-num" style={{ color: 'var(--purple)', fontSize: '2rem', fontFamily: 'var(--font-h)', fontWeight: 800 }}>71% &middot; 85%</div>
              <h4>Extended Player Longevity</h4>
              <p>The same study finds 71% of players lengthen their sessions because of incentives, and 85% keep playing a title regularly even after a specific reward campaign has ended.</p>
            </div>
            <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--purple)', flexDirection: 'column' }}>
              <div className="big-num" style={{ color: 'var(--purple)', fontSize: '2rem', fontFamily: 'var(--font-h)', fontWeight: 800 }}>76%</div>
              <h4>Organic Amplification</h4>
              <p>Rewarded systems turn players into advocates: over 76% are highly likely to recommend a rewarded game to their communities, fuelling cost-effective word-of-mouth in a saturated market.</p>
            </div>
            <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--purple)', flexDirection: 'column' }}>
              <div className="big-num" style={{ color: 'var(--purple)', fontSize: '2rem', fontFamily: 'var(--font-h)', fontWeight: 800 }}>49% &middot; 42%</div>
              <h4>Long-Term Connections</h4>
              <p>The <em>Mistplay Mobile Gaming Loyalty Index</em> aligns with this: nearly half of mobile gamers (49%) stay loyal to a favorite title for more than a year, and 42% of those refer three or more friends across their lifecycle.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec sec-l">
        <div className="wrap rv">
          <span className="insight-badge">Overhauling the Value Exchange</span>
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>One model, two sides of the market</h3>
          <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '760px', marginBottom: '20px' }}>
            By paying players in coupons, gift cards, or cash for the time and effort they invest, rewarded playtime creates a profitable ecosystem for both sides of mobile publishing.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--purple)' }}>
              <div className="ic-icon" style={{ background: 'var(--purple-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg></div>
              <div>
                <h4>For Publishers &amp; Developers</h4>
                <p>A high-intent acquisition channel. As AppsFlyer reports hybrid monetization adoption climbing from 36% to 43%, this format turns added engagement directly into deep-funnel events, deeper level progression, and statistically stronger in-app purchases.</p>
              </div>
            </div>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--green)' }}>
              <div className="ic-icon"><svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
              <div>
                <h4>For Monetization-Focused Platforms</h4>
                <p>A niche, entirely non-intrusive ad format that maximizes ad equity. By trading tangible, predictable value for player time instead of interrupting with jarring interstitials, platforms lift sustained ad revenue and retention at the same time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── CH 2: HOW IT WORKS ───────────────────────── */}
      <hr className="divider green" />
      <section className="ch-head ch-green" id="rp-ch2">
        <div className="wrap rv ch-enter-scale ch-head-art" style={{ position: 'relative' }}>
          <span className="ch-bg-num">02</span>
          <div className="ch-head-copy">
            <div className="ch-num" style={{ color: 'var(--green)' }}>2.0</div>
            <h2>Rewarded Playtime: How It Works</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>The dual-value loop</p>
            <div className="ch-desc">Rewarded playtime runs on a transparent value exchange: players receive a dual-value loop of real-world monetary rewards <em>and</em> premium in-game incentives, both scaled to the time and engagement they choose to give a game.</div>
          </div>
          <img className="ch-head-img" src="/images/rp/ch2.webp" alt="The AppsPrize rewarded playtime offerwall showing daily quests and cashback rewards" loading="lazy" width="880" height="880" />
        </div>
      </section>

      <section className="sec sec-w">
        <div className="wrap rv">
          <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '760px', marginBottom: '24px' }}>
            Modern platforms have retired physical incentives like paper coupons and checks in favor of instant digital payouts driven by SDK or API integrations. Rewards are tracked seamlessly and distributed across three pillars of player progression:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--green)', flexDirection: 'column' }}>
              <div className="ic-icon" style={{ marginBottom: '8px' }}><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg></div>
              <h4>Time-Based Accumulation</h4>
              <p>Players earn platform currency or reward points tied directly to the playtime they log inside an app: the longer they play, the more they bank.</p>
            </div>
            <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--green)', flexDirection: 'column' }}>
              <div className="ic-icon" style={{ marginBottom: '8px' }}><svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg></div>
              <h4>Granular Milestone Achievements</h4>
              <p>Hitting specific milestones or completing designated levels unlocks premium tiers: digital gift cards, cash-back perks, or exclusive in-game assets.</p>
            </div>
            <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--green)', flexDirection: 'column' }}>
              <div className="ic-icon" style={{ marginBottom: '8px' }}><svg viewBox="0 0 24 24"><path d="M3 3v18h18" /><path d="M7 16l4-6 4 4 5-8" /></svg></div>
              <h4>Deep-Funnel Actions</h4>
              <p>High-value payouts trigger when players reach significant achievements or show consistent engagement over a longer period: the signals that correlate with real LTV.</p>
            </div>
          </div>
          <div className="stat-callout rv" style={{ marginTop: '20px', borderLeftColor: 'var(--green)' }}>
            <div className="big-num" style={{ color: 'var(--green)', fontSize: '1.5rem', minWidth: 'auto' }}>&#9733;</div>
            <div className="stat-body"><h4>The cornerstone of every campaign</h4><p>Rewards have to be <em>perceived</em> as valuable. That perception is what motivates players to keep engaging across different games.</p></div>
          </div>
        </div>
      </section>

      {/* The Three Angles */}
      <section className="sec sec-l">
        <div className="wrap rv">
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)', textAlign: 'center' }}>The Three Angles of the Ecosystem</h3>
          <p style={{ fontSize: '.9rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '680px', margin: '0 auto 24px', textAlign: 'center' }}>
            To grasp the scale of the model, view it through its three core participants: the player, the advertiser, and the publisher.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--green)', flexDirection: 'column', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--green)' }}>01</div>
              <h4>The Player</h4>
              <p>Value for engagement</p>
            </div>
            <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--purple)', flexDirection: 'column', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--purple)' }}>02</div>
              <h4>The Advertiser</h4>
              <p>High-intent user acquisition</p>
            </div>
            <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--cyan-d)', flexDirection: 'column', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--cyan-d)' }}>03</div>
              <h4>The Publisher</h4>
              <p>Retention &amp; sustainable monetization</p>
            </div>
          </div>
        </div>
      </section>

      {/* Angle 1: Player */}
      <section className="sec sec-w">
        <div className="wrap rv">
          <span className="tag" style={{ color: 'var(--green)', borderColor: 'var(--green)', display: 'inline-block', fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-h)', padding: '4px 12px', borderRadius: '100px', letterSpacing: '.8px', textTransform: 'uppercase', marginBottom: '10px', border: '1px solid' }}>1 &middot; The Player</span>
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text)' }}>Value for Engagement</h3>
          <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '760px' }}>
            For the user, the value proposition is frictionless. Players opt in voluntarily and pick titles they genuinely want to play. They earn real-world payouts (gift cards or digital cash) and crucial in-game rewards like premium currency, rare items, or progression boosters. That dual structure satisfies two distinct needs at once: immediate gratification inside the game, and tangible financial value outside it.
          </p>
        </div>
      </section>

      {/* Angle 2: Advertiser — two alternatives */}
      <section className="sec sec-l">
        <div className="wrap rv">
          <span className="tag" style={{ color: 'var(--purple)', borderColor: 'var(--purple)', display: 'inline-block', fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-h)', padding: '4px 12px', borderRadius: '100px', letterSpacing: '.8px', textTransform: 'uppercase', marginBottom: '10px', border: '1px solid' }}>2 &middot; The Advertiser</span>
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>High-Intent User Acquisition</h3>
          <p style={{ fontSize: '.9rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '760px', marginBottom: '20px' }}>
            Developers have two strategic alternatives, depending on whether the goal is to aggressively scale acquisition or to maximize their game&rsquo;s internal economy.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="chart-card-new rv" style={{ margin: 0, borderTop: '3px solid var(--purple)' }}>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '.7rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--purple)', marginBottom: '6px' }}>Alternative 1</div>
              <h4 style={{ marginBottom: '10px' }}>Outbound User Acquisition</h4>
              <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '12px' }}><strong style={{ color: 'var(--text)' }}>Placing your game on publisher sites.</strong> You act as the advertiser buying high-value traffic, listing your title inside a rewarded platform, offerwall, or publisher app to attract fresh players.</p>
              <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '8px' }}><strong style={{ color: 'var(--text)' }}>How it operates:</strong> users browsing a partner app see your game listed alongside specific rewards, then download and engage to earn them.</p>
              <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', lineHeight: 1.65 }}><strong style={{ color: 'var(--text)' }}>Strategic value:</strong> because payouts are tied to milestone completion, you pay only for users who cross key depth thresholds (finishing a tutorial, reaching Level 70) for a reliable, optimized ROAS.</p>
            </div>
            <div className="chart-card-new rv" style={{ margin: 0, borderTop: '3px solid var(--green)' }}>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '.7rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '6px' }}>Alternative 2</div>
              <h4 style={{ marginBottom: '10px' }}>Inbound Economy Optimization</h4>
              <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '12px' }}><strong style={{ color: 'var(--text)' }}>Integrating the offerwall into your own game.</strong> You act as the host, using rewarded architecture as a premium monetization and retention system inside your own ecosystem.</p>
              <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '8px' }}><strong style={{ color: 'var(--text)' }}>How it operates:</strong> you embed a rewarded playtime offerwall in your UI; active players open the panel, browse partner apps or tasks, and opt to try them.</p>
              <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', lineHeight: 1.65 }}><strong style={{ color: 'var(--text)' }}>Strategic value:</strong> instead of disruptive video ads or a hard paywall, players earn your premium currency for free by spending time elsewhere, lifting goodwill, bridging non-payers to premium content, and adding a diversified ad-revenue stream without hurting retention.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Angle 3: Publisher */}
      <section className="sec sec-w">
        <div className="wrap rv">
          <span className="tag" style={{ color: 'var(--cyan-d)', borderColor: 'var(--cyan-d)', display: 'inline-block', fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-h)', padding: '4px 12px', borderRadius: '100px', letterSpacing: '.8px', textTransform: 'uppercase', marginBottom: '10px', border: '1px solid' }}>3 &middot; The Publisher</span>
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>Retention &amp; Sustainable Monetization</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--cyan-d)' }}>
              <div className="ic-icon" style={{ background: 'var(--cyan-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--cyan-d)' }}><path d="M12 2a10 10 0 1 0 10 10" /><path d="M22 5l-4 2 2 4" /><circle cx="12" cy="12" r="2" /></svg></div>
              <div><h4>Monetizing the Non-Spender</h4><p>Most mobile players never make a direct cash purchase. The rewarded framework lets these users earn premium in-game content by cleanly directing their time toward tasks in partner apps.</p></div>
            </div>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--cyan-d)' }}>
              <div className="ic-icon" style={{ background: 'var(--cyan-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--cyan-d)' }}><path d="M3 3v18h18" /><path d="M7 16l4-6 4 4 5-8" /></svg></div>
              <div><h4>Elevated Lifetime Value</h4><p>Giving players a reliable alternative to opening their wallets (while keeping the game ad-undisrupted) raises satisfaction, lengthens sessions, and adds a dependable, diversified ad-revenue stream.</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── CH 3: GENRE LANDSCAPE ───────────────────────── */}
      <hr className="divider yellow" />
      <section className="ch-head" id="rp-ch3" style={{ borderTop: '4px solid var(--yellow)' }}>
        <div className="wrap rv ch-enter-left ch-head-art" style={{ position: 'relative' }}>
          <span className="ch-bg-num">03</span>
          <div className="ch-head-copy">
            <div className="ch-num" style={{ color: 'var(--yellow)' }}>3.0</div>
            <h2>Genre-Specific Landscape &amp; Monetization Dynamics</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>Where rewarded playtime fits each genre</p>
            <div className="ch-desc">The market has moved well past one-size-fits-all monetization. Today&rsquo;s games run complex, genre-specific hybrid models, and knowing how each genre earns is essential to deploying rewarded playtime as an acquisition and retention tool.</div>
          </div>
          <img className="ch-head-img" src="/images/rp/ch3.webp" alt="Popular casual, hybrid-casual, and mid-core mobile game icons" loading="lazy" width="880" height="880" />
        </div>
      </section>

      <section className="sec sec-w">
        <div className="wrap rv">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--green)', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '1rem' }}>1. Casual Games</h4>
              <p style={{ fontSize: '.78rem', color: 'var(--green)', fontWeight: 600, marginBottom: '8px' }}>Royal Match &middot; Monopoly GO! &middot; Candy Crush Saga</p>
              <p style={{ marginBottom: '8px' }}><strong style={{ color: 'var(--text)' }}>Monetization:</strong> driven mainly by IAPs (extra lives, boosters, event tokens), supplemented by calculated in-app advertising.</p>
              <p><strong style={{ color: 'var(--text)' }}>The fit:</strong> casual players are motivated by progression, so milestone rewards keep them engaged through natural plateaus and nudge them toward becoming paid spenders.</p>
            </div>
            <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--yellow)', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '1rem' }}>2. Hybrid-Casual Games</h4>
              <p style={{ fontSize: '.78rem', color: '#b58a00', fontWeight: 600, marginBottom: '8px' }}>Survivor.io &middot; Stumble Guys &middot; Block Blast!</p>
              <p style={{ marginBottom: '8px' }}><strong style={{ color: 'var(--text)' }}>Monetization:</strong> a balanced 50/50 split of IAA and IAPs, leaning on rewarded video, battle passes, and micro-subscriptions.</p>
              <p><strong style={{ color: 'var(--text)' }}>The fit:</strong> these titles depend on engagement milestones to trigger ad revenue and pass sales, making rewarded playtime an ideal funnel for high-retention, value-exchange-savvy users.</p>
            </div>
            <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--purple)', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '1rem' }}>3. Mid-Core &amp; Hardcore Games</h4>
              <p style={{ fontSize: '.78rem', color: 'var(--purple-d)', fontWeight: 600, marginBottom: '8px' }}>Clash of Clans &middot; Genshin Impact &middot; PUBG Mobile</p>
              <p style={{ marginBottom: '8px' }}><strong style={{ color: 'var(--text)' }}>Monetization:</strong> overwhelmingly high-value IAPs (gacha mechanics, character and item customization, cosmetic skins, and seasonal battle passes).</p>
              <p><strong style={{ color: 'var(--text)' }}>The fit:</strong> these games suffer steep early churn. Incentivizing players past the initial learning curve (reaching Level 10, finishing a tutorial) sharply scales their organic LTV and propensity to purchase.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec sec-l">
        <div className="wrap rv">
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>Market Revenue Breakdown by Genre Group</h3>
          <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Global consumer-spend distribution reflects a mature market where casual and hybrid mechanics claim the lion&rsquo;s share of engagement. Source: Sensor Tower &amp; Statista.</p>
          <div className="table-scroll">
            <table className="infographic-table">
              <thead>
                <tr>
                  <th>Product Model / Genre Group</th>
                  <th>Core Monetization Focus</th>
                  <th>Revenue Share Trend</th>
                  <th>Core Player Motivation</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Mid- &amp; Hardcore</td><td>Deep IAP, gacha, cosmetics</td><td>Stable / high spender concentration</td><td>Strategy, competition, status</td></tr>
                <tr><td>Casual</td><td>Core IAP (boosters, lives), light IAA</td><td>Steady annual growth</td><td>Relaxation, quick progression</td></tr>
                <tr><td>Hybrid-Casual</td><td>Hybrid (balanced IAA + meta IAP)</td><td>High growth / scaling ad equity</td><td>Milestone achievement, upgrades</td></tr>
                <tr><td>Hyper-Casual</td><td>Pure IAA (interstitials, banners)</td><td>Declining share (ad fatigue)</td><td>Immediate entertainment</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="sec sec-w">
        <div className="wrap rv">
          <div className="stat-callout" style={{ borderLeftColor: 'var(--yellow)' }}>
            <div className="big-num" style={{ color: 'var(--yellow)', fontSize: '1.4rem', minWidth: 'auto' }}>&rarr;</div>
            <div className="stat-body">
              <h4>The Shift from Ad-Volume to Player-Value</h4>
              <p>As ad-signal loss and rising CPIs reshape the industry, developers have moved away from chasing raw install volume. Success now belongs to studios that diversify channels and build loyal user bases. Rewarded playtime is the bridge across every genre, delivering high-intent players who explore deep gameplay loops and maximize both ad equity and long-term IAP profitability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── CH 4: REGIONAL LANDSCAPE ───────────────────────── */}
      <hr className="divider cyan" />
      <section className="ch-head" id="rp-ch4" style={{ borderTop: '4px solid var(--cyan)' }}>
        <div className="wrap rv ch-enter-bottom ch-head-art" style={{ position: 'relative' }}>
          <span className="ch-bg-num">04</span>
          <div className="ch-head-copy">
            <div className="ch-num" style={{ color: 'var(--cyan-d)' }}>4.0</div>
            <h2>Regional Landscape: Global Monetization &amp; Reward Behaviors</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>Five markets, five very different playbooks</p>
            <div className="ch-desc">Global downloads slipped 7% year over year to 50 billion in 2025, even as total in-app purchase revenue held steady at $82 billion. With volume softening, publishers are designing region-specific loops to capture higher LTV, and user-initiated formats like rewarded playtime and paid access to accumulated rewards have become a foundational way to offset rising ROAS friction.</div>
          </div>
          <img className="ch-head-img" src="/images/rp/ch4.webp" alt="Global mobile game monetization and reward behavior across regions" loading="lazy" width="880" height="880" />
        </div>
      </section>

      {/* Market stat cards */}
      <section className="sec sec-w">
        <div className="wrap">
          <div className="bento-grid rv" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="bento-card b-green">
              <div className="bento-val" style={{ color: 'var(--green)' }}>$82B</div>
              <div className="bento-lbl">Mobile Game IAP Revenue, 2025</div>
              <span className="delta pos">+1.4% YoY &middot; $1.62 IAP revenue per download</span>
            </div>
            <div className="bento-card b-purple">
              <div className="bento-val" style={{ color: 'var(--purple)' }}>50B</div>
              <div className="bento-lbl">Mobile Game Downloads, 2025</div>
              <span className="delta neg">&minus;7.0% YoY &middot; 95,000 games downloaded per minute</span>
            </div>
          </div>
          <p style={{ fontSize: '.78rem', color: 'var(--text-faint)', marginTop: '10px', textAlign: 'center' }}>iOS &amp; Google Play; excludes third-party Android in China and other markets. Source: Sensor Tower.</p>
        </div>
      </section>

      {/* US */}
      <section className="sec sec-l">
        <div className="wrap rv">
          <h3 className="region-head"><span className="region-flag">🇺🇸</span> United States &amp; North America</h3>
          <p className="region-sub">High-value saturation &amp; content fatigue</p>
          <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px', marginBottom: '20px' }}>
            The US is a mature, fiercely competitive ad ecosystem where legacy formats face distinct monetization hurdles.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--cyan-d)' }}><div><h4>The Revenue vs. Ad-Spend Mismatch</h4><p>Ad spend is crowded into Casual (Lifestyle &amp; Puzzle) at a 56.2% share, yet that category generates only 41.3% of IAP revenue. Action &amp; Strategy capture 34.8% of IAP revenue on a lighter 30.7% ad-spend share.</p></div></div>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--cyan-d)' }}><div><h4>Genre Shifting</h4><p>In 2025, Strategy led North American growth, scaling IAP revenue by $1.12 billion, with a $604 million lift in Puzzle. Older mechanics contracted hard: Casino revenue fell $860 million.</p></div></div>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--cyan-d)' }}><div><h4>Age &amp; Gender Profiles</h4><p>The casual and hyper-casual base skews older. Nearly 60% of players are 35+. Gender splits sharply: Lifestyle (77% female), Puzzle (63%), and Tabletop (62%) against Shooters (72% male) and Strategy (73% male).</p></div></div>
          </div>
          <div className="chart-card-new rv">
            <h4>Annual Trends for Mobile Games by Product Model: United States</h4>
            <div className="chart-subtitle">IAP revenue and downloads, 2024 vs 2025 (Source: Sensor Tower)</div>
            <USAnnualTrendsChart />
          </div>
          <RpPlay>
            <p>Because US casual ad delivery has consolidated into high-attention video (53.7%) and playable (13.3%) formats, creative fatigue sets in fast. An outbound rewarded playtime model captures the high-intent, mature female audience (35+) looking for clear progression hooks, without forcing intrusive interstitials on them.</p>
          </RpPlay>
        </div>
      </section>

      {/* South Korea */}
      <section className="sec sec-w">
        <div className="wrap rv">
          <h3 className="region-head"><span className="region-flag">🇰🇷</span> South Korea</h3>
          <p className="region-sub">Deep player stickiness &amp; hardcore dominance</p>
          <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px', marginBottom: '20px' }}>
            South Korea is one of the most lucrative, high-penetration mobile markets on earth: the fourth largest, with 24 million active mobile gamers.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--purple)' }}><div><h4>The Playtime Multiplier</h4><p>Top-grossing Korean games average 119 minutes of daily playtime, an engagement rate 4 to 5 times higher than standard vertical averages.</p></div></div>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--purple)' }}><div><h4>RPG Sovereignty</h4><p>RPGs command 47% of total market revenue at $3.17 billion. Google Play captures 79% ($2.49 billion) of that, though iOS RPG revenue is on pace to expand over the next few years.</p></div></div>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--purple)' }}><div><h4>Strategy &amp; Casual Openings</h4><p>Strategy generates $716.6 million, drawing an older male audience at 45 minutes a day. Casual leads raw popularity with 177 million downloads, driven by female players logging 45 minutes daily, double the global casual baseline.</p></div></div>
          </div>
          <div className="chart-card-new rv">
            <h4>South Korean Mobile Revenue by Genre (2024)</h4>
            <div className="chart-subtitle">RPGs dwarf every other vertical (Source: Sensor Tower)</div>
            <KoreaRevenueByGenreChart />
          </div>
          <div className="info-card rv" style={{ borderLeft: '3px solid var(--yellow)', marginTop: '16px' }}>
            <div className="ic-icon" style={{ background: 'var(--yellow-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></div>
            <div><h4>Regulatory Layer &amp; Compliance</h4><p>Publishers must design around strict frameworks: local law mandates full disclosure of drop and draw probabilities across all card, gacha, and loot-box mechanics, and foreign game entities are legally required to designate an official local representative for compliance, or face stiff financial penalties.</p></div>
          </div>
          <RpPlay>
            <p>Because Korean players are driven by achievement and competition, F2P acquisition relies on demonstrating authentic, high-quality gameplay. An inbound rewarded playtime offerwall is the ideal way to monetize non-spending users, especially on Android, where casual ad monetization already accounts for 13.7% of total revenue ($18.8 million) and keeps expanding.</p>
          </RpPlay>
        </div>
      </section>

      {/* Japan */}
      <section className="sec sec-l">
        <div className="wrap rv">
          <h3 className="region-head"><span className="region-flag">🇯🇵</span> Japan</h3>
          <p className="region-sub">Maximizing outsized LTV via targeted meta-layers</p>
          <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px', marginBottom: '20px' }}>
            Japan mirrors South Korea&rsquo;s high-LTV concentration, leaning on deeply synchronized monetization systems rather than high download volumes.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--cyan-d)' }}><div><h4>The Store Revenue Paradox</h4><p>Unlike US casual ad clutter, Japan inverts the pattern: Action &amp; Strategy generate the overwhelming majority of store IAP revenue while accounting for a surprisingly low share of outbound paid ad spend.</p></div></div>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--cyan-d)' }}><div><h4>Live-Ops Breakouts</h4><p>Engagement rebounded on the back of massive domestic live-ops. Breakout titles like <em>SD Gundam G Generation ETERNAL</em> dominated domestic charts, generating exceptional revenue per day right at launch.</p></div></div>
          </div>
          <div className="chart-card-new rv">
            <h4>Hybrid-Casual IAP vs IAA Revenue Share: Japan</h4>
            <div className="chart-subtitle">Top 1,000 games by downloads per genre (Source: Sensor Tower)</div>
            <JapanRevenueShareChart />
          </div>
          <RpPlay>
            <p>Japanese users show low tolerance for disjointed, low-clarity ad creative. Outbound acquisition wins here when it uses deep performance milestones (reaching a complex meta-progression tier, for instance) that match the high-intensity preferences of the local player base.</p>
          </RpPlay>
        </div>
      </section>

      {/* Brazil & LatAm */}
      <section className="sec sec-w">
        <div className="wrap rv">
          <h3 className="region-head"><span className="region-flag">🇧🇷</span> Brazil &amp; Latin America</h3>
          <p className="region-sub">High-volume ad landscapes</p>
          <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px', marginBottom: '20px' }}>
            Anchored by Brazil&rsquo;s scale, Latin America is an essential volume powerhouse for international growth, with distinct structural monetization dynamics.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--green)' }}><div><h4>Ad-Monetization Dominance</h4><p>A volume-first, heavily Android ecosystem. Within hybrid-casual, ad revenue from rewarded video and interstitial placements provides the foundational monetization layer for publishers.</p></div></div>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--green)' }}><div><h4>Emerging Growth Vectors</h4><p>Strategy expanded its regional footprint with an $84 million revenue lift in 2025, alongside a steady $73 million increase across Puzzle sub-genres.</p></div></div>
          </div>
          <div className="chart-card-new rv">
            <h4>Mobile Game Class Ad-Spend Share vs IAP Revenue Share: Brazil</h4>
            <div className="chart-subtitle">2025 (Source: Sensor Tower)</div>
            <BrazilAdVsIapChart />
          </div>
          <RpPlay>
            <p>With direct cash-based IAP conversion sitting lower than in Tier-1 nations, inbound offerwall systems thrive across Latin America. Letting players download outbound advertiser titles to earn premium virtual currency in their core domestic game safely monetizes non-paying users&rsquo; time, without running into hard localized paywalls.</p>
          </RpPlay>
        </div>
      </section>

      {/* Europe */}
      <section className="sec sec-l">
        <div className="wrap rv">
          <h3 className="region-head"><span className="region-flag">🇪🇺</span> Europe</h3>
          <p className="region-sub">The hybrid progression model</p>
          <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px', marginBottom: '20px' }}>
            Europe has emerged as a resilient driver of IAP growth, with strong upside across Western territories despite flat download volumes.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '8px' }}>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--purple)' }}><div><h4>Geographic Variations</h4><p>In-app purchase health varies intensely by country. The United Kingdom strengthened its position markedly, France stayed entirely flat, and Germany ran into soft monetization headwinds.</p></div></div>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--purple)' }}><div><h4>The European Genre Surge</h4><p>Europe posted the industry&rsquo;s biggest Puzzle gains, an outsized $706 million IAP lift, with <em>Royal Match</em> taking the top regional spot and <em>Gossip Harbor</em> the largest net uplift. Strategy also expanded by $629 million.</p></div></div>
          </div>
          <RpPlay>
            <p>Because European casual portfolios face intense content fatigue, top publishers are testing sophisticated milestone-based events. Paid access to accumulated rewards (mini-passes without free tracks that build value through engagement) has delivered an average 18% release-revenue impact across European cohorts, aligning neatly with strict local data-privacy expectations.</p>
          </RpPlay>
        </div>
      </section>

      {/* Regional Performance Matrix */}
      <section className="sec sec-w">
        <div className="wrap rv">
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>Regional Performance Matrix</h3>
          <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Where marginal ad spend maps to the highest deep-funnel conversion potential, by region and genre.</p>
          <div className="table-scroll">
            <table className="infographic-table">
              <thead>
                <tr>
                  <th>Region</th>
                  <th>Strategy IAP Shift</th>
                  <th>Puzzle IAP Shift</th>
                  <th>Casino IAP Shift</th>
                  <th>Key Monetization Vector</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>North America</td><td className="num-pos">+$1.12B</td><td className="num-pos">+$604M</td><td className="num-neg">&minus;$860M</td><td>High ad-spend share on Casual</td></tr>
                <tr><td>Europe</td><td className="num-pos">+$629M</td><td className="num-pos">+$706M</td><td className="num-pos">+$140M</td><td>Strong progression / live-ops focus</td></tr>
                <tr><td>Asia</td><td className="num-pos">+$1.38B</td><td className="num-pos">+$321M</td><td className="num-neg">&minus;$99M</td><td>Dominant core RPG &amp; 4X strategy spend</td></tr>
                <tr><td>Latin America</td><td className="num-pos">+$84M</td><td className="num-pos">+$73M</td><td className="num-neg">&minus;$5M</td><td>Android ad-network volume capture</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* EMAIL GATE — after Regional Landscape (Ch 4) */}
      {!gateUnlocked && (
        <EmailGate
          title="Unlock the Full Rewarded Playtime Handbook"
          description="Continue reading for the latest mobile gaming trends, the data behind rewarded playtime, campaign best practices, and the KPI framework that growth teams use to measure success."
          socialProof={<>Join <strong>2,500+</strong> growth leaders who read our handbooks</>}
          ebookSlug="rewarded-playtime"
          onUnlock={unlockGatedContent}
          trackEvent={trackEvent}
        />
      )}

      {/* GATED CONTENT */}
      <div id="gatedContent" data-nosnippet className={`${gateUnlocked ? 'gated-locked unlocked' : 'gated-locked'}${gateUnlocked && !initialUnlocked ? ' gated-reveal' : ''}`}>

        {/* ───────────────────────── CH 5: TRENDS & IAPs ───────────────────────── */}
        <hr className="divider purple" />
        <section className="ch-head ch-purple" id="rp-ch5">
          <div className="wrap rv ch-enter-right ch-head-art" style={{ position: 'relative' }}>
            <span className="ch-bg-num">05</span>
            <div className="ch-head-copy">
              <div className="ch-num" style={{ color: 'var(--purple)' }}>5.0</div>
              <h2>Mobile Gaming Trends &amp; Rewarded Playtime</h2>
              <p style={{ fontSize: '.85rem', color: 'rgba(175,156,255,.8)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>The rising importance of in-app purchases</p>
              <div className="ch-desc">The market has officially shifted from chasing install volume to maximizing player value. With downloads softening, monetization now depends on capturing higher-value players who stay longer and spend more, which is why developers are prioritizing hybrid models that blend advertising, subscriptions, and IAPs without disrupting the experience.</div>
            </div>
            <img className="ch-head-img" src="/images/rp/ch5.webp" alt="Mobile game analytics dashboard showing revenue and engagement trends" loading="lazy" width="657" height="880" />
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap rv">
            <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px', marginBottom: '20px' }}>
              In-app purchases (from progression boosters to cosmetic items) remain the primary engine of revenue. Rewarded playtime feeds that engine directly by keeping players engaged long enough to form deep gameplay habits.
            </p>
            <div className="stat-callout rv" style={{ borderLeftColor: 'var(--purple)' }}>
              <div className="big-num" style={{ color: 'var(--purple)' }} data-count="5" data-suffix="x">0x</div>
              <div className="stat-body">
                <h4>The 5&times; Conversion Rule</h4>
                <p>Players who accumulate 600 minutes (10 hours) of playtime during their first week are <strong style={{ color: 'var(--text)' }}>five times more likely</strong> to convert from free users into direct IAP spenders.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mert Simsek Quote */}
        <section className="quote-block" style={{ background: 'var(--purple-l)' }}>
          <div className="wrap"><div className="quote-inner rv">
            <img className="quote-avatar" src="/images/mert-simsek.png" alt="Mert Şimşek, Co-Founder &amp; CMO at APPS" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <p className="quote-text">IAPs have become even more important for hypercasual game publishers, offering a more reliable revenue stream. By partnering with reputable incentivized UA platforms, we can reach a wider audience and attract players more likely to make in-app purchases.</p>
              <p className="quote-attr">Mert Şimşek, Co-founder &amp; CMO at APPS</p>
            </div>
          </div></div>
        </section>

        {/* Diversification of Marketing Channels */}
        <section className="sec sec-l">
          <div className="wrap rv">
            <span className="insight-badge">Diversification of Marketing Channels</span>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>A crowded market needs a different channel</h3>
            <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px', marginBottom: '16px' }}>
              With more than 84,000 active mobile game advertisers in the market (a 21.9% year-over-year surge), traditional methods have become crowded, expensive, and exposed to severe signal loss. Developers need alternative channels to attract and retain players efficiently.
            </p>
            <p style={{ fontSize: '.92rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px' }}>
              Rewarded playtime offers a genuinely different approach. Rather than dropping users into random, disruptive placements between levels, it uses a game&rsquo;s own progression mechanics, backed by monetary rewards, to build a loyal base and create organic buzz. Players deliberately opt in from dedicated loyalty spaces with a clear intention to engage, which not only encourages high-intent players to start but securely scales their long-term retention and lifetime value.
            </p>
          </div>
        </section>

        {/* Peggy Anne Salz Quote */}
        <section className="quote-block sec-w">
          <div className="wrap"><div className="quote-inner rv">
            <img className="quote-avatar" src="/images/peggy-salz.png" alt="Peggy Anne Salz, Mobile Analyst &amp; Content Marketing Strategist" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <p className="quote-text">Signal loss, rising CPIs, and the reality that traditional UA channels alone no longer cut it are driving a shift from high-volume user acquisition to high-value player experiences. Marketers who diversify channels and explore alternatives like rewarded ads will achieve sustainable growth.</p>
              <p className="quote-attr">Peggy Anne Salz, Mobile Analyst &amp; Content Marketing Strategist</p>
            </div>
          </div></div>
        </section>

        {/* Data Surrounding Rewarded Playtime */}
        <section className="sec sec-l">
          <div className="wrap rv">
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>The Data Surrounding Rewarded Playtime</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="chart-card-new rv" style={{ margin: 0 }}>
                <span className="insight-badge">Advertiser Data</span>
                <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li style={{ fontSize: '.88rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '18px', position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: 'var(--purple)', fontWeight: 700 }}>&bull;</span>33% of spenders say they&rsquo;ll spend on an IAP deal too good to refuse, and 40% spend more when they receive personalized offers.</li>
                  <li style={{ fontSize: '.88rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '18px', position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: 'var(--purple)', fontWeight: 700 }}>&bull;</span>79% of players take part in loyalty programs, and 51% spend more in-game in exchange for extra points or monetary rewards. <em>(Mistplay)</em></li>
                  <li style={{ fontSize: '.88rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '18px', position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: 'var(--green)', fontWeight: 700 }}>&bull;</span>In AppSamurai rewarded playtime campaigns, 76% of acquired players completed multiple in-game tasks, with a 24% uplift in D2 retention.</li>
                </ul>
              </div>
              <div className="chart-card-new rv" style={{ margin: 0 }}>
                <span className="insight-badge">Monetization Data</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                  <div className="stat-callout" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--purple)', padding: '18px', margin: 0, gap: '4px' }}>
                    <div className="big-num" style={{ color: 'var(--purple)', fontSize: '1.8rem', minWidth: 'auto' }} data-count="27" data-decimal="1" data-suffix="x">0x</div>
                    <div className="stat-body"><h4>eCPM Increase</h4></div>
                  </div>
                  <div className="stat-callout" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--green)', padding: '18px', margin: 0, gap: '4px' }}>
                    <div className="big-num" style={{ color: 'var(--green)', fontSize: '1.8rem', minWidth: 'auto' }} data-count="5" data-suffix="x">0x</div>
                    <div className="stat-body"><h4>CTR Increase</h4></div>
                  </div>
                  <div className="stat-callout" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--cyan-d)', padding: '18px', margin: 0, gap: '4px' }}>
                    <div className="big-num" style={{ color: 'var(--cyan-d)', fontSize: '1.8rem', minWidth: 'auto' }} data-count="16" data-decimal="1" data-suffix="x">0x</div>
                    <div className="stat-body"><h4>ARPDAU Increase</h4></div>
                  </div>
                  <div className="stat-callout" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--yellow)', padding: '18px', margin: 0, gap: '4px' }}>
                    <div className="big-num" style={{ color: 'var(--yellow)', fontSize: '1.8rem', minWidth: 'auto' }} data-count="45" data-suffix="%">0%</div>
                    <div className="stat-body"><h4>Day 1 Retention</h4></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────── CH 6: BEST PRACTICES ───────────────────────── */}
        <hr className="divider yellow" />
        <section className="ch-head" id="rp-ch6" style={{ borderTop: '4px solid var(--yellow)' }}>
          <div className="wrap rv ch-enter-left ch-head-art" style={{ position: 'relative' }}>
            <span className="ch-bg-num">06</span>
            <div className="ch-head-copy">
              <div className="ch-num" style={{ color: 'var(--yellow)' }}>6.0</div>
              <h2>Best Practices &amp; Campaign Strategy</h2>
              <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>Designing rewarded playtime experiences</p>
              <div className="ch-desc">A rewarded playtime campaign that performs needs three things: a reward experience designed around the player, clear goals, and continuous optimization of reward types, segments, and competitive positioning.</div>
            </div>
            <img className="ch-head-img" src="/images/rp/ch6.webp" alt="AppsPrize onboarding screen: start earning every minute you play" loading="lazy" width="880" height="880" />
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap rv">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--yellow)', flexDirection: 'column' }}>
                <div className="ic-icon" style={{ background: 'var(--yellow-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg></div>
                <h4>Uninterrupted User Experience</h4>
                <p>Because players opt in voluntarily, rewards fit naturally into gameplay. An undisturbed experience lifts satisfaction, encourages longer sessions, and retains players who would otherwise be put off by intrusive ads.</p>
              </div>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--yellow)', flexDirection: 'column' }}>
                <div className="ic-icon" style={{ background: 'var(--yellow-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" /></svg></div>
                <h4>Tiered Reward System</h4>
                <p>Reward players incrementally: small gift cards or discounts for early levels, scaling to larger cash prizes and coupons at major milestones. Each tier creates a sense of progression that pulls players toward the next.</p>
              </div>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--yellow)', flexDirection: 'column' }}>
                <div className="ic-icon" style={{ background: 'var(--yellow-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" fill="var(--yellow)" stroke="none" /></svg></div>
                <h4>Reward Player Investment</h4>
                <p>Match reward value to effort. Completing challenging levels, joining special events, or reaching specific milestones should trigger higher-tier payouts, so players feel their time and skill are genuinely recognized.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Faheem Quote */}
        <section className="quote-block" style={{ background: 'var(--purple-l)' }}>
          <div className="wrap"><div className="quote-inner rv">
            <img className="quote-avatar" src="/images/faheem-saiyad.png" alt="Faheem Saiyad, Director at AppSamurai" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
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
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--yellow)' }}><div className="ic-icon" style={{ background: 'var(--yellow-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg></div><div><h4>Campaign Goals &amp; Objectives</h4><p>Set specific, measurable goals up front. A retention campaign prioritizes rewards for daily logins and longer sessions; an IAP campaign offers incentives for purchases made during the campaign window.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--yellow)' }}><div className="ic-icon" style={{ background: 'var(--yellow-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg></div><div><h4>Target Audience</h4><p>Combine demographics (age, location, spending habits) with behavioral signals like in-game preferences and progression. Newer players respond to small, frequent rewards; seasoned players prefer larger, milestone-based ones.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--yellow)' }}><div className="ic-icon" style={{ background: 'var(--yellow-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><path d="M12 2a10 10 0 1 0 10 10" /><path d="M22 5l-4 2 2 4" /><circle cx="12" cy="12" r="2" /></svg></div><div><h4>Reward Optimization</h4><p>A/B test reward types and values to find the balance that maximizes engagement and ROAS: digital gift cards versus cash-back, or small frequent rewards versus larger, less frequent ones.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--yellow)' }}><div className="ic-icon" style={{ background: 'var(--yellow-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><path d="M3 3v18h18" /><path d="M7 16l4-6 4 4 5-8" /></svg></div><div><h4>Competitive Analysis</h4><p>Monitor competitor campaigns for reward strategies and player responses. If a rival offers high-value rewards behind a complex redemption flow, you can win by matching the value with a far simpler claim process.</p></div></div>
            </div>
          </div>
        </section>

        {/* ───────────────────────── CH 7: KPIs ───────────────────────── */}
        <hr className="divider green" />
        <section className="ch-head ch-green" id="rp-ch7">
          <div className="wrap rv ch-enter-right ch-head-art" style={{ position: 'relative' }}>
            <span className="ch-bg-num">07</span>
            <div className="ch-head-copy">
              <div className="ch-num" style={{ color: 'var(--green)' }}>7.0</div>
              <h2>Measuring &amp; Analyzing Performance</h2>
              <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>The five KPIs that matter</p>
              <div className="ch-desc">Refining a rewarded playtime strategy means watching the right metrics continuously and acting on campaign data. Five KPIs reveal how players behave and whether a campaign is paying off. Together they tell you what to optimize next.</div>
            </div>
            <img className="ch-head-img" src="/images/rp/ch7.webp" alt="Rewarded playtime performance metrics: eCPM, CTR, retention, and ARPDAU" loading="lazy" width="880" height="880" />
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap rv">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
              {[
                { title: 'Player Engagement', desc: 'Session length, DAU, and WAU. Longer sessions signal players are more immersed because of the rewards; rising DAU and WAU mean more players are engaging consistently.', color: 'var(--cyan-d)' },
                { title: 'Lifetime Value (LTV)', desc: 'Average revenue per player across the full engagement period. A higher LTV shows rewards are driving sustained interaction and in-app purchases, not just a short-term spike.', color: 'var(--green)' },
                { title: 'Retention Rates', desc: 'D1, D7, and D30 return rates. Strong retention indicates the model is effectively encouraging players to come back; weak rates flag where the loop is leaking.', color: 'var(--purple)' },
                { title: 'Return on Ad Spend (ROAS)', desc: 'Revenue measured against ad spend. ROAS reveals which campaigns and reward structures are most profitable; a low figure points to optimizing placements, bidding, or targeting.', color: 'var(--yellow)' },
                { title: 'Event Completion Rates', desc: 'How rewarded playtime moves players through specific in-game events. Comparing the highest and lowest completion rates lets you tune reward offerings to each event&rsquo;s difficulty and appeal.', color: 'var(--pink)' },
              ].map((kpi) => (
                <div key={kpi.title} className="info-card" style={{ margin: 0, borderTop: `3px solid ${kpi.color}`, flexDirection: 'column' }}>
                  <h4>{kpi.title}</h4>
                  <p>{kpi.desc}</p>
                </div>
              ))}
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
              Our growth team has scaled 500+ apps with rewarded UA across every major region. Tell us about your game, and we&rsquo;ll design a campaign strategy around it.
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
