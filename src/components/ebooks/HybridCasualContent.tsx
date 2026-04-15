'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import TopNav from '../shared/TopNav';
import Footer from '../shared/Footer';
import SideNav from '../shared/SideNav';
import ProgressBar from '../shared/ProgressBar';
import EmailGate from '../shared/EmailGate';
import LeadBar from '../shared/LeadBar';
import DownloadPDFButton from '../shared/DownloadPDFButton';
import DownloadPDFFab from '../shared/DownloadPDFFab';
import FAQ from '../FAQ';
import RelatedEbooks from '../shared/RelatedEbooks';
import HCRevenueChart from '../charts/hc/HCRevenueChart';
import HCDownloadsChart from '../charts/hc/HCDownloadsChart';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useAnimatedCounters } from '@/hooks/useAnimatedCounters';
import { useSideNav } from '@/hooks/useSideNav';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useProgressBar } from '@/hooks/useProgressBar';

const ANALYTICS_SECTIONS = ['hc-hero', 'hc-toc', 'hc-ch1', 'hc-ch2', 'hc-ch3', 'hc-ch4', 'hc-ch5', 'emailGate'];

const SIDE_NAV_SECTIONS = [
  { id: 'hc-hero', color: '#f48dff' },
  { id: 'hc-toc', color: '#f48dff' },
  { id: 'hc-ch1', color: '#f48dff' },
  { id: 'hc-ch2', color: '#af9cff' },
  { id: 'hc-ch3', color: '#f4cb00' },
  { id: 'hc-ch4', color: '#26BE81' },
  { id: 'hc-ch5', color: '#00f4f4' },
];

const SIDE_NAV_ITEMS = [
  { id: 'hc-hero', label: 'Home', defaultColor: 'var(--pink)' },
  { id: 'hc-toc', label: 'Contents' },
  { id: 'hc-ch1', label: 'Introduction' },
  { id: 'hc-ch2', label: 'What Are They' },
  { id: 'hc-ch3', label: 'Why Now' },
  { id: 'hc-ch4', label: 'Market Impact' },
  { id: 'hc-ch5', label: 'Marketing' },
];

const HC_FAQ = [
  { question: 'What defines a hybrid-casual game?', answer: 'Hybrid-casual games combine a hyper-casual core game loop and simple mechanics with the features and monetization models of casual and mid-core games. They retain instant action and accessibility while adding deeper progression systems, narrative layers, and multiple monetization streams.' },
  { question: 'Why did hybrid-casual games emerge?', answer: 'Three factors converged: Apple\'s ATT framework increased user acquisition costs, ad-only monetization reached saturation, and players began churning from repetitive hyper-casual titles. Hybrid-casual games address all three by offering deeper engagement with diversified revenue streams.' },
  { question: 'How do hybrid-casual games monetize differently?', answer: 'Unlike hyper-casual games that run on ads alone, hybrid-casual games mix in-app purchases, advertising, and subscriptions. This spread accommodates different player spending habits and produces higher-LTV revenue.' },
  { question: 'What marketing strategies work best for hybrid-casual games?', answer: 'Rewarded Playtime and Rewarded Engagement stand out. Both reward players for spending time in-game, which lifts retention, engagement, IAP conversion, and lifetime value.' },
];

interface HybridCasualContentProps {
  initialUnlocked: boolean;
}

