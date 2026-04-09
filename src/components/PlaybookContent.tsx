'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  DoughnutChart,
  ProgrammaticChart,
  LTVChart,
  AdTypesChart,
  GenreChart,
  RetentionChart,
  MarketShareChart,
  OEMFormatChart,
  ASABubbleChart,
} from './charts';
import AnnualTrendsPanel from './charts/AnnualTrendsPanel';
import FAQ, { DSP_FAQ, REWARDED_FAQ, OEM_FAQ, ASA_FAQ } from './FAQ';
import TrendingContent from './TrendingContent';
import RelatedEbooks from './shared/RelatedEbooks';
import TopNav from './shared/TopNav';
import Footer from './shared/Footer';
import SideNav from './shared/SideNav';
import ProgressBar from './shared/ProgressBar';
import EmailGate from './shared/EmailGate';
import LeadBar from './shared/LeadBar';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useAnimatedCounters } from '../hooks/useAnimatedCounters';
import { useSideNav } from '../hooks/useSideNav';
import { useAnalytics } from '../hooks/useAnalytics';
import { useProgressBar } from '../hooks/useProgressBar';

const ANALYTICS_SECTIONS = ['hero', 'toc', 'ch1', 'ch2', 'ch3', 'ch4', 'emailGate', 'about', 'calculatorTeaser'];

const SIDE_NAV_SECTIONS = [
  { id: 'hero', color: '#26BE81' },
  { id: 'toc', color: '#26BE81' },
  { id: 'ch1', color: '#26BE81' },
  { id: 'ch2', color: '#af9cff' },
  { id: 'ch3', color: '#555' },
  { id: 'ch4', color: '#00f4f4' },
];

const SIDE_NAV_ITEMS = [
  { id: 'hero', label: 'Home', defaultColor: 'var(--green)' },
  { id: 'toc', label: 'Contents' },
  { id: 'ch1', label: 'DSP Engine' },
  { id: 'ch2', label: 'Rewarded' },
  { id: 'ch3', label: 'OEM' },
  { id: 'ch4', label: 'ASA & ASO' },
];

interface PlaybookContentProps {
  initialUnlocked: boolean;
}