export default function HybridCasualContent({ initialUnlocked }: HybridCasualContentProps) {
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
      setTimeout(() => { document.getElementById('hc-ch3')?.scrollIntoView({ behavior: 'smooth' }); }, 500);
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
      <div className="hero-wrap" style={{ background: 'linear-gradient(180deg, #2a0845 0%, #1A1A2E 100%)' }}>
        <section className="hero hero-dark" id="hc-hero" style={{ minHeight: '70vh' }}>
          <div className="rv" style={{ textAlign: 'center' }}>
            <span className="hero-badge" style={{ background: 'rgba(244,141,255,.15)', color: '#f48dff', border: '1px solid rgba(244,141,255,.3)' }}>AppSamurai for Games</span>
            <h1 style={{ color: '#fff' }}>
              The Rise of <em style={{ fontStyle: 'normal', color: '#f48dff' }}>Hybrid-Casual</em> Games
            </h1>
            <p style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1rem,2vw,1.3rem)', fontWeight: 600, marginBottom: '16px', letterSpacing: '-.01em' }}>
              The Next Era in Mobile Gaming
            </p>
            <p className="hero-sub">
              Why hybrid-casual games took off, how they mix casual accessibility with mid-core depth, and which marketing strategies are driving growth in this category.
            </p>
            <div className="hero-cta">
              <button className="btn-primary" onClick={() => scrollTo('hc-toc')}>
                Explore the Ebook <span>&darr;</span>
              </button>
              <DownloadPDFButton
                slug="hybrid-casual"
                unlocked={gateUnlocked}
                trackEvent={trackEvent}
                section="hero"
                onLocked={() => trackEvent('cta_click', 'hero', { destination: 'gate', intent: 'pdf' })}
              />
            </div>
          </div>
        </section>
      </div>

      {/* KEY METRICS */}
      <section className="bento" id="hcBento">
        <div className="wrap">
          <div className="bento-grid">
            <div className="bento-card b-pink rv">
              <div className="bento-val" style={{ color: 'var(--pink)' }}>$1.4B</div>
              <div className="bento-lbl">Hybrid-Casual Revenue 2022</div>
              <span className="delta pos">App Store + Google Play</span>
            </div>
            <div className="bento-card b-purple rv">
              <div className="bento-val" style={{ color: 'var(--purple)' }}>5.1B</div>
              <div className="bento-lbl">Global Downloads 2022</div>
              <span className="delta pos">Source: Sensor Tower</span>
            </div>
            <div className="bento-card b-green rv">
              <div className="bento-val" style={{ color: 'var(--green)' }} data-count="30" data-suffix="%">0%</div>
              <div className="bento-lbl">Hybrid-Casual Revenue Growth</div>
              <span className="delta pos">YoY 2023</span>
            </div>
            <div className="bento-card b-yellow rv">
              <div className="bento-val" style={{ color: 'var(--yellow)' }} data-count="37" data-suffix="%">0%</div>
              <div className="bento-lbl">Mid-core US Revenue Share</div>
              <span className="delta pos">GameRefinery, July 2022</span>
            </div>
          </div>
        </div>
      </section>

      {/* TOC */}
      <section className="toc" id="hc-toc">
        <div className="wrap">
          <div className="toc-label rv">What&apos;s Inside</div>
          <h2 className="rv">The Rise of Hybrid-Casual Games</h2>
          <div className="toc-grid">
            <a href="#hc-ch1" className="toc-card rv" style={{ borderLeftColor: 'var(--pink)' }}><div className="toc-num" style={{ color: 'var(--pink)' }}>01</div><h3>Introduction</h3><p>The shift from hyper-casual to hybrid-casual and why the industry is embracing this model.</p></a>
            <a href="#hc-ch2" className="toc-card rv" style={{ borderLeftColor: 'var(--purple)' }}><div className="toc-num" style={{ color: 'var(--purple)' }}>02</div><h3>What Are Hybrid-Casual Games?</h3><p>Genre spectrum from hyper-casual to hardcore, and the recipe that creates hybrid-casual.</p></a>
            <a href="#hc-ch3" className="toc-card rv" style={{ borderLeftColor: 'var(--yellow)' }}><div className="toc-num" style={{ color: 'var(--yellow)' }}>03</div><h3>Why Did They Emerge?</h3><p>ATT, ad monetization limits, market saturation, and the forces that created this shift.</p></a>
            <a href="#hc-ch4" className="toc-card rv" style={{ borderLeftColor: 'var(--green)' }}><div className="toc-num" style={{ color: 'var(--green)' }}>04</div><h3>How They Enliven the Market</h3><p>Improved retention, higher engagement, increased consumer spending, and better UA.</p></a>
            <a href="#hc-ch5" className="toc-card rv" style={{ borderLeftColor: 'var(--cyan)' }}><div className="toc-num" style={{ color: 'var(--cyan)' }}>05</div><h3>Marketing for Hybrid-Casual</h3><p>Rewarded Playtime and Rewarded Engagement as out-of-the-box marketing strategies.</p></a>
          </div>
        </div>
      </section>

      {/* CH 1: INTRODUCTION */}
      <hr className="divider" style={{ borderColor: 'var(--pink)' }} />
      <section className="ch-head" id="hc-ch1" style={{ borderTop: '4px solid var(--pink)' }}>
        <div className="wrap rv ch-enter-right" style={{ position: 'relative' }}>
          <span className="ch-bg-num">01</span>
          <div className="ch-num" style={{ color: 'var(--pink)' }}>1.0</div>
          <h2>The Hybrid-Casual Revolution</h2>
          <p style={{ fontSize: '.85rem', color: 'rgba(244,141,255,.7)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>A New Era in Mobile Gaming</p>
          <div className="ch-desc">The mobile gaming industry is moving past hyper-casual. Hybrid-casual titles blend genres, combining the instant pick-up-and-play of casual games with the progression systems that keep mid-core players coming back.</div>
        </div>
      </section>

      {/* Osman Soysal Quote */}
      <section className="quote-block" style={{ background: 'var(--pink-l)' }}>
        <div className="wrap"><div className="quote-inner rv">
          <img className="quote-avatar" src="/images/osman-soysal.png" alt="Osman Soysal" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <p className="quote-text">The gaming landscape has undergone significant transformations, leading to the waning profitability of hyper-casual games. The industry recognized the need for a fresh approach that could captivate players and sustain profitability. By catering to a broader audience, hybrid-casual games bridge the gap between casual players seeking more depth and hardcore gamers craving more accessible experiences.</p>
            <p className="quote-attr">Osman Soysal, Managing Director at AppSamurai</p>
          </div>
        </div></div>
      </section>

      {/* CH 2: WHAT ARE HYBRID-CASUAL GAMES */}
      <hr className="divider purple" />
      <section className="ch-head ch-purple" id="hc-ch2">
        <div className="wrap rv ch-enter-scale" style={{ position: 'relative' }}>
          <span className="ch-bg-num">02</span>
          <div className="ch-num" style={{ color: 'var(--purple)' }}>2.0</div>
          <h2>What Are Hybrid-Casual Games?</h2>
          <p style={{ fontSize: '.85rem', color: 'rgba(175,156,255,.7)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>The Game Genre Spectrum</p>
          <div className="ch-desc">Hybrid-casual games layer casual and mid-core features onto a hyper-casual core loop: instant action on the surface, deeper progression underneath.</div>
        </div>
      </section>

      <section className="sec sec-w">
        <div className="wrap rv">
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text)', textAlign: 'center' }}>The Genre Spectrum</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
            {[
              { num: '01', title: 'Hyper-Casual', desc: 'Basic core loops, instant action, minimal UI, easy to master. Ad-based monetization.', color: '#d4c5ff' },
              { num: '02', title: 'Casual', desc: 'Simple mechanics, accessible gameplay, meta layers like characters and collectibles. IAPs + ads.', color: '#af9cff' },
              { num: '03', title: 'Mid-Core', desc: 'Deeper mechanics, immersive storylines, longer sessions. More active gaming community.', color: '#8B7AE0' },
              { num: '04', title: 'Hardcore', desc: 'Complex mechanics, deep storylines, long sessions. Dedicated community focused on mastery.', color: '#6D28D9' },
            ].map((genre) => (
              <div key={genre.num} className="info-card" style={{ margin: 0, borderTop: `3px solid ${genre.color}`, flexDirection: 'column', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', fontWeight: 800, color: genre.color, marginBottom: '4px' }}>{genre.num}</div>
                <h4>{genre.title}</h4>
                <p style={{ fontSize: '.82rem' }}>{genre.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Recipe */}
      <section className="sec sec-l">
        <div className="wrap rv">
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text)', textAlign: 'center' }}>The Hybrid-Casual Recipe</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
            <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--pink)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '4px' }}>&#11088;</div>
              <h4>Core Game Mechanic</h4>
              <p style={{ fontSize: '.82rem' }}>Casual and hyper-casual gameplay</p>
            </div>
            <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--purple)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '4px' }}>&#128142;</div>
              <h4>Meta Layers</h4>
              <p style={{ fontSize: '.82rem' }}>Casual and mid-core features</p>
            </div>
            <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--yellow)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '4px' }}>&#129689;</div>
              <h4>Monetization</h4>
              <p style={{ fontSize: '.82rem' }}>IAPs, ads, and subscriptions</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h4 style={{ fontFamily: 'var(--font-h)', fontWeight: 700, color: 'var(--text)' }}>7 Meta Layers of Hybrid-Casual Games</h4>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {[
              { n: '1', title: 'Storyline', desc: 'Narrative and mood', color: '#FCA5A5' },
              { n: '2', title: 'Collecting', desc: 'Complete collections', color: '#C4B5FD' },
              { n: '3', title: 'Decorating', desc: 'Build and customize', color: '#DDA0DD' },
              { n: '4', title: 'Customization', desc: 'Control the look', color: '#93E1F6' },
              { n: '5', title: 'Game Modes', desc: 'Events and challenges', color: '#86EFAC' },
              { n: '6', title: 'Social Modes', desc: 'Play together', color: '#F9A8D4' },
              { n: '7', title: 'Upgrading', desc: 'Progress and grow', color: '#A78BFA' },
            ].map((meta) => (
              <div key={meta.n} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '16px 12px', textAlign: 'center', borderTop: `3px solid ${meta.color}` }}>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 800, color: meta.color, marginBottom: '2px' }}>{meta.n}</div>
                <h4 style={{ fontSize: '.85rem', marginBottom: '2px' }}>{meta.title}</h4>
                <p style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{meta.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EMAIL GATE — after Chapter 2 */}
      {!gateUnlocked && (
        <EmailGate
          title="Unlock the Full Hybrid-Casual Ebook"
          description="Continue reading for market analysis, revenue data, UA strategies, and expert insights on the hybrid-casual gaming revolution."
          socialProof={<>Join <strong>2,500+</strong> growth leaders who read our ebooks</>}
          ebookSlug="hybrid-casual"
          onUnlock={unlockGatedContent}
          trackEvent={trackEvent}
        />
      )}

      {/* GATED CONTENT */}
      <div id="gatedContent" data-nosnippet className={`${gateUnlocked ? 'gated-locked unlocked' : 'gated-locked'}${gateUnlocked && !initialUnlocked ? ' gated-reveal' : ''}`}>

        {/* CH 3: WHY DID THEY EMERGE */}
        <hr className="divider" style={{ borderColor: 'var(--yellow)' }} />
        <section className="ch-head" id="hc-ch3" style={{ borderTop: '4px solid var(--yellow)' }}>
          <div className="wrap rv ch-enter-left" style={{ position: 'relative' }}>
            <span className="ch-bg-num">03</span>
            <div className="ch-num" style={{ color: 'var(--yellow)' }}>3.0</div>
            <h2>Why Did Hybrid-Casual Games Emerge?</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>Recent Changes in the Industry</p>
            <div className="ch-desc">Three forces pushed hybrid-casual into existence: Apple&apos;s App Tracking Transparency, the ceiling on ad-only monetization, and a saturated market where engagement and retention were falling.</div>
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap rv">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--yellow)', flexDirection: 'column' }}>
                <div className="ic-icon" style={{ background: 'var(--yellow-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                <h4>ATT (App Tracking Transparency)</h4>
                <p>iOS 14.5 made tracking opt-in, driving up UA costs and cutting the precision of targeted ads. Developers needed new engagement and monetization strategies without cheap, large-scale targeting.</p>
              </div>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--yellow)', flexDirection: 'column' }}>
                <div className="ic-icon" style={{ background: 'var(--yellow-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><path d="M3 3v18h18"/><path d="M7 16l4-6 4 4 5-8"/></svg></div>
                <h4>Ad Monetization Limits</h4>
                <p>In a saturated market, ad-based monetization alone falls short. When engagement and retention are low, fewer impressions per user means less ad revenue per install.</p>
              </div>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--yellow)', flexDirection: 'column' }}>
                <div className="ic-icon" style={{ background: 'var(--yellow-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--yellow)' }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div>
                <h4>Low Engagement &amp; Retention</h4>
                <p>Hyper-casual&apos;s repetitive loops are burning out players. Without a reason to return, CPI climbs, retention drops, and LTV and ROAS shrink.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Utku Erdinc Quote */}
        <section className="quote-block" style={{ background: 'var(--purple-l)' }}>
          <div className="wrap"><div className="quote-inner rv">
            <img className="quote-avatar" src="/images/utku-erdinc.png" alt="Utku Erdinc" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <p className="quote-text">The Hyper-Casual industry has been working on games that solely depend on game mechanics and focusing on the first 3 days of in-game monetization. In recent years, we at Rollic have shifted focus and started working to achieve $0.70 to $0.80 of LTVs, and it eventually surpassed the $1 benchmark. The mobile gaming industry should eventually start expecting D7+ user engagement to become absolutely critical.</p>
              <p className="quote-attr">Utku Erdinc, Vice President of Gaming at Rollic</p>
            </div>
          </div></div>
        </section>

        {/* CH 4: HOW THEY ENLIVEN THE MARKET */}
        <hr className="divider green" />
        <section className="ch-head ch-green" id="hc-ch4">
          <div className="wrap rv ch-enter-right" style={{ position: 'relative' }}>
            <span className="ch-bg-num">04</span>
            <div className="ch-num" style={{ color: 'var(--green)' }}>4.0</div>
            <h2>How Hybrid-Casual Enlivens the Market</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>Retention, Engagement, Spending, and UA</p>
            <div className="ch-desc">Hybrid-casual keeps the instant-action feel of hyper-casual but adds deeper progression. The result: better retention, longer player lifecycles, and higher LTV.</div>
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="chart-card-new rv">
                <h4>Worldwide Hybrid-Casual Revenue</h4>
                <div className="chart-subtitle">App Store + Google Play (Source: Sensor Tower)</div>
                <div className="chart-wrap" style={{ height: '280px' }}><HCRevenueChart /></div>
              </div>
              <div className="chart-card-new rv">
                <h4>Worldwide Hybrid-Casual Downloads</h4>
                <div className="chart-subtitle">App Store + Google Play (Source: Sensor Tower)</div>
                <div className="chart-wrap" style={{ height: '280px' }}><HCDownloadsChart /></div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec sec-l">
          <div className="wrap rv">
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>4 Benefits of Hybrid-Casual Games</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--green)' }}><div className="ic-icon"><svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 16l4-6 4 4 5-8"/></svg></div><div><h4>Longer Retention</h4><p>Deeper progression keeps players in-game longer. D1 retention above 35% signals a successful mobile game, per GameAnalytics benchmarks.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--green)' }}><div className="ic-icon"><svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div><div><h4>Higher Engagement</h4><p>More complex mechanics demand skill and strategy. Meta layers like collecting, customizing, and competing give players multiple reasons to stay invested.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--green)' }}><div className="ic-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg></div><div><h4>Increased Consumer Spending</h4><p>IAPs, virtual goods, and subscriptions open multiple revenue channels. Players who spend money stay longer, and the diversified model reduces reliance on ads alone.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--green)' }}><div className="ic-icon"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></div><div><h4>Improved User Acquisition</h4><p>Hybrid-casual games attract a wider player base and produce richer creative assets for app stores and paid campaigns.</p></div></div>
            </div>
          </div>
        </section>

        {/* CH 5: MARKETING */}
        <hr className="divider" style={{ borderColor: 'var(--cyan)' }} />
        <section className="ch-head" id="hc-ch5" style={{ borderTop: '4px solid var(--cyan)' }}>
          <div className="wrap rv ch-enter-bottom" style={{ position: 'relative' }}>
            <span className="ch-bg-num">05</span>
            <div className="ch-num" style={{ color: 'var(--cyan)' }}>5.0</div>
            <h2>Marketing for Hybrid-Casual Games</h2>
            <p style={{ fontSize: '.85rem', color: 'rgba(0,244,244,.6)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>Out-of-the-box Strategies</p>
            <div className="ch-desc">Hybrid-casual faces less saturation than hyper-casual, but standing out still requires sharp marketing. Two strategies are outperforming traditional UA channels.</div>
          </div>
        </section>

        {/* Ryan Chadwick Quote */}
        <section className="quote-block sec-l">
          <div className="wrap"><div className="quote-inner rv">
            <img className="quote-avatar" src="/images/ryan-chadwick.png" alt="Ryan Chadwick" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <p className="quote-text">Rewarded playtime is a great user acquisition source for Tripledot Studios and other ad-monetized publishers. Time-based incentives increase the number of ads watched per user, resulting in a win-win situation for both parties: more fulfilling gameplay for users and more ads revenue for publishers.</p>
              <p className="quote-attr">Ryan Chadwick, Senior Marketing Analyst at Tripledot Studios</p>
            </div>
          </div></div>
        </section>

        <section className="sec sec-w">
          <div className="wrap rv">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--cyan)', flexDirection: 'column' }}>
                <div className="ic-icon" style={{ background: 'rgba(0,244,244,.1)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--cyan)' }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div>
                <h4>Rewarded Playtime</h4>
                <p>Players earn coins or points per minute of gameplay, redeemable for in-app purchases, gift cards, or cash. The longer they play, the more they earn. That loop lifts retention, engagement, IAP conversion, and lifetime value.</p>
              </div>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--cyan)', flexDirection: 'column' }}>
                <div className="ic-icon" style={{ background: 'rgba(0,244,244,.1)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--cyan)' }}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg></div>
                <h4>Rewarded Engagement</h4>
                <p>Players complete in-game tasks and challenges for rewards on completion. This conversion-based model lifts ARPU: more engaged time means more ad views and higher revenue per player.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FAQ items={HC_FAQ} chapterColor="var(--pink)" />

        {/* PDF DOWNLOAD */}
        <section className="gate" style={{ padding: '36px 0' }} id="pdfDownload">
          <div className="gate-inner rv">
            <div className="gate-icon">&#128196;</div>
            <h2>Download the Full Ebook as PDF</h2>
            <p>Save the complete Hybrid-Casual Games ebook — every chart, case study, and strategy to take on the go.</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <DownloadPDFButton
                slug="hybrid-casual"
                unlocked={gateUnlocked}
                trackEvent={trackEvent}
                section="pdf_section"
                variant="primary"
                label="Download PDF"
              />
            </div>
            <div className="gate-note">Opens your device&rsquo;s print dialog — choose &ldquo;Save as PDF.&rdquo; Works on mobile &amp; desktop.</div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="sec sec-w" style={{ textAlign: 'center', padding: '56px 0' }}>
          <div className="wrap">
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>
              Ready to Grow Your Hybrid-Casual Game?
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto 24px', lineHeight: 1.7 }}>
              Our growth team has scaled 500+ apps through rewarded UA and OEM discovery. Tell us about your game, and we&apos;ll build a growth plan around it.
            </p>
            <a href="https://appsamurai.com/contact" target="_blank" rel="noopener noreferrer"
               className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', fontSize: '1rem', padding: '16px 40px' }}
               onClick={() => trackEvent('cta_click', 'hc_final_cta', { destination: 'contact' })}>
              Talk to Our Growth Team &rarr;
            </a>
          </div>
        </section>

        <RelatedEbooks currentSlug="hybrid-casual" />

      </div>{/* END gatedContent */}

      <Footer />

      <LeadBar
        message="Get the full Hybrid-Casual Games ebook"
        buttonText="Unlock Full Ebook"
        onCtaClick={() => { trackEvent('cta_click', 'lead_bar', { destination: 'gate' }); scrollTo('emailGate'); }}
      />

      <DownloadPDFFab slug="hybrid-casual" unlocked={gateUnlocked} trackEvent={trackEvent} />
    </>
  );
}