export default function PlaybookContent({
  initialUnlocked,
}: PlaybookContentProps) {
  const [gateUnlocked, setGateUnlocked] = useState(initialUnlocked);
  const [retTab, setRetTab] = useState('d7');

  const initReveal = useScrollReveal();
  const initCounters = useAnimatedCounters();
  const initSideNav = useSideNav(SIDE_NAV_SECTIONS);
  const { trackEvent } = useAnalytics(ANALYTICS_SECTIONS);
  useProgressBar(gateUnlocked);

  /* ── Main init ── */
  useEffect(() => {
    initReveal();
    initCounters();
    initSideNav();

    // If already unlocked (returning visitor), init gated content
    if (gateUnlocked) {
      setTimeout(() => {
        requestAnimationFrame(() => {
          initReveal();
          initCounters();
        });
      });
    }
  }, [initReveal, initCounters, initSideNav, gateUnlocked]);

  /* ── Unlock gated content ── */
  const unlockGatedContent = useCallback(
    (scroll: boolean) => {
      setGateUnlocked(true);
      setTimeout(() => {
        initReveal();
        initCounters();
      }, 500);
      if (scroll) {
        setTimeout(() => {
          document
            .getElementById('ch2')
            ?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    },
    [initReveal, initCounters]
  );

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

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
      <div className="hero-wrap">
          <section className="hero" id="hero">
            <div className="rv">
              <span className="hero-badge">AppSamurai Industry Report 2026</span>
              <h1>
                Scale <em>Smarter</em> in 2026
              </h1>
              <p style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1rem,2vw,1.3rem)', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', letterSpacing: '-.01em' }}>
                2026 Mobile Growth Strategy Guide
              </p>
              <p className="hero-sub">
                The definitive strategy guide for Rewarded Playtime, Programmatic DSP,
                OEM Discovery, and Apple Search Ads. Built for growth teams who
                need to scale smarter in 2026.
              </p>
              <div className="hero-cta">
                <button
                  className="btn-primary"
                  onClick={() => scrollTo('toc')}
                >
                  Explore the Guide <span>&darr;</span>
                </button>
                <button
                  className="btn-outline"
                  onClick={() => { trackEvent('cta_click', 'hero', { destination: 'pdf' }); scrollTo('emailGate'); }}
                >
                  Download PDF
                </button>
              </div>
            </div>
          </section>
      </div>

      {/* BENTO GRID */}
      <section className="bento" id="bento">
        <div className="wrap">
          <div className="bento-grid">
            <div className="bento-card b-green rv">
              <div className="bento-val" data-count="167" data-prefix="$" data-suffix="B">$0B</div>
              <div className="bento-lbl">Consumer In-App Spending 2025</div>
              <span className="delta pos">&#9650; +10.6% YoY</span>
            </div>
            <div className="bento-card b-yellow rv">
              <div className="bento-val" data-count="53" data-prefix="" data-suffix="T" data-decimal="1">0T</div>
              <div className="bento-lbl">Hours Spent in Apps Globally</div>
              <span className="delta pos">&#9650; 600+ hrs/person</span>
            </div>
            <div className="bento-card b-cyan rv">
              <div className="bento-val" data-count="3" data-prefix="" data-suffix="B+">0B+</div>
              <div className="bento-lbl">Active Android Users via OEM</div>
              <span className="delta pos">&#9650; 72% market share</span>
            </div>
            <div className="bento-card b-purple rv">
              <div className="bento-val" data-count="34" data-prefix="" data-suffix="">0</div>
              <div className="bento-lbl">Apps Used Monthly per Person</div>
              <span className="delta pos">&#9650; 10 unique/day</span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="logo-wall">
        <div className="wrap">
          <p className="logo-wall-label rv">Trusted by leading brands worldwide</p>
          <div className="logo-scroll">
            <div className="logo-track">
              <span className="logo-item"><img src="/logos/ea.svg" alt="EA" className="logo-svg" /></span>
              <span className="logo-item logo-item--text">Rovio</span>
              <span className="logo-item logo-item--text">TapNation</span>
              <span className="logo-item logo-item--text">Shahid</span>
              <span className="logo-item"><img src="/logos/hbo.svg" alt="HBO Max" className="logo-svg" /></span>
              <span className="logo-item"><img src="/logos/nike.svg" alt="Nike" className="logo-svg" /></span>
              <span className="logo-item logo-item--text">Gram Games</span>
              <span className="logo-item"><img src="/logos/dominos.svg" alt="Domino's" className="logo-svg" /></span>
              <span className="logo-item logo-item--text">Superplay</span>
              <span className="logo-item logo-item--text">Rollic</span>
              <span className="logo-item logo-item--text">Hepsiburada</span>
              {/* Duplicate for seamless scroll */}
              <span className="logo-item"><img src="/logos/ea.svg" alt="EA" className="logo-svg" /></span>
              <span className="logo-item logo-item--text">Rovio</span>
              <span className="logo-item logo-item--text">TapNation</span>
              <span className="logo-item logo-item--text">Shahid</span>
              <span className="logo-item"><img src="/logos/hbo.svg" alt="HBO Max" className="logo-svg" /></span>
              <span className="logo-item"><img src="/logos/nike.svg" alt="Nike" className="logo-svg" /></span>
              <span className="logo-item logo-item--text">Gram Games</span>
              <span className="logo-item"><img src="/logos/dominos.svg" alt="Domino's" className="logo-svg" /></span>
              <span className="logo-item logo-item--text">Superplay</span>
              <span className="logo-item logo-item--text">Rollic</span>
              <span className="logo-item logo-item--text">Hepsiburada</span>
            </div>
          </div>
          <div className="logo-scroll" style={{ '--scroll-dir': 'reverse' } as React.CSSProperties}>
            <div className="logo-track">
              <span className="logo-item logo-item--text">Samsung</span>
              <span className="logo-item logo-item--text">OPPO</span>
              <span className="logo-item logo-item--text">Nokia</span>
              <span className="logo-item"><img src="/logos/t-mobile.svg" alt="T-Mobile" className="logo-svg" /></span>
              <span className="logo-item"><img src="/logos/verizon.svg" alt="Verizon" className="logo-svg" /></span>
              <span className="logo-item"><img src="/logos/att.svg" alt="AT&amp;T" className="logo-svg" /></span>
              <span className="logo-item logo-item--text">InMobi</span>
              <span className="logo-item"><img src="/logos/unity.svg" alt="Unity" className="logo-svg" /></span>
              <span className="logo-item logo-item--text">AppLovin</span>
              <span className="logo-item logo-item--text">Taboola</span>
              <span className="logo-item logo-item--text">Smaato</span>
              <span className="logo-item logo-item--text">Beymen</span>
              {/* Duplicate */}
              <span className="logo-item logo-item--text">Samsung</span>
              <span className="logo-item logo-item--text">OPPO</span>
              <span className="logo-item logo-item--text">Nokia</span>
              <span className="logo-item"><img src="/logos/t-mobile.svg" alt="T-Mobile" className="logo-svg" /></span>
              <span className="logo-item"><img src="/logos/verizon.svg" alt="Verizon" className="logo-svg" /></span>
              <span className="logo-item"><img src="/logos/att.svg" alt="AT&amp;T" className="logo-svg" /></span>
              <span className="logo-item logo-item--text">InMobi</span>
              <span className="logo-item"><img src="/logos/unity.svg" alt="Unity" className="logo-svg" /></span>
              <span className="logo-item logo-item--text">AppLovin</span>
              <span className="logo-item logo-item--text">Taboola</span>
              <span className="logo-item logo-item--text">Smaato</span>
              <span className="logo-item logo-item--text">Beymen</span>
            </div>
          </div>
        </div>
      </section>

      {/* ML Foundations: Trending Content Ranking */}
      <TrendingContent />

      {/* TOC */}
      <section className="toc" id="toc">
        <div className="wrap">
          <div className="toc-label rv">What&apos;s Inside</div>
          <h2 className="rv">The Complete 2026 Mobile Growth Strategy Guide</h2>
          <div className="toc-grid">
            <a href="#ch1" className="toc-card rv"><div className="toc-num">01</div><h3>The Programmatic Engine</h3><p>Scaling beyond walled gardens with AI, transparency, creative intelligence, and bid-level precision.</p></a>
            <a href="#ch2" className="toc-card rv"><div className="toc-num">02</div><h3>Rewarded Models</h3><p>Mastering the value-exchange model through Rewarded Playtime and Offerwalls.</p></a>
            <a href="#ch3" className="toc-card rv"><div className="toc-num">03</div><h3>OEM &amp; On-Device Discovery</h3><p>Reaching users at the source before they even open an App Store.</p></a>
            <a href="#ch4" className="toc-card rv"><div className="toc-num">04</div><h3>Apple Search Ads &amp; ASO</h3><p>Mastering intent and managing cannibalization with a unified engine.</p></a>
          </div>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className="sec sec-w" style={{ padding: '48px 0' }}>
        <div className="wrap">
          <div className="toc-label rv" style={{ marginBottom: '6px' }}>About This Data</div>
          <h3 className="rv" style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: 700, textAlign: 'center', color: '#222', marginBottom: '32px' }}>Methodology &amp; Sources</h3>
          <div className="method-grid rv">
            <div className="method-card"><div className="method-icon">&#128202;</div><p>Market data sourced from <strong>Sensor Tower</strong> and <strong>Statista</strong> covering iOS App Store and Google Play downloads and revenue estimates through December 2025.</p></div>
            <div className="method-card"><div className="method-icon">&#127919;</div><p>Campaign performance data aggregated from <strong>10,000+ campaigns</strong> managed through AppSamurai&apos;s DSP, OEM, and Rewarded Playtime platforms across 2024-2025.</p></div>
            <div className="method-card"><div className="method-icon">&#128300;</div><p>Creative analysis powered by <strong>Adjust</strong> examining 500,000+ ad creatives across iOS and Android to identify top-performing elements and trends.</p></div>
            <div className="method-card"><div className="method-icon">&#128241;</div><p>In-app revenue figures are gross — inclusive of app store commissions. Download estimates are per-user, counting one download per Apple or Google account.</p></div>
          </div>
        </div>
      </section>

      {/* DOUGHNUT */}
      <section className="sec sec-l">
        <div className="wrap">
          <div className="story rv">
            <div className="story-text">
              <span className="insight-badge">Key Data</span>
              <h3>Download Channels Share <span style={{ color: 'var(--green)' }}>2025</span></h3>
              <p>Distribution of app installs by acquisition channel. Organic still leads, but paid UA and OEM pre-loads represent the fastest-growing segments as competition for quality installs intensifies.</p>
              <div className="stat-callout" style={{ borderLeftColor: 'var(--green)' }}>
                <div className="big-num" style={{ color: 'var(--green)' }} data-count="38" data-suffix="%">0%</div>
                <div className="stat-body"><h4>Organic Still Leads</h4><p>But paid channels are closing the gap fast</p></div>
              </div>
            </div>
            <div className="story-chart"><div className="chart-wrap"><DoughnutChart /></div></div>
          </div>
        </div>
      </section>

      {/* CHAPTER 1 */}
      <hr className="divider green" />
      <section className="ch-head ch-green" id="ch1">
        <div className="wrap rv ch-enter-right" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'center' }}>
          <div>
            <span className="ch-bg-num">01</span>
            <div className="ch-num" style={{ color: 'var(--ch1)' }}>1.0</div>
            <h2>How to Scale Mobile UA with Programmatic DSP in 2026</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>The Programmatic Engine — Navigating the Open Internet</p>
            <div className="ch-desc">The 2026 Thesis: As &ldquo;Walled Gardens&rdquo; reach inventory saturation and rising costs, the biggest growth opportunities have shifted to the Open Internet. Users spend over 60% of their mobile time in independent apps. We scale by tapping into this massive inventory, reaching users during &ldquo;lean-back&rdquo; moments.</div>
          </div>
          <img src="/dsp-hero.png" alt="AppSamurai DSP Platform" style={{ maxWidth: '400px', borderRadius: '16px', display: 'block' }} />
        </div>
      </section>

      {/* Seasonal Insight Callout */}
      <section className="sec sec-w">
        <div className="wrap rv">
          <div className="stat-callout" style={{ borderLeftColor: 'var(--cyan)', background: 'var(--cyan-l)' }}>
            <div className="big-num" style={{ color: 'var(--cyan)', fontSize: '2rem' }}>2.5&times;</div>
            <div className="stat-body">
              <span className="insight-badge">The Seasonal Insight</span>
              <p>AppsFlyer&apos;s State of App Marketing reports that during major sporting events (like the World Cup or Olympics), CPMs on social platforms spike by as much as 45%, whereas programmatic inventory in non-gaming utility apps remains stable, offering a <strong>2.5x higher ROAS</strong> for brands that &ldquo;zig when others zag.&rdquo;</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shahid Quote */}
      <section className="quote-block sec-l">
        <div className="wrap"><div className="quote-inner rv">
          <img className="quote-avatar" src="/ali-shahid.png" alt="Ali Aktas" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <p className="quote-text">AppSamurai&apos;s strategic programmatic advertising expertise helped SHAHID boost user acquisition, drive subscriptions and strengthen our position as the leading MENA VOD service. Their partnership was vital to our mobile growth success.</p>
            <p className="quote-attr">Ali Aktas, Head of Performance, @Shahid</p>
          </div>
        </div></div>
      </section>

      {/* 1.1 Scrolljack */}
      <section className="sec sec-w">
        <div className="wrap">
          <div className="story rv">
            <div className="story-text rv-l">
              <span className="tag" style={{ color: 'var(--ch1)', borderColor: 'var(--ch1)' }}>Section 1.1</span>
              <h3>Programmatic Bidding Strategy: From CPM to Predictive ROAS</h3>
              <p>In 2026, the vanity metric of &ldquo;cheap impressions&rdquo; (CPM) has been officially retired. For sophisticated growth teams, the goal has shifted from winning the bid to using pre-bid intelligence to predict a post-install event before a single cent is spent.</p>
              <div className="stat-callout" style={{ borderLeftColor: 'var(--ch1)' }}>
                <div className="big-num" style={{ color: 'var(--ch1)' }} data-count="60" data-suffix="%+">0%+</div>
                <div className="stat-body"><h4>Mobile Time in Independent Apps</h4><p>Massive inventory beyond walled gardens</p></div>
              </div>
            </div>
            <div className="story-chart sticky rv-r">
              <h4 style={{ fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '.85rem', marginBottom: '12px', textAlign: 'center', color: 'var(--text)' }}>Programmatic Ad Market Growth</h4>
              <div className="chart-sub" style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--text-faint)', marginBottom: '12px' }}>Projected market size by 2030</div>
              <div className="chart-wrap" style={{ maxHeight: '300px' }}><ProgrammaticChart /></div>
            </div>
          </div>
        </div>
      </section>

      {/* 1.1 Detail Cards */}
      <section className="sec sec-l">
        <div className="wrap">
          <div className="info-card rv"><div className="ic-icon"><img className="ic-img" src="/icons/predictive roas modeling.png" alt="Predictive ROAS" /></div><div><h4>Predictive ROAS Modeling</h4><p>Real-time machine learning now enables deep-funnel, CPA-based optimization. By identifying users likely to complete specific actions&mdash;reaching a gameplay milestone or starting a subscription trial&mdash;brands achieve a more predictable path to profitability.</p></div></div>
          <div className="info-card rv"><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><img className="ic-img" src="/icons/brindging the intent gap.png" alt="Intent Gap" /></div><div><h4>Bridging the &ldquo;Intent Gap&rdquo;</h4><p>Traditional social platforms capture &ldquo;passive scrolling,&rdquo; leading to high ad fatigue. Programmatic inventory captures &ldquo;active engagement&rdquo; moments instead. Shifting spend to these high-receptivity lulls (e.g., between game levels or during utility tasks) reaches users when they are primed for discovery, not distraction.</p></div></div>
          <div className="info-card rv"><div className="ic-icon"><img className="ic-img" src="/icons/scalibility paradox.png" alt="Scalability" /></div><div><h4>The Scalability Tradeoff (Precision Control)</h4><p>Scaling without losing efficiency demands granular control. Automated Whitelisting consolidates your presence on top-performing platforms aligned with your core audience. Automated Blacklisting filters out low-intent inventory in real-time, so as your budget grows, your waste does not.</p></div></div>
          <div className="info-card rv"><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><img className="ic-img" src="/icons/transparency_mandate.png" alt="Transparency" /></div><div><h4>The Transparency Mandate</h4><p>You cannot scale what you cannot see. The 2026 open internet requires total visibility into bid floors, session depth, and loss notifications. Bid-level transparency lets growth teams uncover high-value inventory pockets that others overlook&mdash;shifting strategy from chasing volume to securing quality.</p></div></div>
        </div>
      </section>

      {/* 1.2 Creative Strategy */}
      <section className="sec sec-w">
        <div className="wrap">
          <div className="story rv">
            <div className="story-text rv-l">
              <span className="tag" style={{ color: 'var(--ch1)', borderColor: 'var(--ch1)' }}>Section 1.2</span>
              <h3>Mobile Ad Creative Playbook 2026: Psychology-Driven Performance</h3>
              <p>Creatives have become the new targeting. With granular ID-based targeting fading, the visual asset itself must do the heavy lifting of finding the right audience.</p>
              <div className="stat-callout" style={{ borderLeftColor: 'var(--yellow)' }}>
                <div className="big-num" style={{ color: 'var(--yellow)' }} data-count="30" data-suffix="%">0%</div>
                <div className="stat-body"><h4>CPA Reduction</h4><p>Through cultural authenticity in emerging markets</p></div>
              </div>
            </div>
            <div className="rv-r" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch1)' }}><div className="ic-icon"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M22 5l-4 2 2 4"/><circle cx="12" cy="12" r="2"/></svg></div><div><h4>Psychological Hooks over Aesthetics</h4><p>High-performing assets in 2026 tap user psychology&mdash;pain points, FOMO, or the desire for efficiency. When a creative resonates with a psychological profile, the algorithm naturally finds similar audiences.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch1)' }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div><div><h4>The AI-Driven Speed Requirement</h4><p>Manual A/B testing is no longer viable at scale. The benchmark has shifted to AI-powered rotation that identifies winning visual hooks (like localized gameplay mechanics) in real-time.</p></div></div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginTop: '20px' }}>
            <div className="info-card rv" style={{ margin: 0, borderTop: '3px solid var(--ch1)', flexDirection: 'column' }}><div className="ic-icon" style={{ marginBottom: '8px' }}><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg></div><h4>Context-Aware Delivery over Broad Reach</h4><p>Visibility only matters when it is contextually relevant. For high-volume platforms in VOD and streaming, tailoring creative themes to local seasonal events or dayparting (aligning themes with peak viewing times) drives down subscription costs.</p></div>
            <div className="info-card rv" style={{ margin: 0, borderTop: '3px solid var(--ch1)', flexDirection: 'column' }}><div className="ic-icon" style={{ background: 'var(--purple-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div><h4>Cultural Authenticity as a Performance Benchmark</h4><p>In 2026, localization goes far beyond translation. To scale in global markets, ads must feel &ldquo;native&rdquo; to the local culture. Regional creators, local slang, and culturally relevant scenarios are now strict performance requirements: in emerging markets, they lower CPAs by up to 30%.</p></div>
            <div className="info-card rv" style={{ margin: 0, borderTop: '3px solid var(--ch1)', flexDirection: 'column' }}><div className="ic-icon" style={{ marginBottom: '8px' }}><svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 16l4-6 4 4 5-8"/></svg></div><h4>Creative as Market Research</h4><p>Creative data is now a primary insights engine. By analyzing which iterations drive long-term LTV rather than just clicks, brands are feeding these findings back into their broader product development.</p></div>
          </div>
        </div>
      </section>

      {/* 1.2b Creative Intelligence — phone mockups with text + Ad Types chart */}
      <section className="sec sec-l">
        <div className="wrap rv">
          <span className="insight-badge">Creative Intelligence</span>
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text)' }}>What Works on Each Platform</h3>

          {/* iOS — image left, text right */}
          <div className="creative-card">
            <div style={{ textAlign: 'center' }}>
              <img src="/ios-android-age-1.png" alt="iOS Creative Playbook — sound-off design, close-up shots, gameplay focus" loading="lazy" style={{ maxWidth: '100%', maxHeight: '340px', borderRadius: '12px', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '24px' }}>&#127822;</span>
                <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>iOS Creative Playbook</h4>
              </div>
              <p style={{ fontSize: '.88rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>
                iOS users respond well to a sound-off design (+24%), that open with close-up shots (+16%) of gameplay (+45%), introduce free-offer text early (+30%), and feature a large centered logo (+29%) at the end paired with the CTA text &apos;Play Now!&apos; (+14%).
              </p>
              <p style={{ fontSize: '.7rem', color: 'var(--text-faint)', marginTop: '10px' }}>Source: Adjust</p>
            </div>
          </div>

          {/* Android — image left, text right */}
          <div className="creative-card">
            <div style={{ textAlign: 'center' }}>
              <img src="/ios-android-age-2.png" alt="Android Creative Playbook — split-screen gameplay, multiple scenes, falling coins" loading="lazy" style={{ maxWidth: '100%', maxHeight: '340px', borderRadius: '12px', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '24px' }}>&#129302;</span>
                <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>Android Creative Playbook</h4>
              </div>
              <p style={{ fontSize: '.88rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>
                Android users respond well to videos that use sound effects (+12%), split-screen (+51%) scenes showcasing gameplay (+13%), and multiple scenes (+42%), with an end card that omits a CTA (+31%) but features falling coins (+11%).
              </p>
              <p style={{ fontSize: '.7rem', color: 'var(--text-faint)', marginTop: '10px' }}>Source: Adjust</p>
            </div>
          </div>

          {/* Ad Type Impression Share — full width below */}
          <div className="chart-box" style={{ margin: 0, padding: '24px' }}>
            <div className="chart-h" style={{ fontSize: '.95rem', marginBottom: '4px' }}>Ad Type Impression Share, Worldwide</div>
            <div className="chart-sub" style={{ fontSize: '.75rem', marginBottom: '12px' }}>Image, Playable, and Video ad format share — 2024 vs 2025</div>
            <div className="chart-wrap" style={{ height: '260px', maxWidth: '500px', margin: '0 auto' }}><AdTypesChart /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '10px', fontSize: '.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              <span>Video overtakes Image as dominant format. Playable ads double (+111%).</span>
            </div>
          </div>
        </div>
      </section>

      {/* 1.3 The Incrementality Mandate */}
      <section className="sec sec-w">
        <div className="wrap"><div className="story rv">
          <div className="story-text rv-l">
            <span className="tag" style={{ color: 'var(--ch1)', borderColor: 'var(--ch1)' }}>Section 1.3</span>
            <h3>Measuring Incrementality in Mobile UA: Beyond Last-Click Attribution</h3>
            <p>With the full adoption of <strong>SKAN 5.0</strong> and the <strong>Android Privacy Sandbox</strong>, 2026 is the year of &ldquo;Signal Loss.&rdquo; The most successful growth teams have stopped chasing deterministic tracking and started embracing <strong>Incrementality</strong>.</p>
          </div>
          <div className="rv-r" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch1)' }}><div className="ic-icon"><img className="ic-img" src="/icons/Beyond the Last Click.png" alt="Beyond Last Click" /></div><div><h4>Beyond the Last Click</h4><p>To prove incremental growth, brands use probabilistic modeling and lift testing. This ensures that programmatic spend isn&apos;t merely poaching organic installs but driving incremental scale.</p></div></div>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch1)' }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><img className="ic-img" src="/icons/Contextual Resonance.png" alt="Contextual Targeting" /></div><div><h4>Contextual Targeting</h4><p>High-performing creatives are now context-aware. Tailoring themes to match local seasonal events or &ldquo;dayparting&rdquo; (aligning ads with peak viewing or usage hours) has become a key lever in driving down the cost per subscription.</p></div></div>
          </div>
        </div></div>
      </section>

      {/* 1.4 Bid-Level Visibility */}
      <section className="sec sec-l">
        <div className="wrap"><div className="story rv">
          <div className="story-text rv-l">
            <span className="tag" style={{ color: 'var(--ch1)', borderColor: 'var(--ch1)' }}>Section 1.4</span>
            <h3>Supply-Chain Transparency: Bid-Level Visibility for Mobile DSP</h3>
            <p>You cannot scale what you cannot see. The &ldquo;black box&rdquo; approach to programmatic is being rejected in favor of total supply-chain visibility.</p>
          </div>
          <div className="rv-r" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch1)' }}><div className="ic-icon"><img className="ic-img" src="/icons/inventory quality control.png" alt="Inventory QC" /></div><div><h4>Inventory Quality Control</h4><p>Scaling requires granular control via automated whitelisting (targeting top-tier platforms) and blacklisting (filtering low-intent inventory).</p></div></div>
            <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch1)' }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><img className="ic-img" src="/icons/Winning the Auction.png" alt="Winning Auction" /></div><div><h4>Winning the Auction</h4><p>Visibility into bid floors, session depth, and loss notifications is essential. This data allows growth teams to identify high-value &ldquo;pockets&rdquo; of inventory that competitors overlook, optimizing for <strong>quality over volume</strong>.</p></div></div>
          </div>
        </div></div>
      </section>

      {/* Paycell Case Study Banner */}
      <section className="sec sec-w">
        <div className="wrap rv" style={{ textAlign: 'center' }}>
          <a href="https://appsamurai.com/contact-us/" target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
            <img src="/paycell-banner.png" alt="Paycell Case Study — 32% MAU increase, +120K users, 49% QR payment increase with AppSamurai DSP" loading="lazy" style={{ width: '100%', maxWidth: '900px', borderRadius: '16px', margin: '0 auto', display: 'block', cursor: 'pointer' }} />
          </a>
        </div>
      </section>

      {/* 1.5 The Re-Engagement Imperative */}
      <section className="sec sec-l">
        <div className="wrap rv">
          <span className="tag" style={{ color: 'var(--ch1)', borderColor: 'var(--ch1)' }}>Section 1.5</span>
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Mobile App Retargeting: 3-Phase Framework to Recover 77% Lost Users</h3>
          <p style={{ fontSize: '.9rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '24px', maxWidth: '720px' }}>True growth in 2026 is a &ldquo;leaky bucket&rdquo; problem. Turning an install into a loyal user requires a three-phase retargeting framework.</p>

          {/* Stat callout cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '32px' }}>
            <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--delta-neg)' }}>
              <div className="big-num" style={{ color: 'var(--delta-neg)', fontSize: '2.4rem' }} data-count="77" data-suffix="%">0%</div>
              <div className="stat-body"><h4>DAU Lost in First 3 Days</h4><p style={{ fontSize: '.75rem' }}>Source: Statista</p></div>
            </div>
            <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--green)' }}>
              <div className="big-num" style={{ color: 'var(--green)', fontSize: '2.4rem' }}>$150B</div>
              <div className="stat-body"><h4>Mobile IAP Revenue 2024</h4><p style={{ fontSize: '.75rem' }}>Source: Sensor Tower</p></div>
            </div>
            <div className="stat-callout rv" style={{ flexDirection: 'column', textAlign: 'center', borderLeft: 'none', borderTop: '3px solid var(--yellow)' }}>
              <div className="big-num" style={{ color: 'var(--yellow)', fontSize: '2.4rem' }}>70-80%</div>
              <div className="stat-body"><h4>Users Lost Without Engagement</h4><p style={{ fontSize: '.75rem' }}>Industry Benchmark</p></div>
            </div>
          </div>

          {/* Three-phase framework */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            <div className="info-card rv" style={{ margin: 0, borderTop: '3px solid var(--ch1)', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: 'var(--font-h)', fontSize: '.85rem', flexShrink: 0 }}>1</div>
                <h4 style={{ margin: 0 }}>Strategic Win-Backs</h4>
              </div>
              <p>Not all dormant users are the same. Intelligent Segmentation groups them by inactivity duration and historical value. A user inactive 10+ days without purchases receives awareness messaging; a high-value user inactive 7 days gets a personalized reward. The key: identifying the exact &ldquo;churn window&rdquo; for surgical intervention.</p>
            </div>
            <div className="info-card rv" style={{ margin: 0, borderTop: '3px solid var(--ch1)', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: 'var(--font-h)', fontSize: '.85rem', flexShrink: 0 }}>2</div>
                <h4 style={{ margin: 0 }}>Optimizing Engagement</h4>
              </div>
              <p>Retargeting moves active users deeper into the funnel through strategic timing and frictionless re-entry. Dayparting pinpoints when users are most receptive. Direct deep linking bypasses the App Store, landing users exactly where they need to be: a product page, new feature, or pending game level.</p>
            </div>
            <div className="info-card rv" style={{ margin: 0, borderTop: '3px solid var(--ch1)', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: 'var(--font-h)', fontSize: '.85rem', flexShrink: 0 }}>3</div>
                <h4 style={{ margin: 0 }}>Revenue Maximization</h4>
              </div>
              <p>AI engines identify and reward high-value segments for revenue outcomes. Cart Recovery serves time-sensitive rewards to users with abandoned carts. Loyalty programs drive repeat purchases through personalized deals. In gaming and fintech, &ldquo;whale&rdquo; retention keeps the highest-value users engaged with exclusive experiences.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 1 FAQ */}
      <FAQ items={DSP_FAQ} chapterColor="var(--ch1)" />

      {/* EMAIL GATE */}
      {!gateUnlocked && (
        <EmailGate
          title="Unlock the Full 2026 Strategy Guide"
          description="The rest covers Rewarded Playtime (Chapter 2), OEM preloads on Samsung, Xiaomi, and Huawei (Chapter 3), and Apple Search Ads + ASO strategy (Chapter 4), plus the interactive ROI calculator."
          socialProof='Join <strong>2,500+</strong> growth leaders who&apos;ve read this playbook'
          ebookSlug="growth-playbook"
          onUnlock={unlockGatedContent}
          trackEvent={trackEvent}
        />
      )}

      {/* GATED CONTENT — always in DOM for SEO; visual gate via CSS overflow + blur */}
      <div id="gatedContent" data-nosnippet className={`${gateUnlocked ? 'gated-locked unlocked' : 'gated-locked'}${gateUnlocked && !initialUnlocked ? ' gated-reveal' : ''}`}>

        {/* CHAPTER 2 */}
        <hr className="divider purple" />
        <section className="ch-head ch-purple" id="ch2">
          <div className="wrap rv ch-enter-scale" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'center' }}>
            <div>
              <span className="ch-bg-num">02</span>
              <div className="ch-num" style={{ color: 'var(--ch2)' }}>2.0</div>
              <h2>Rewarded Playtime: The Value-Exchange Model Driving 3x Higher LTV</h2>
              <p style={{ fontSize: '.85rem', color: 'rgba(175,156,255,.7)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>Mastering the value-exchange model</p>
              <div className="ch-desc">In 2026, mobile growth has shifted from passive ad consumption to a value-exchange model. Rewarded Playtime sits at the center of sustainable growth, changing how developers acquire users, drive engagement, and grow revenue.</div>
            </div>
            <img src="/images/rewarded-entry-screens.png" alt="Rewarded Playtime interface showing user rewards and engagement" style={{ maxWidth: '400px', borderRadius: '16px', display: 'block' }} />
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap"><div className="story rv">
            <div className="story-text rv-l">
              <span className="tag" style={{ color: 'var(--ch2)', borderColor: 'var(--ch2)' }}>Section 2.1</span>
              <h3>Defining Rewarded Playtime: The Engagement Engine</h3>
              <p>Rewarded Playtime rewards users based on actual time spent and milestones achieved within an app. Unlike traditional install-focused models, it builds a continuous relationship from the first minute of gameplay.</p>
              <div className="stat-callout" style={{ borderLeftColor: 'var(--ch2)' }}>
                <div className="big-num" style={{ color: 'var(--ch2)' }} data-count="90" data-suffix=" day">0 day</div>
                <div className="stat-body"><h4>Extended LTV Window</h4><p>From Day 1 metrics to 60-90 day sustainability</p></div>
              </div>
            </div>
            <div className="rv-r" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch2)' }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><circle cx="8" cy="8" r="5"/><rect x="6" y="16" width="4" height="6" rx="1"/><path d="M14 4h8M14 8h6M14 12h4"/></svg></div><div><h4>The 60-90 Day LTV Window</h4><p>Developers are moving away from volatile Day 1 metrics and focusing on long-term sustainability by rewarding users over a 60-90 day period.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch2)' }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><circle cx="8" cy="8" r="4"/><circle cx="16" cy="8" r="4"/><circle cx="12" cy="16" r="4"/></svg></div><div><h4>Systematic Segment Optimization</h4><p>By analyzing mobile interests, demographics, and geographic data, growth teams can optimize each segment individually for maximum ROI.</p></div></div>
            </div>
          </div></div>
        </section>

        {/* LTV Comparison — after Section 2.1 */}
        <section className="sec sec-l">
          <div className="wrap">
            <div className="chart-card-new rv">
              <h4>LTV Comparison by Acquisition Model</h4>
              <div className="chart-subtitle">Rewarded Playtime delivers 2-3x higher LTV than traditional models</div>
              <div className="chart-wrap"><LTVChart /></div>
              <div style={{ marginTop: 12, padding: '12px 16px', background: 'var(--bg-alt)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text)' }}>ℹ️ Insight:</strong> Rewarded Playtime users generate $14.80 D90 LTV, nearly 3x higher than incentivized installs ($3.10). The reward mechanic drives genuine engagement, not just downloads.
              </div>
            </div>
          </div>
        </section>

        {/* Annual Trends — 3 metrics side-by-side with region filter */}
        <section className="sec sec-w">
          <div className="wrap">
            <div className="chart-card-new rv">
              <AnnualTrendsPanel />
            </div>
          </div>
        </section>

        {/* Download Channels by Genre */}
        <section className="sec sec-l">
          <div className="wrap">
            <div className="chart-card-new rv">
              <h4>Download Channels Share by Genre</h4>
              <div className="chart-subtitle">Share of downloads by product model</div>
              <div className="chart-wrap" style={{ height: '300px' }}><GenreChart /></div>
            </div>
          </div>
        </section>

        <section className="sec sec-l" style={{ padding: '24px 0' }}>
          <div className="wrap rv">
            <a href="https://appsamurai.com/roas/" target="_blank" rel="noopener noreferrer"
               style={{ display: 'block', borderRadius: 16, overflow: 'hidden', textDecoration: 'none', transition: 'box-shadow 0.3s' }}
               onClick={() => trackEvent('cta_click', 'roas_banner', { destination: 'roas' })}>
              <img src="/images/roas-forecaster-cta.png" alt="What's Your Rewarded UA Potential? Try our ROAS Forecaster — estimate returns before you invest." style={{ width: '100%', display: 'block', borderRadius: 16 }} />
            </a>
          </div>
        </section>

        {/* 2.2 Aha Moment */}
        <section className="sec sec-l">
          <div className="wrap rv">
            <span className="tag" style={{ color: 'var(--ch2)', borderColor: 'var(--ch2)' }}>Section 2.2</span>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Rewarded Playtime by Game Genre: Hypercasual, Casual, and Mid-Core Strategies</h3>
            <p style={{ fontSize: '.9rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '24px', maxWidth: '720px' }}>The &ldquo;Aha! Moment&rdquo; is the specific point where a user recognizes the core value of an app. In a rewarded ecosystem, the structure is mapped directly to these milestones to ensure users don&apos;t just install, but &ldquo;hook&rdquo; into the experience.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch2)', flexDirection: 'column' }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div><div><h4>Hypercasual Games</h4><p>Playtime uses event-based campaigns to reward users for every level completed. By continuously rewarding the user for their gameplay, the model drives extended session times and higher ARPU.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch2)', flexDirection: 'column' }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg></div><div><h4>Casual &amp; Puzzle Games</h4><p>For merge or mystery titles, the focus is repeated sessions and user attachment. Playtime gives users a visually appealing reason to keep playing and stay hooked on the core gameplay loop.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch2)', flexDirection: 'column' }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg></div><div><h4>Mid-Core &amp; High-Friction Apps</h4><p>For apps with mixed monetization or complex onboarding (FinTech, E-commerce), Playtime delivers an entertaining rewards experience. This high-retention approach lifts both revenue and LTV.</p></div></div>
            </div>
          </div>
        </section>

        {/* Retention Chart — after Section 2.2 */}
        <section className="sec sec-w">
          <div className="wrap">
            <div className="chart-card-new rv">
              <div className="chart-h" style={{ fontSize: '.95rem' }}>Mobile Game Retention Trends by Product Model</div>
              <div className="chart-subtitle" style={{ fontSize: '.75rem', marginBottom: '12px' }}>Top 25 Games by 2025 IAP Revenue per Product Model (by Downloads for Hypercasual)</div>
              <div className="tabs-center"><div className="tabs" id="retTabs">
                {['d7', 'd30', 'd1', 'd365'].map((t) => (
                  <button key={t} className={`tab-btn${retTab === t ? ' active' : ''}`} onClick={() => setRetTab(t)}>{t === 'd7' ? 'D7 Retention' : t === 'd30' ? 'D30 Retention' : t === 'd1' ? 'D1 Retention' : 'D365 Retention'}</button>
                ))}
              </div></div>
              <div className="chart-wrap" style={{ height: '280px' }}><RetentionChart tab={retTab} /></div>
              <div style={{ textAlign: 'center', fontSize: '.7rem', color: '#999', marginTop: '8px' }}>Source: Sensor Tower, State of Gaming 2026</div>
            </div>
          </div>
        </section>

        {/* 2.3 Scaling Paradox */}
        <section className="sec sec-l">
          <div className="wrap rv">
            <span className="tag" style={{ color: 'var(--ch2)', borderColor: 'var(--ch2)' }}>Section 2.3</span>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Solving the Scaling Tradeoff: Smart Bidding</h3>
            <p style={{ fontSize: '.9rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '24px', maxWidth: '720px' }}>Achieving high conversion rates while maintaining strict CPI constraints requires moving from acquiring volume toward acquiring value.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch2)' }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="var(--purple)" stroke="none"/></svg></div><div><h4>Targeting Precision</h4><p>Precise age and gender targeting lets teams bid accurately for each audience segment, reaching the right users and avoiding the trap of low-quality acquisitions.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch2)' }}><div className="ic-icon" style={{ background: 'var(--purple-l)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><path d="M12 2a10 10 0 1 0 10 10"/><path d="M22 5l-4 2 2 4"/><circle cx="12" cy="12" r="2"/></svg></div><div><h4>The Revenue Flywheel</h4><p>Initial Playtime tests often reveal high retention rates. This stability lets growth teams optimize segments individually and capitalize on diverse audience strengths, building sustainable performance.</p></div></div>
            </div>
          </div>
        </section>

        {/* Mert Quote */}
        <section className="quote-block" style={{ background: 'var(--purple-l)' }}>
          <div className="wrap"><div className="quote-inner rv">
            <img className="quote-avatar" src="/images/mert-simsek.png" alt="Mert Simsek" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <p className="quote-text">IAPs have become even more important for hypercasual game publishers, offering a more reliable revenue stream compared to the volatile nature of ad revenue. Through Rewarded UA we can reach a wider audience and attract players who are more likely to make in-app purchases while providing them with a richer gaming experience.</p>
              <p className="quote-attr">Mert Simsek, Co-founder &amp; CMO at APPS</p>
            </div>
          </div></div>
        </section>

        {/* 2.4 AppsPrize */}
        <section className="sec sec-w">
          <div className="wrap rv">
            <span className="tag" style={{ color: 'var(--ch2)', borderColor: 'var(--ch2)' }}>Section 2.4</span>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Publisher Monetization: The AppsPrize Ecosystem</h3>
            <p style={{ color: '#666', fontSize: '.88rem', marginBottom: '16px', maxWidth: '640px' }}>For publishers, maximizing yield in 2026 requires a monetization strategy that feels like a feature, not a disruption. This is the core philosophy behind <span style={{ color: 'var(--ch2)', fontWeight: 700 }}>AppsPrize.</span></p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--ch2)', flexDirection: 'column' }}><div className="ic-icon" style={{ background: 'var(--purple-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><rect x="5" y="5" width="14" height="14" rx="2"/><circle cx="10" cy="14" r="2"/><circle cx="14" cy="14" r="2"/><circle cx="12" cy="10" r="2"/></svg></div><h4>A &ldquo;Native&rdquo; Rewards Experience</h4><p>AppsPrize acts as a loyalty layer, rewarding users in the app&apos;s native currency as they explore.</p></div>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--ch2)', flexDirection: 'column' }}><div className="ic-icon" style={{ background: 'var(--purple-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><circle cx="12" cy="12" r="5"/><path d="M12 7a5 5 0 0 1 0 10"/><path d="M9 5l-2-2M15 5l2-2M9 19l-2 2M15 19l2 2"/></svg></div><h4>Verified Human Engagement</h4><p>Built on playtime and level-based events, it inherently filters out low-quality traffic. Publishers provide a platform for verified user attachment.</p></div>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--ch2)', flexDirection: 'column' }}><div className="ic-icon" style={{ background: 'var(--purple-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><rect x="5" y="5" width="14" height="14" rx="2"/><circle cx="10" cy="14" r="2"/><circle cx="14" cy="14" r="2"/><circle cx="12" cy="10" r="2"/></svg></div><h4>Visual &amp; Interactive Appeal</h4><p>A visually engaging way to discover new content, ensuring positive UX and greater attachment to both the advertised game and the host app.</p></div>
            </div>
            <div className="rv" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '24px' }}>
              <img src="/images/appsprize-1.png" alt="AppsPrize rewards experience" style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border)' }} />
              <img src="/images/appsprize-2.png" alt="AppsPrize engagement interface" style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border)' }} />
              <img src="/images/appsprize-3.png" alt="AppsPrize monetization dashboard" style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border)' }} />
            </div>
          </div>
        </section>

        {/* Chapter 2 FAQ */}
        <FAQ items={REWARDED_FAQ} chapterColor="var(--ch2)" />

        {/* CHAPTER 3 */}
        <hr className="divider dark" />
        <section className="ch-head ch-dark" id="ch3">
          <div className="wrap rv ch-enter-left" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'center' }}>
            <div>
              <span className="ch-bg-num">03</span>
              <div className="ch-num" style={{ color: 'var(--green)' }}>3.0</div>
              <h2>OEM User Acquisition: Reaching 3B+ Android Users Before the App Store</h2>
              <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>On-Device Discovery</p>
              <div className="ch-desc">Growth teams that ship fastest have moved &ldquo;upstream.&rdquo; By partnering with manufacturers like Samsung, Xiaomi, and Oppo, brands gain direct system-level access to users that traditional ad networks simply cannot replicate.</div>
            </div>
            <img src="/images/oem-entry-screens.png" alt="OEM entry screens showing app discovery on Samsung and Xiaomi devices" style={{ maxWidth: '400px', borderRadius: '16px', display: 'block' }} />
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap"><div className="story rv">
            <div className="story-text rv-l">
              <span className="tag" style={{ color: 'var(--ch3)', borderColor: 'var(--ch3)' }}>Section 3.1</span>
              <h3>Why OEM Ads Outperform Traditional Mobile Advertising</h3>
              <p>OEM ads appear at natural touchpoints: the home screen, lock screen, and within native system apps. They don&apos;t interrupt a user&apos;s session.</p>
              <ul className="blist">
                <li><strong>The Integrated Journey:</strong> OEM ads are woven into the OS fabric, not interrupting sessions.</li>
                <li><strong>The Android Powerhouse:</strong> 70-72% global market share, exceeding 85% in India and Brazil.</li>
              </ul>
              <div className="stat-callout" style={{ borderLeftColor: 'var(--green)' }}>
                <div className="big-num" style={{ color: 'var(--green)' }} data-count="3" data-suffix="B+">0B+</div>
                <div className="stat-body"><h4>Active Android Users</h4><p>Reachable via OEM partners</p></div>
              </div>
            </div>
            <div className="story-chart sticky rv-r">
              <div className="chart-h" style={{ fontSize: '.95rem' }}>iPhone vs Android Market Share</div>
              <div className="chart-sub">2009 — 2024</div>
              <div className="chart-wrap" style={{ height: '300px' }}><MarketShareChart /></div>
            </div>
          </div></div>
        </section>

        {/* OEM Format Table */}
        <section className="sec sec-l">
          <div className="wrap">
            <h3 style={{ fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text)' }} className="rv">OEM Ad Format Comparison</h3>
            <table className="data-table rv">
              <thead><tr><th>Format</th><th>Reach</th><th>Cost Efficiency</th><th>Best Use Case</th></tr></thead>
              <tbody>
                <tr><td><strong>PAI (Play-Auto-Install)</strong></td><td>Very High</td><td><span className="delta pos">&#9650; Best</span></td><td>App launch, first-day strategy</td></tr>
                <tr><td><strong>Icon Placements</strong></td><td>High</td><td><span className="delta pos">&#9650; Excellent</span></td><td>Brand awareness, sustained growth</td></tr>
                <tr><td><strong>Native Splash</strong></td><td>High</td><td><span className="delta pos">&#9650; Very Good</span></td><td>High-intent retargeting</td></tr>
                <tr><td><strong>Smart Push</strong></td><td>Medium-High</td><td><span className="delta pos">&#9650; Good</span></td><td>Re-engagement messaging</td></tr>
              </tbody>
            </table>
            <div className="rv" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '24px' }}>
              {([
                ['/images/oem-format-pai.png', 'PAI (Play-Auto-Install)'],
                ['/images/oem-format-icon.png', 'Icon Placement'],
                ['/images/oem-format-splash.png', 'Native Splash'],
                ['/images/oem-format-push.png', 'Smart Push'],
              ] as [string, string][]).map(([src, label]) => (
                <div key={label} style={{ textAlign: 'center', background: '#f5f7f9', borderRadius: '12px', padding: '16px 12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '280px' }}>
                    <img src={src} alt={`${label} format`} style={{ maxWidth: '100%', maxHeight: '280px', objectFit: 'contain', borderRadius: '8px' }} />
                  </div>
                  <p style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--text)', marginTop: '10px' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OEM Format Radar (Ch3) */}
        <section className="sec sec-w">
          <div className="wrap">
            <div className="chart-card-new rv">
              <h4>OEM Format Comparison</h4>
              <div className="chart-subtitle">Scored across 5 dimensions (out of 10) — PAI leads in reach and brand safety</div>
              <div className="chart-wrap" style={{ height: '300px' }}><OEMFormatChart /></div>
              <div style={{ marginTop: 12, padding: '12px 16px', background: 'var(--bg-alt)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text)' }}>ℹ️ Insight:</strong> PAI (Pre-loaded App Install) scores highest overall — it reaches users at first device setup with zero friction. Push notifications score highest on user intent but lowest on brand safety. Icon Placement offers the best cost efficiency.
              </div>
            </div>
          </div>
        </section>

        {/* 3.3 Sophisticated Targeting */}
        <section className="sec sec-w">
          <div className="wrap rv">
            <span className="tag" style={{ color: 'var(--ch3)', borderColor: 'var(--ch3)' }}>Section 3.3</span>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>OEM Ad Targeting: Moving Beyond Demographics</h3>
            <p style={{ color: '#666', fontSize: '.88rem', marginBottom: '16px', maxWidth: '640px' }}>OEM&apos;s true power lies in hardware-level data depth. Growth teams now look beyond age and gender filters to build a fuller picture of user intent from behavior and purchase signals.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--green)', flexDirection: 'column' }}><div className="ic-icon" style={{ marginBottom: '8px' }}><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg></div><h4>Behavioral &amp; App Category</h4><p>Reach users based on their actual app usage patterns. Surface your game to users who frequently engage with similar genres.</p></div>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--green)', flexDirection: 'column' }}><div className="ic-icon" style={{ marginBottom: '8px' }}><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg></div><h4>Geographic &amp; Device Precision</h4><p>Tailor campaigns to specific device models. Promote flagship titles on premium hardware, utility apps on the broader mid-range market.</p></div>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--green)', flexDirection: 'column' }}><div className="ic-icon" style={{ background: 'var(--purple-l)', marginBottom: '8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--purple)' }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></div><h4>Keyword &amp; Retargeting</h4><p>Capture intent the moment a user searches for a solution, or re-engage users who interacted with your brand but haven&apos;t converted.</p></div>
            </div>
          </div>
        </section>

        {/* 3.4 Cost Advantage */}
        <section className="sec sec-l">
          <div className="wrap rv">
            <span className="insight-badge">Cost Advantage</span>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>OEM Advertising Costs: Lower CPM, Higher ROAS Than Social Platforms</h3>
            <div className="grid-3">
              <div className="stat-callout rv" style={{ flexDirection: 'column', borderLeft: 'none', borderTop: '3px solid var(--green)' }}><div className="big-num" style={{ color: 'var(--green)', fontSize: '1.6rem', marginBottom: '8px' }}>Lower CPM/CPC</div><div className="stat-body"><p style={{ fontSize: '.82rem', lineHeight: 1.7 }}>OEM advertising typically costs less than traditional digital channels, delivering broader reach with less ad spend.</p></div></div>
              <div className="stat-callout rv" style={{ flexDirection: 'column', borderLeft: 'none', borderTop: '3px solid var(--green)' }}><div className="big-num" style={{ color: 'var(--green)', fontSize: '1.6rem', marginBottom: '8px' }}>Reduced Waste</div><div className="stat-body"><p style={{ fontSize: '.82rem', lineHeight: 1.7 }}>Precise targeting eliminates wasted impressions on disinterested audiences. You buy <strong>contextual relevance</strong>, not just reach.</p></div></div>
              <div className="stat-callout rv" style={{ flexDirection: 'column', borderLeft: 'none', borderTop: '3px solid var(--green)' }}><div className="big-num" style={{ color: 'var(--green)', fontSize: '1.6rem', marginBottom: '8px' }}>Uncluttered</div><div className="stat-body"><p style={{ fontSize: '.82rem', lineHeight: 1.7 }}>By stepping outside the noise of crowded ad auctions, brands stand out in an uncluttered system environment and build lasting connections at multiple stages of the user journey.</p></div></div>
            </div>
          </div>
        </section>

        {/* TapNation Case Study — Full Image */}
        <section className="sec sec-w">
          <div className="wrap">
            <a href="https://appsamurai.com/contact-us/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }} onClick={() => trackEvent('cta_click', 'tapnation_case_study', { destination: 'contact' })}>
              <img src="/images/tapnation-case-study.png" alt="TapNation Case Study — Achieved ROAS+ with OEM Strategies: 1.7 Million loyal new users acquired, 116% ROAS" style={{ width: '100%', display: 'block', cursor: 'pointer' }} />
            </a>
          </div>
        </section>

        {/* Chapter 3 FAQ */}
        <FAQ items={OEM_FAQ} chapterColor="var(--green)" />

        {/* CHAPTER 4 */}
        <hr className="divider cyan" />
        <section className="ch-head ch-cyan" id="ch4">
          <div className="wrap rv ch-enter-bottom" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'center' }}>
            <div>
              <span className="ch-bg-num">04</span>
              <div className="ch-num" style={{ color: 'var(--ch4)' }}>4.0</div>
              <h2>Apple Search Ads + ASO: The Demand Capture Flywheel for Mobile Growth</h2>
              <p style={{ fontSize: '.85rem', color: 'rgba(0,244,244,.6)', fontWeight: 500, marginTop: '4px', fontStyle: 'italic' }}>ASA &amp; ASO Synergy</p>
              <div className="ch-desc">In 2026, the App Store is a high-intent search engine where every query is a signal of immediate need. The real &ldquo;growth hack&rdquo; lies in the feedback loop between paid search (ASA) and organic optimization (ASO).</div>
            </div>
            <img src="/images/asa-entry-screens.png" alt="Apple Search Ads interface showing keyword optimization and app rankings" style={{ maxWidth: '400px', borderRadius: '16px', display: 'block' }} />
          </div>
        </section>

        {/* 4.1 Performance-Led Optimization */}
        <section className="sec sec-w">
          <div className="wrap rv">
            <span className="tag" style={{ color: 'var(--ch4)', borderColor: 'var(--ch4)' }}>Section 4.1</span>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Apple Search Ads Optimization: CPA Targeting Beyond Installs</h3>
            <p style={{ color: '#666', fontSize: '.88rem', marginBottom: '16px', maxWidth: '640px' }}>The most successful strategies are rooted in CPA and deep-funnel event optimization.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch4)' }}><div className="ic-icon" style={{ background: 'rgba(0,244,244,.1)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--ch4)' }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div><div><h4>Targeting Registrations, Not Just Installs</h4><p>We optimize campaigns to achieve a target CPA for registrations — ensuring the budget buys active users, not just downloads.</p></div></div>
              <div className="info-card" style={{ margin: 0, borderLeft: '3px solid var(--ch4)' }}><div className="ic-icon" style={{ background: 'rgba(0,244,244,.1)' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--ch4)' }}><path d="M3 3v18h18"/><path d="M7 16l4-6 4 4 5-8"/></svg></div><div><h4>Event-Driven Bidding</h4><p>We prioritize keywords that yield high event conversion rates — tutorial completion, first purchase, profile setup — tying every dollar to long-term LTV.</p></div></div>
            </div>
            <table className="data-table">
              <thead><tr><th>Keyword</th><th>Search Volume</th><th>Competition</th><th>Opportunity</th></tr></thead>
              <tbody>
                <tr><td><strong>puzzle games free</strong></td><td><span className="delta pos">Very High</span></td><td>High</td><td>Brand + Generic</td></tr>
                <tr><td><strong>racing game</strong></td><td><span className="delta pos">High</span></td><td>Medium</td><td>Discovery</td></tr>
                <tr><td><strong>idle tycoon</strong></td><td><span className="delta pos">High</span></td><td>Low</td><td>Competitor Conquest</td></tr>
                <tr><td><strong>match 3 games</strong></td><td><span className="delta pos">High</span></td><td>High</td><td>Brand Defense</td></tr>
                <tr><td><strong>action rpg</strong></td><td><span className="delta pos">Medium</span></td><td>Medium</td><td>Category</td></tr>
                <tr><td><strong>strategy war game</strong></td><td><span className="delta pos">Medium</span></td><td>Low</td><td>Long-tail</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ASA Keyword Strategy Map (Ch4) */}
        <section className="sec sec-w">
          <div className="wrap">
            <div className="chart-card-new rv">
              <h4>ASA Keyword Strategy Map</h4>
              <div className="chart-subtitle">Bubble size = opportunity score. Top-right = highest ROI keywords.</div>
              <div className="chart-wrap" style={{ position: 'relative' }}>
                <ASABubbleChart />
                <div style={{ position: 'absolute', top: 8, right: 12, fontSize: '0.7rem', color: 'var(--green)', fontWeight: 600, opacity: 0.5 }}>Sweet Spot ↗</div>
                <div style={{ position: 'absolute', top: 8, left: 12, fontSize: '0.7rem', color: '#f4cb00', fontWeight: 600, opacity: 0.5 }}>Hidden Gems ↖</div>
                <div style={{ position: 'absolute', bottom: 28, right: 12, fontSize: '0.7rem', color: '#F87171', fontWeight: 600, opacity: 0.5 }}>Budget Burners ↘</div>
                <div style={{ position: 'absolute', bottom: 28, left: 12, fontSize: '0.7rem', color: '#999', fontWeight: 600, opacity: 0.5 }}>Avoid ↙</div>
              </div>
              <div style={{ marginTop: 12, padding: '12px 16px', background: 'var(--bg-alt)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text)' }}>How to read:</strong> Brand keywords (top-right) convert best — high volume with high conversion rates. Long-tail keywords are hidden gems — low competition but high conversion. Generic keywords burn budget — high volume but low conversion. Focus ASA spend on Brand defense and Long-tail capture.
              </div>
            </div>
          </div>
        </section>

        {/* 4.2 Brand Protection */}
        <section className="sec sec-l">
          <div className="wrap rv">
            <span className="tag" style={{ color: 'var(--ch4)', borderColor: 'var(--ch4)' }}>Section 4.2</span>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>Defending Your Brand Keywords on the App Store</h3>
            <p style={{ color: '#666', fontSize: '.88rem', marginBottom: '16px' }}>Your brand name is your most valuable App Store asset. Defending your &ldquo;home turf&rdquo; is non-negotiable.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--ch4)', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px' }}><div className="ic-icon" style={{ background: 'rgba(0,244,244,.1)', margin: '0 auto 8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--ch4)' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><h4>Dominate SOV</h4><p style={{ fontSize: '.82rem' }}>Maximize Share of Voice for your brand keywords. Competitors bidding on your name should never appear above you.</p></div>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--ch4)', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px' }}><div className="ic-icon" style={{ background: 'rgba(0,244,244,.1)', margin: '0 auto 8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--ch4)' }}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></div><h4>Defensive Bidding</h4><p style={{ fontSize: '.82rem' }}>Use Custom Product Pages for specific features or promotions to capture competitor-related search intent.</p></div>
              <div className="info-card" style={{ margin: 0, borderTop: '3px solid var(--ch4)', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px' }}><div className="ic-icon" style={{ background: 'rgba(0,244,244,.1)', margin: '0 auto 8px' }}><svg viewBox="0 0 24 24" style={{ stroke: 'var(--ch4)' }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></div><h4>Conquest Campaigns</h4><p style={{ fontSize: '.82rem' }}>Strategically bid on competitor brand names to capture users actively searching for alternatives in your category.</p></div>
            </div>
          </div>
        </section>

        <section className="sec sec-l">
          <div className="wrap rv">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="info-card rv" style={{ margin: 0, borderTop: '3px solid var(--ch4)', flexDirection: 'column' }}>
                <span className="tag" style={{ color: 'var(--ch4)', borderColor: 'var(--ch4)', marginBottom: '4px' }}>4.3</span>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>The ASA-ASO &ldquo;Halo Effect&rdquo;</h4>
                <ul className="blist" style={{ margin: 0 }}><li><strong>Keyword Intelligence:</strong> ASA acts as the R&amp;D lab for ASO. Winning keywords are integrated into App Store metadata to boost organic rankings.</li><li><strong>Conversion Rate Synergy:</strong> Insights from ASA creative testing — which screenshots drive the highest TTR — iterate on the organic store listing.</li></ul>
              </div>
              <div className="info-card rv" style={{ margin: 0, borderTop: '3px solid var(--ch4)', flexDirection: 'column' }}>
                <span className="tag" style={{ color: 'var(--ch4)', borderColor: 'var(--ch4)', marginBottom: '4px' }}>4.4</span>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Custom Product Pages: Matching Intent</h4>
                <ul className="blist" style={{ margin: 0 }}><li><strong>Intent-Based Visuals:</strong> Users searching competitive keywords land on pages highlighting your competitive edge. Utility searches see efficiency-focused visuals.</li><li><strong>Ad-to-Page Continuity:</strong> This alignment significantly increases conversion rates, as Apple&apos;s algorithm rewards relevance over raw spend with lower CPAs.</li></ul>
              </div>
            </div>
          </div>
        </section>

        <section className="sec sec-w">
          <div className="wrap rv">
            <div style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '32px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '28px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 700, color: 'var(--green)', lineHeight: 1.2, marginBottom: '8px' }}>DSP + OEM<br />+ ASA</div>
                <span className="insight-badge">Cross-Channel</span>
              </div>
              <div>
                <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Cross-Channel UA Strategy: How DSP + OEM + ASA Amplify Each Other</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '.88rem', lineHeight: 1.7 }}>High-impact DSP or OEM campaigns cause brand searches to surge. Increasing your ASA presence during these periods captures 100% of that manufactured demand at the most efficient price point. ASA does not exist in a vacuum&mdash;it is the net that catches the demand your other channels create.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CALCULATOR CTA — "What's Next" after reading all 4 pillars */}
        <section className="sec sec-w rv" id="calculatorTeaser" style={{ padding: '56px 0' }}>
          <div className="wrap">
            <div style={{ background: 'linear-gradient(135deg, #f0fdf6 0%, #e8f5ee 50%, #f0f4ff 100%)', border: '1px solid rgba(38,190,129,.15)', borderRadius: 'var(--r-lg)', padding: '48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
              <div>
                <span className="insight-badge" style={{ marginBottom: '16px', display: 'inline-block' }}>Your Next Step</span>
                <h3 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 800, marginBottom: '12px', color: 'var(--text)', lineHeight: 1.2 }}>
                  You&apos;ve Seen the Strategy.<br />Now Model It for Your App.
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '.92rem', lineHeight: 1.7, marginBottom: '20px', maxWidth: '440px' }}>
                  Combine all 4 pillars — DSP, Rewarded, OEM, and ASA — into a personalized budget allocation with estimated CAC and ROAS projections.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '.75rem', fontWeight: 600, background: 'rgba(38,190,129,.08)', color: 'var(--green)', border: '1px solid rgba(38,190,129,.15)' }}>Programmatic DSP</span>
                  <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '.75rem', fontWeight: 600, background: 'rgba(175,156,255,.08)', color: 'var(--purple)', border: '1px solid rgba(175,156,255,.15)' }}>Rewarded Playtime</span>
                  <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '.75rem', fontWeight: 600, background: 'rgba(85,85,85,.06)', color: '#555', border: '1px solid rgba(85,85,85,.12)' }}>OEM Discovery</span>
                  <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '.75rem', fontWeight: 600, background: 'rgba(0,244,244,.06)', color: '#00b8b8', border: '1px solid rgba(0,244,244,.12)' }}>Apple Search Ads</span>
                </div>
                <a href="/calculator" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '16px 36px', fontSize: '1rem' }}
                   onClick={() => trackEvent('cta_click', 'calculator_teaser', { destination: 'calculator' })}>
                  Open ROI Calculator
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 9h10M10 5l4 4-4 4" /></svg>
                </a>
              </div>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 8px 32px rgba(0,0,0,.06)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px', fontFamily: 'var(--font-h)' }}>Sample Channel Mix</div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Gaming app, $50K/mo, ROAS-focused</div>
                <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div style={{ width: '32%', background: 'var(--green)' }} />
                  <div style={{ width: '34%', background: 'var(--purple)' }} />
                  <div style={{ width: '10%', background: '#555' }} />
                  <div style={{ width: '24%', background: 'var(--cyan)' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} /><span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>DSP 32%</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--purple)', flexShrink: 0 }} /><span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>Rewarded 34%</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#555', flexShrink: 0 }} /><span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>OEM 10%</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--cyan)', flexShrink: 0 }} /><span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>ASA 24%</span></div>
                </div>
                <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-alt)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ textAlign: 'center' }}><div style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--green)' }}>$2.84</div><div style={{ fontSize: '.68rem', color: 'var(--text-faint)' }}>Blended CAC</div></div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--green)' }}>5.2x</div><div style={{ fontSize: '.68rem', color: 'var(--text-faint)' }}>Est. ROAS</div></div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--green)' }}>17.6K</div><div style={{ fontSize: '.68rem', color: 'var(--text-faint)' }}>Est. Installs</div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chapter 4 FAQ */}
        <FAQ items={ASA_FAQ} chapterColor="var(--ch4)" />

        {/* TESTIMONIALS */}
        <section className="sec sec-l" style={{ padding: '56px 0' }}>
          <div className="wrap">
            <div className="toc-label rv">What Our Partners Say</div>
            <h3 className="rv" style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: 700, textAlign: 'center', color: '#222', marginBottom: '36px' }}>Trusted by Growth Teams Worldwide</h3>
            <div className="testimonial-grid rv">
              <div className="testimonial-card">
                <div className="testi-quote">&ldquo;AppSamurai has been a vital partner for Magiclab Studio&apos;s games via their rewarded UA campaigns. Their ability to deliver high-quality users at scale has been instrumental in our growth strategy.&rdquo;</div>
                <div className="testi-author"><img className="testi-avatar" src="/images/mert-ersoz.png" alt="Mert Ersoz" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} /><div><strong>Mert Ersoz</strong><br /><span>Head of Growth, MagicLab</span></div></div>
              </div>
              <div className="testimonial-card">
                <div className="testi-quote">&ldquo;AppSamurai&apos;s strategic programmatic advertising expertise helped SHAHID boost user acquisition and achieve our subscription targets in a highly competitive streaming market.&rdquo;</div>
                <div className="testi-author"><img className="testi-avatar" src="/ali-shahid.png" alt="Ali Aktas" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} /><div><strong>Ali Aktas</strong><br /><span>Head of Performance, Shahid</span></div></div>
              </div>
              <div className="testimonial-card">
                <div className="testi-quote">&ldquo;AppSamurai helped us exceed our CPA and ROAS targets while maintaining user quality across every channel. The bid-level transparency made it possible to cut waste we couldn&apos;t see before.&rdquo;</div>
                <div className="testi-author"><img className="testi-avatar" src="/images/aleyna-cerrah.png" alt="Aleyna Cerrah" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} /><div><strong>Aleyna Cerrah</strong><br /><span>UA Manager, APPS</span></div></div>
              </div>
            </div>
            {/* Success metrics strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px', marginTop: '24px' }} className="rv success-grid">
              {[
                { val: '72.3%', label: 'Purchase Increase', co: 'Beymen', color: 'var(--green)' },
                { val: '4\u00d7', label: 'ROAS KPI Surpassed', co: 'Gram Games', color: 'var(--purple)' },
                { val: '230%', label: 'DAU Increase', co: 'Fitplan', color: 'var(--green)' },
                { val: '107%', label: 'ROAS Achieved', co: 'APPS', color: 'var(--purple)' },
                { val: '46%', label: 'Retention Boost', co: 'Amazon Photos', color: 'var(--green)' },
              ].map((item) => (
                <div key={item.co} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '20px 16px', textAlign: 'center', borderTop: `3px solid ${item.color}` }}>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.6rem', fontWeight: 800, color: item.color }}>{item.val}</div>
                  <div style={{ fontSize: '.78rem', color: '#666', margin: '4px 0' }}>{item.label}</div>
                  <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '.5px' }}>{item.co}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PDF Gate */}
        <section className="gate" style={{ padding: '36px 0' }}>
          <div className="gate-inner rv">
            <div className="gate-icon">&#128196;</div>
            <h2>Download the Full Report as PDF</h2>
            <p>Save the complete 2026 Growth Strategy Guide — all 4 chapters, charts, case studies, and frameworks.</p>
            <div className="gate-form"><input className="gate-input" type="email" placeholder="Enter your work email" /><button className="gate-submit">Download PDF</button></div>
            <div className="gate-note">Instant download. No spam.</div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="about" id="about">
          <div className="wrap"><div className="about-grid">
            <div className="rv">
              <div className="about-tag">About AppSamurai</div>
              <h2>The Growth Platform Built for Mobile</h2>
              <p>AppSamurai is a global mobile growth platform that helps apps scale through AI-powered programmatic advertising, rewarded user acquisition, and OEM on-device discovery.</p>
              <p>Our integrated platform, including the AppsPrize rewards system, helps growth teams acquire high-value users, improve retention, and grow lifetime value at every stage of the funnel.</p>
              <div className="about-stats">
                <div><strong>10,000+</strong><span>Campaigns Managed</span></div>
                <div><strong>3B+</strong><span>Users Reached</span></div>
                <div><strong>50+</strong><span>Countries</span></div>
              </div>
            </div>
            <div className="rv-r">
              <div className="pillar-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <a href="https://appsamurai.com/dsp/" target="_blank" rel="noopener noreferrer" className="pillar" style={{ textDecoration: 'none', color: 'inherit' }}><div className="pillar-icon">&#128640;</div><h4>DSP</h4><p>AI-Powered Programmatic</p></a>
                <a href="https://appsamurai.com/gaming/" target="_blank" rel="noopener noreferrer" className="pillar" style={{ textDecoration: 'none', color: 'inherit' }}><div className="pillar-icon">&#129689;</div><h4>Rewarded</h4><p>Playtime &amp; Offerwalls</p></a>
                <a href="https://appsamurai.com/oem/" target="_blank" rel="noopener noreferrer" className="pillar" style={{ textDecoration: 'none', color: 'inherit' }}><div className="pillar-icon">&#128241;</div><h4>OEM</h4><p>On-Device Discovery</p></a>
                <a href="https://appsamurai.com/appsprize-monetization/" target="_blank" rel="noopener noreferrer" className="pillar" style={{ textDecoration: 'none', color: 'inherit' }}><div className="pillar-icon">&#127942;</div><h4>AppsPrize</h4><p>Publisher Monetization</p></a>
              </div>
            </div>
          </div></div>
        </section>

        {/* FINAL CTA */}
        <section className="sec sec-w" style={{ textAlign: 'center' }}>
          <div className="wrap">
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>
              Ready to Put This Playbook Into Action?
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto 24px', lineHeight: 1.7 }}>
              Our growth team has helped 500+ apps scale with the exact strategies in this playbook. Let&apos;s build your custom growth plan.
            </p>
            <a href="https://appsamurai.com/contact" target="_blank" rel="noopener noreferrer"
               className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', fontSize: '1rem', padding: '16px 40px' }}
               onClick={() => trackEvent('cta_click', 'final_cta', { destination: 'contact' })}>
              Talk to Our Growth Team &rarr;
            </a>
          </div>
        </section>

        <RelatedEbooks currentSlug="growth-playbook" />

      </div>{/* END gatedContent */}

      <Footer />

      <LeadBar
        onCtaClick={() => { trackEvent('cta_click', 'lead_bar', { destination: 'gate' }); scrollTo('emailGate'); }}
      />
    </>
  );
}
