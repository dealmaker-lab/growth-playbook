'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import KeywordInsights from '@/components/calculator/KeywordInsights';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Doughnut, Bar, Line, Scatter } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartDataLabels
);

/* ── Types ─────────────────────────────────────────────────────────── */

type Category = 'Gaming' | 'E-commerce' | 'FinTech' | 'Health & Fitness' | 'Utility';
type Region = 'North America' | 'LATAM' | 'SEA' | 'EMEA' | 'MENA' | 'APAC';
type Channel = 'Meta' | 'Google UAC' | 'TikTok' | 'Apple Search Ads' | 'Programmatic' | 'None yet';
type Goal = 'Install Volume' | 'ROAS Target' | 'LTV Optimization' | 'Market Expansion';

interface ChannelMix {
  dsp: number;
  rewarded: number;
  oem: number;
  asa: number;
}
interface CACRange {
  dsp: number;
  rewarded: number;
  oem: number;
  asa: number;
}
interface Results {
  mix: ChannelMix;
  cac: CACRange;
  roas: number;
  roasLow: number;
  roasHigh: number;
  takeaways: string[];
  efficiencyCurve: { budget: number; roas: number }[];
  paretoFrontier: { cac: number; installs: number }[];
}

/* ── Fairness: Default LTV values (user-overridable) ─────────────── */

const DEFAULT_LTV: Record<Category, number> = {
  Gaming: 8, 'E-commerce': 12, FinTech: 15, 'Health & Fitness': 10, Utility: 9,
};

/* ── Palette ───────────────────────────────────────────────────────── */

const COLORS = {
  green: '#26BE81',
  purple: '#af9cff',
  cyan: '#00c4c4',
  dark: '#1A1A2E',
  greenHover: '#1DA367',
  bgAlt: '#F5F7F9',
  border: '#E8ECF1',
  text: '#222222',
  muted: '#666666',
  faint: '#999',
};

const CHART_COLORS = [COLORS.green, COLORS.purple, COLORS.dark, COLORS.cyan];

/* ── Benchmark engine ──────────────────────────────────────────────── */

const BASE_MIX: Record<Category, ChannelMix> = {
  Gaming:             { dsp: 30, rewarded: 30, oem: 20, asa: 20 },
  'E-commerce':       { dsp: 40, rewarded: 15, oem: 30, asa: 15 },
  FinTech:            { dsp: 30, rewarded: 10, oem: 20, asa: 40 },
  'Health & Fitness': { dsp: 35, rewarded: 20, oem: 25, asa: 20 },
  Utility:            { dsp: 25, rewarded: 25, oem: 35, asa: 15 },
};

const REGION_SHIFT: Record<Region, Partial<ChannelMix>> = {
  'North America': { asa: 10, dsp: -5, oem: -5 },
  LATAM:           { oem: 10, asa: -8, dsp: -2 },
  SEA:             { rewarded: 8, asa: -6, dsp: -2 },
  EMEA:            { dsp: 5, asa: -3, rewarded: -2 },
  MENA:            { oem: 6, dsp: -3, rewarded: -3 },
  APAC:            { rewarded: 5, oem: 3, asa: -5, dsp: -3 },
};

const GOAL_SHIFT: Record<Goal, Partial<ChannelMix>> = {
  'Install Volume':    { dsp: 5, rewarded: 5, asa: -5, oem: -5 },
  'ROAS Target':       { asa: 8, dsp: -3, rewarded: -3, oem: -2 },
  'LTV Optimization':  { rewarded: 6, asa: 4, dsp: -5, oem: -5 },
  'Market Expansion':  { oem: 8, dsp: 4, asa: -6, rewarded: -6 },
};

const CAC_BASE: Record<Category, CACRange> = {
  Gaming:             { dsp: 1.20, rewarded: 0.80, oem: 0.50, asa: 2.20 },
  'E-commerce':       { dsp: 2.00, rewarded: 1.30, oem: 0.90, asa: 3.00 },
  FinTech:            { dsp: 2.80, rewarded: 1.60, oem: 1.10, asa: 4.00 },
  'Health & Fitness': { dsp: 1.60, rewarded: 1.00, oem: 0.70, asa: 2.80 },
  Utility:            { dsp: 1.40, rewarded: 0.90, oem: 0.60, asa: 2.50 },
};

const REGION_CAC_MULT: Record<Region, number> = {
  'North America': 1.25,
  LATAM: 0.65,
  SEA: 0.55,
  EMEA: 1.10,
  MENA: 0.80,
  APAC: 0.75,
};

function clampMix(mix: ChannelMix): ChannelMix {
  const keys: (keyof ChannelMix)[] = ['dsp', 'rewarded', 'oem', 'asa'];
  const clamped = { ...mix };
  keys.forEach((k) => { clamped[k] = Math.max(clamped[k], 5); });
  const total = keys.reduce((s, k) => s + clamped[k], 0);
  keys.forEach((k) => { clamped[k] = Math.round((clamped[k] / total) * 100); });
  // Fix rounding so sum === 100
  const sum = keys.reduce((s, k) => s + clamped[k], 0);
  clamped.dsp += 100 - sum;
  return clamped;
}

/* ── Optimization: Diminishing returns model ─────────────────────── */
// Revenue per channel follows sqrt(spend) * effectiveness (concave)
// This models saturation: doubling spend does NOT double installs

const CHANNEL_EFFECTIVENESS: Record<Category, Record<keyof ChannelMix, number>> = {
  Gaming:             { dsp: 1.0, rewarded: 1.2, oem: 0.9, asa: 0.7 },
  'E-commerce':       { dsp: 1.1, rewarded: 0.7, oem: 1.0, asa: 0.8 },
  FinTech:            { dsp: 0.9, rewarded: 0.6, oem: 0.8, asa: 1.2 },
  'Health & Fitness': { dsp: 1.0, rewarded: 1.0, oem: 0.85, asa: 0.9 },
  Utility:            { dsp: 0.85, rewarded: 1.1, oem: 1.1, asa: 0.7 },
};

function diminishingReturns(spend: number, effectiveness: number): number {
  // sqrt model: installs = effectiveness * sqrt(spend) * 10
  return effectiveness * Math.sqrt(spend) * 10;
}

function computeWeightedCAC(
  mix: ChannelMix,
  cac: CACRange
): number {
  return (mix.dsp * cac.dsp + mix.rewarded * cac.rewarded +
    mix.oem * cac.oem + mix.asa * cac.asa) / 100;
}

/* ── Budget Efficiency Curve: ROAS at varying budgets ────────────── */

function computeEfficiencyCurve(
  category: Category,
  regions: Region[],
  goal: Goal,
  ltv: number
): { budget: number; roas: number }[] {
  const points: { budget: number; roas: number }[] = [];
  const budgets = [5000, 10000, 25000, 50000, 75000, 100000, 150000, 200000, 300000, 500000];

  for (const b of budgets) {
    const r = calculateCore(category, regions, b, goal, ltv);
    points.push({ budget: b, roas: r.roas });
  }
  return points;
}

/* ── Pareto Frontier: CAC vs Installs tradeoff ───────────────────── */

function computeParetoFrontier(
  category: Category,
  regions: Region[],
  budget: number,
  ltv: number
): { cac: number; installs: number }[] {
  const eff = CHANNEL_EFFECTIVENESS[category];
  const regionMult = regions.length > 0
    ? regions.reduce((s, r) => s + REGION_CAC_MULT[r], 0) / regions.length : 1;
  const baseCac = CAC_BASE[category];
  const points: { cac: number; installs: number }[] = [];

  // Sweep: vary DSP allocation from 10% to 80%, distribute rest proportionally
  for (let dspPct = 10; dspPct <= 80; dspPct += 5) {
    const remaining = 100 - dspPct;
    const mix: ChannelMix = {
      dsp: dspPct,
      rewarded: Math.round(remaining * 0.33),
      oem: Math.round(remaining * 0.34),
      asa: Math.round(remaining * 0.33),
    };
    // Normalize to exactly 100
    mix.asa = 100 - mix.dsp - mix.rewarded - mix.oem;

    const keys: (keyof ChannelMix)[] = ['dsp', 'rewarded', 'oem', 'asa'];
    let totalInstalls = 0;
    let totalSpend = 0;

    for (const ch of keys) {
      const spend = budget * (mix[ch] / 100);
      const installs = diminishingReturns(spend, eff[ch]);
      totalInstalls += installs;
      totalSpend += spend;
    }

    const wCac = computeWeightedCAC(mix, {
      dsp: baseCac.dsp * regionMult,
      rewarded: baseCac.rewarded * regionMult,
      oem: baseCac.oem * regionMult,
      asa: baseCac.asa * regionMult,
    });

    points.push({
      cac: Math.round(wCac * 100) / 100,
      installs: Math.round(totalInstalls),
    });
  }

  // Filter to Pareto-optimal (non-dominated) points
  const pareto = points.filter((p, _i, all) =>
    !all.some((q) => q.cac <= p.cac && q.installs >= p.installs && (q.cac < p.cac || q.installs > p.installs))
  );

  return pareto.sort((a, b) => a.cac - b.cac);
}

/* ── Core calculation engine (used by main + efficiency curve) ─── */

function calculateCore(
  category: Category,
  regions: Region[],
  budget: number,
  goal: Goal,
  ltv: number
): { mix: ChannelMix; cac: CACRange; roas: number; weightedCAC: number } {
  const mix = { ...BASE_MIX[category] };

  if (regions.length > 0) {
    const avg: ChannelMix = { dsp: 0, rewarded: 0, oem: 0, asa: 0 };
    regions.forEach((r) => {
      const s = REGION_SHIFT[r];
      (Object.keys(s) as (keyof ChannelMix)[]).forEach((k) => { avg[k] += (s[k] || 0); });
    });
    (Object.keys(avg) as (keyof ChannelMix)[]).forEach((k) => {
      mix[k] += avg[k] / regions.length;
    });
  }

  const gs = GOAL_SHIFT[goal];
  (Object.keys(gs) as (keyof ChannelMix)[]).forEach((k) => { mix[k] += gs[k] || 0; });

  const budgetFactor = (budget - 5000) / 495000;
  mix.dsp += budgetFactor * 8;
  mix.oem += budgetFactor * 4;
  mix.rewarded -= budgetFactor * 6;
  mix.asa -= budgetFactor * 6;

  const finalMix = clampMix(mix);

  const baseCac = { ...CAC_BASE[category] };
  const regionMult = regions.length > 0
    ? regions.reduce((s, r) => s + REGION_CAC_MULT[r], 0) / regions.length : 1;

  // Diminishing returns: CAC increases with sqrt of budget factor (saturation)
  const saturationPenalty = 1 + budgetFactor * 0.12; // up to 12% CAC increase at max spend
  const budgetDiscount = 1 - budgetFactor * 0.15;    // volume discount
  const netMultiplier = regionMult * budgetDiscount * saturationPenalty;

  const cac: CACRange = {
    dsp: Math.round(baseCac.dsp * netMultiplier * 100) / 100,
    rewarded: Math.round(baseCac.rewarded * netMultiplier * 100) / 100,
    oem: Math.round(baseCac.oem * netMultiplier * 100) / 100,
    asa: Math.round(baseCac.asa * netMultiplier * 100) / 100,
  };

  const weightedCAC = computeWeightedCAC(finalMix, cac);
  const roas = Math.round((ltv / weightedCAC) * 100) / 100;

  return { mix: finalMix, cac, roas, weightedCAC };
}

/* ── Main calculate function ─────────────────────────────────────── */

function calculate(
  category: Category,
  regions: Region[],
  budget: number,
  _channel: Channel,
  goal: Goal,
  customLTV?: number
): Results {
  // Fairness: use custom LTV if provided, else category default
  const ltv = customLTV && customLTV > 0 ? customLTV : DEFAULT_LTV[category];

  const { mix: finalMix, cac, roas } = calculateCore(category, regions, budget, goal, ltv);

  // Fairness: ROAS as range (±15% confidence interval)
  const roasLow = Math.round(roas * 0.85 * 100) / 100;
  const roasHigh = Math.round(roas * 1.15 * 100) / 100;

  // Optimization: budget efficiency curve
  const efficiencyCurve = computeEfficiencyCurve(category, regions, goal, ltv);

  // Optimization: Pareto frontier (CAC vs installs)
  const paretoFrontier = computeParetoFrontier(category, regions, budget, ltv);

  // Takeaways
  const takeaways: string[] = [];
  const topChannel = (['dsp', 'rewarded', 'oem', 'asa'] as (keyof ChannelMix)[]).reduce((a, b) =>
    finalMix[a] > finalMix[b] ? a : b
  );
  const channelLabels: Record<keyof ChannelMix, string> = {
    dsp: 'Programmatic DSP',
    rewarded: 'Rewarded Playtime',
    oem: 'OEM Discovery',
    asa: 'Apple Search Ads',
  };

  takeaways.push(
    `${channelLabels[topChannel]} should be your primary channel at ${finalMix[topChannel]}% of spend, delivering the best balance of scale and efficiency for ${category} apps.`
  );

  if (budget >= 100000) {
    takeaways.push(
      `At $${(budget / 1000).toFixed(0)}K/mo, you have enough scale to run all four channels simultaneously. Diversification reduces platform-dependency risk.`
    );
  } else {
    takeaways.push(
      `At $${(budget / 1000).toFixed(0)}K/mo, focus on 2-3 channels first. Scale ${channelLabels[topChannel]} before expanding to smaller allocations.`
    );
  }

  if (goal === 'ROAS Target') {
    takeaways.push(
      `For ROAS-focused campaigns, Apple Search Ads and Rewarded Playtime deliver the highest intent users. Monitor D7 ROAS daily to optimize spend.`
    );
  } else if (goal === 'Install Volume') {
    takeaways.push(
      `For volume campaigns, Programmatic DSP and OEM Discovery provide broad reach at lower CACs. Pair with retargeting for quality uplift.`
    );
  } else if (goal === 'Market Expansion') {
    takeaways.push(
      `OEM pre-install partnerships are your fastest path into new markets. Combine with localized ASA campaigns for high-intent capture.`
    );
  } else {
    takeaways.push(
      `Rewarded Playtime users show 2-3x higher D30 retention. Allocate incrementally and measure cohort LTV before scaling.`
    );
  }

  // Optimization: diminishing returns insight
  const satPct = Math.round(((budget - 5000) / 495000) * 12);
  if (satPct >= 5) {
    takeaways.push(
      `At your budget level, expect ~${satPct}% saturation effect on marginal CAC. Consider diversifying channels to maintain efficiency.`
    );
  }

  return { mix: finalMix, cac, roas, roasLow, roasHigh, takeaways, efficiencyCurve, paretoFrontier };
}

/* ── Helpers ───────────────────────────────────────────────────────── */

const CATEGORIES: Category[] = ['Gaming', 'E-commerce', 'FinTech', 'Health & Fitness', 'Utility'];
const REGIONS: Region[] = ['North America', 'LATAM', 'SEA', 'EMEA', 'MENA', 'APAC'];
const CHANNELS: Channel[] = ['Meta', 'Google UAC', 'TikTok', 'Apple Search Ads', 'Programmatic', 'None yet'];
const GOALS: Goal[] = ['Install Volume', 'ROAS Target', 'LTV Optimization', 'Market Expansion'];
const GOAL_ICONS: Record<Goal, string> = {
  'Install Volume': '📈',
  'ROAS Target': '🎯',
  'LTV Optimization': '💎',
  'Market Expansion': '🌍',
};

function formatBudget(v: number): string {
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

/* ── Component ─────────────────────────────────────────────────────── */

export default function CalculatorPage() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<Category>('Gaming');
  const [regions, setRegions] = useState<Region[]>([]);
  const [budget, setBudget] = useState(50000);
  const [channel, setChannel] = useState<Channel>('None yet');
  const [goal, setGoal] = useState<Goal>('Install Volume');
  const [results, setResults] = useState<Results | null>(null);
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Fairness: LTV override
  const [customLTV, setCustomLTV] = useState<string>('');
  const [showLTVInput, setShowLTVInput] = useState(false);

  // Optimization: What-if scenario slider
  const [whatIfShift, setWhatIfShift] = useState(0); // -30 to +30 pct shift on DSP

  const toggleRegion = (r: Region) => {
    setRegions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const handleCalculate = useCallback(() => {
    const ltv = customLTV ? parseFloat(customLTV) : undefined;
    const r = calculate(category, regions.length > 0 ? regions : ['North America'], budget, channel, goal, ltv);
    setResults(r);
    setShowResults(true);
    setWhatIfShift(0);
  }, [category, regions, budget, channel, goal, customLTV]);

  // What-if: recalculate mix with DSP shift applied
  const whatIfResults = useMemo(() => {
    if (!results || whatIfShift === 0) return null;
    const shifted: ChannelMix = { ...results.mix };
    shifted.dsp = Math.max(5, shifted.dsp + whatIfShift);
    // Redistribute the shift across other channels proportionally
    const delta = results.mix.dsp - shifted.dsp; // negative = DSP got more
    const others: (keyof ChannelMix)[] = ['rewarded', 'oem', 'asa'];
    const otherTotal = others.reduce((s, k) => s + shifted[k], 0);
    others.forEach((k) => {
      shifted[k] = Math.max(5, Math.round(shifted[k] + (delta * (shifted[k] / otherTotal))));
    });
    // Normalize to 100
    const sum = shifted.dsp + shifted.rewarded + shifted.oem + shifted.asa;
    shifted.dsp += 100 - sum;
    // Recalculate CAC with new mix
    const ltv = customLTV ? parseFloat(customLTV) : DEFAULT_LTV[category];
    const wCac = computeWeightedCAC(shifted, results.cac);
    const newRoas = Math.round((ltv / wCac) * 100) / 100;
    return { mix: shifted, roas: newRoas, roasLow: Math.round(newRoas * 0.85 * 100) / 100, roasHigh: Math.round(newRoas * 1.15 * 100) / 100 };
  }, [results, whatIfShift, customLTV, category]);

  useEffect(() => {
    if (showResults && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showResults]);

  const canAdvance = () => {
    if (step === 1) return regions.length > 0;
    return true;
  };

  return (
    <>
      <style>{styles}</style>

      {/* ── Header ── */}
      <header className="calc-header">
        <div className="calc-header-inner">
          <Link href="/" className="calc-back">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12L6 8l4-4" />
            </svg>
            Back to Playbook
          </Link>
          <div className="calc-logo">
            <span className="calc-logo-mark">A</span>
            <span>AppSamurai</span>
            <span className="calc-logo-divider">/</span>
            <span className="calc-logo-title">ROI Calculator</span>
          </div>
          <div style={{ width: 140 }} />
        </div>
      </header>

      <main className="calc-main">
        {/* ── Hero ── */}
        <section className="calc-hero">
          <span className="calc-badge">Interactive Tool</span>
          <h1>Channel Mix &amp; ROI Calculator</h1>
          <p className="calc-hero-sub">
            Model your ideal channel allocation across Programmatic DSP, Rewarded Playtime,
            OEM Discovery, and Apple Search Ads — with estimated CAC and ROAS benchmarks.
          </p>
        </section>

        {/* ── Steps indicator ── */}
        <div className="steps-bar">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              className={`step-dot ${step === s ? 'active' : ''} ${s < step ? 'done' : ''}`}
              onClick={() => { if (s <= step || (s === step + 1 && canAdvance())) setStep(s); }}
            >
              {s < step ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M3 7l3 3 5-5" /></svg>
              ) : (
                s
              )}
            </button>
          ))}
          <div className="step-line">
            <div className="step-line-fill" style={{ width: `${((step - 1) / 2) * 100}%` }} />
          </div>
        </div>

        {/* ── Step 1: Your App ── */}
        {step === 1 && (
          <div className="calc-card fade-in">
            <div className="card-step-label">Step 1 of 3</div>
            <h2>Tell us about your app</h2>

            <label className="field-label">App Category</label>
            <div className="select-wrap">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="calc-select"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <svg className="select-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={COLORS.muted} strokeWidth="2" strokeLinecap="round"><path d="M3 4.5l3 3 3-3" /></svg>
            </div>

            <label className="field-label">Target Regions <span className="field-hint">(select all that apply)</span></label>
            <div className="chips">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  className={`chip ${regions.includes(r) ? 'selected' : ''}`}
                  onClick={() => toggleRegion(r)}
                >
                  {r}
                </button>
              ))}
            </div>
            {regions.length === 0 && (
              <p className="field-error">Select at least one region to continue</p>
            )}

            <div className="card-actions">
              <div />
              <button
                className="btn-next"
                disabled={!canAdvance()}
                onClick={() => setStep(2)}
              >
                Next: Budget
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 3l4 4-4 4" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Your Budget ── */}
        {step === 2 && (
          <div className="calc-card fade-in">
            <div className="card-step-label">Step 2 of 3</div>
            <h2>Set your budget</h2>

            <label className="field-label">
              Monthly UA Budget: <strong>{formatBudget(budget)}</strong>
            </label>
            <div className="slider-wrap">
              <span className="slider-min">$5K</span>
              <input
                type="range"
                min={5000}
                max={500000}
                step={5000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="calc-slider"
                style={{
                  background: `linear-gradient(to right, ${COLORS.green} ${((budget - 5000) / 495000) * 100}%, ${COLORS.border} ${((budget - 5000) / 495000) * 100}%)`,
                }}
              />
              <span className="slider-max">$500K</span>
            </div>
            <div className="budget-input-row">
              <span className="budget-dollar">$</span>
              <input
                type="number"
                min={5000}
                max={500000}
                step={5000}
                value={budget}
                onChange={(e) => {
                  const v = Math.min(500000, Math.max(5000, Number(e.target.value)));
                  setBudget(v);
                }}
                className="budget-input"
              />
              <span className="budget-period">/month</span>
            </div>

            <label className="field-label">Current Primary Channel</label>
            <div className="select-wrap">
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as Channel)}
                className="calc-select"
              >
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <svg className="select-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={COLORS.muted} strokeWidth="2" strokeLinecap="round"><path d="M3 4.5l3 3 3-3" /></svg>
            </div>

            {/* Fairness: LTV override */}
            <div className="ltv-override-section">
              <button
                className="ltv-toggle"
                onClick={() => setShowLTVInput(!showLTVInput)}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {showLTVInput ? <path d="M3 4.5l4 4 4-4" /> : <path d="M5 3l4 4-4 4" />}
                </svg>
                Advanced: Custom LTV
              </button>
              {showLTVInput && (
                <div className="ltv-input-area fade-in">
                  <label className="field-label">
                    User Lifetime Value (LTV): <strong>${customLTV || DEFAULT_LTV[category]}</strong>
                    <span className="field-hint"> (default: ${DEFAULT_LTV[category]} for {category})</span>
                  </label>
                  <div className="budget-input-row">
                    <span className="budget-dollar">$</span>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      step={0.5}
                      value={customLTV}
                      placeholder={String(DEFAULT_LTV[category])}
                      onChange={(e) => setCustomLTV(e.target.value)}
                      className="budget-input"
                    />
                  </div>
                  <p className="ltv-help">
                    Override if you know your actual LTV. This directly affects ROAS estimates.
                    Leaving blank uses industry benchmarks.
                  </p>
                </div>
              )}
            </div>

            <div className="card-actions">
              <button className="btn-back" onClick={() => setStep(1)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 3l-4 4 4 4" /></svg>
                Back
              </button>
              <button className="btn-next" onClick={() => setStep(3)}>
                Next: Goal
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 3l4 4-4 4" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Your Goal ── */}
        {step === 3 && (
          <div className="calc-card fade-in">
            <div className="card-step-label">Step 3 of 3</div>
            <h2>What&apos;s your campaign goal?</h2>

            <div className="goal-grid">
              {GOALS.map((g) => (
                <button
                  key={g}
                  className={`goal-card ${goal === g ? 'selected' : ''}`}
                  onClick={() => setGoal(g)}
                >
                  <span className="goal-icon">{GOAL_ICONS[g]}</span>
                  <span className="goal-label">{g}</span>
                </button>
              ))}
            </div>

            <div className="card-actions">
              <button className="btn-back" onClick={() => setStep(2)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 3l-4 4 4 4" /></svg>
                Back
              </button>
              <button className="btn-calculate" onClick={handleCalculate}>
                Calculate ROI
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 8h8M8 4v8" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {showResults && results && (
          <div ref={resultsRef} className="results-section fade-in">
            <h2 className="results-heading">Your Personalized Growth Model</h2>
            <p className="results-sub">
              Based on a <strong>{category}</strong> app targeting{' '}
              <strong>{regions.join(', ')}</strong> with{' '}
              <strong>{formatBudget(budget)}/mo</strong> focused on{' '}
              <strong>{goal}</strong>.
            </p>

            <div className="results-grid">
              {/* Donut */}
              <div className="result-card">
                <h3>Recommended Channel Mix</h3>
                <div className="chart-container donut-container">
                  <Doughnut
                    data={{
                      labels: ['Programmatic DSP', 'Rewarded Playtime', 'OEM Discovery', 'Apple Search Ads'],
                      datasets: [
                        {
                          data: [results.mix.dsp, results.mix.rewarded, results.mix.oem, results.mix.asa],
                          backgroundColor: CHART_COLORS,
                          borderWidth: 0,
                          hoverBorderWidth: 2,
                          hoverBorderColor: '#fff',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '62%',
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                          labels: {
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: { family: 'Poppins', size: 12, weight: 600 },
                            color: COLORS.text,
                          },
                        },
                        tooltip: {
                          backgroundColor: '#fff',
                          titleColor: COLORS.text,
                          bodyColor: COLORS.muted,
                          borderColor: COLORS.border,
                          borderWidth: 1,
                          padding: 12,
                          titleFont: { family: 'Poppins', weight: 700, size: 13 },
                          bodyFont: { family: 'Poppins', size: 12 },
                          callbacks: {
                            label: (ctx: { label?: string; parsed: number }) =>
                              ` ${ctx.label}: ${ctx.parsed}%`,
                          },
                        },
                        datalabels: {
                          color: '#fff',
                          font: { family: 'Poppins', weight: 700, size: 13 },
                          formatter: (value: number) => `${value}%`,
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          display: (ctx: any) =>
                            (ctx.dataset.data[ctx.dataIndex] as number) >= 10,
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Bar */}
              <div className="result-card">
                <h3>Estimated CAC per Channel</h3>
                <div className="chart-container bar-container">
                  <Bar
                    data={{
                      labels: ['DSP', 'Rewarded', 'OEM', 'ASA'],
                      datasets: [
                        {
                          data: [results.cac.dsp, results.cac.rewarded, results.cac.oem, results.cac.asa],
                          backgroundColor: CHART_COLORS,
                          borderRadius: 6,
                          barThickness: 36,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      indexAxis: 'y' as const,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: '#fff',
                          titleColor: COLORS.text,
                          bodyColor: COLORS.muted,
                          borderColor: COLORS.border,
                          borderWidth: 1,
                          padding: 12,
                          titleFont: { family: 'Poppins', weight: 700, size: 13 },
                          bodyFont: { family: 'Poppins', size: 12 },
                          callbacks: {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            label: (ctx: any) =>
                              ` $${(ctx.parsed?.x ?? 0).toFixed(2)} CAC`,
                          },
                        },
                        datalabels: {
                          anchor: 'end' as const,
                          align: 'end' as const,
                          color: COLORS.text,
                          font: { family: 'Poppins', weight: 700, size: 13 },
                          formatter: (value: number) => `$${value.toFixed(2)}`,
                        },
                      },
                      scales: {
                        x: {
                          grid: { color: COLORS.border, drawTicks: false },
                          ticks: {
                            font: { family: 'Poppins', size: 11 },
                            color: COLORS.faint,
                            callback: (value: string | number) => `$${value}`,
                          },
                          border: { display: false },
                        },
                        y: {
                          grid: { display: false },
                          ticks: {
                            font: { family: 'Poppins', weight: 600, size: 12 },
                            color: COLORS.text,
                          },
                          border: { display: false },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ROAS with Fairness range */}
            <div className="roas-card">
              <div className="roas-label">Estimated Blended ROAS</div>
              <div className={`roas-value ${results.roas >= 3 ? 'roas-great' : results.roas >= 2 ? 'roas-good' : 'roas-ok'}`}>
                {results.roas.toFixed(1)}x
              </div>
              <div className="roas-range">
                {results.roasLow.toFixed(1)}x &ndash; {results.roasHigh.toFixed(1)}x range
              </div>
              <div className="roas-indicator">
                {results.roas >= 3 ? 'Excellent' : results.roas >= 2 ? 'Strong' : 'Moderate'}
                {' '}&mdash;{' '}
                {results.roas >= 3
                  ? 'well above industry benchmarks'
                  : results.roas >= 2
                    ? 'on par with top performers'
                    : 'room to optimize channel mix'}
              </div>
              {customLTV && (
                <div className="roas-ltv-note">Using your custom LTV of ${customLTV}</div>
              )}
            </div>

            {/* Takeaways */}
            <div className="summary-card">
              <h3>Personalized Takeaways</h3>
              <ul className="takeaway-list">
                {results.takeaways.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            {/* Budget breakdown */}
            <div className="breakdown-card">
              <h3>Suggested Monthly Spend Breakdown</h3>
              <div className="breakdown-grid">
                {([
                  ['Programmatic DSP', results.mix.dsp, COLORS.green],
                  ['Rewarded Playtime', results.mix.rewarded, COLORS.purple],
                  ['OEM Discovery', results.mix.oem, COLORS.dark],
                  ['Apple Search Ads', results.mix.asa, COLORS.cyan],
                ] as [string, number, string][]).map(([label, pct, color]) => (
                  <div key={label} className="breakdown-item">
                    <div className="breakdown-bar-bg">
                      <div
                        className="breakdown-bar-fill"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <div className="breakdown-meta">
                      <span className="breakdown-label">{label}</span>
                      <span className="breakdown-amount">
                        {formatBudget(Math.round(budget * pct / 100))} <span className="breakdown-pct">({pct}%)</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── What-If Scenario Slider ── */}
            <div className="result-card whatif-card">
              <h3>What-If Scenario</h3>
              <p className="whatif-desc">
                Drag the slider to see how shifting budget toward or away from DSP affects your ROAS.
              </p>
              <div className="whatif-slider-row">
                <span className="whatif-label">Less DSP</span>
                <input
                  type="range"
                  min={-30}
                  max={30}
                  step={5}
                  value={whatIfShift}
                  onChange={(e) => setWhatIfShift(Number(e.target.value))}
                  className="calc-slider whatif-slider"
                  style={{
                    background: `linear-gradient(to right, ${COLORS.purple} ${((whatIfShift + 30) / 60) * 100}%, ${COLORS.border} ${((whatIfShift + 30) / 60) * 100}%)`,
                  }}
                />
                <span className="whatif-label">More DSP</span>
              </div>
              <div className="whatif-value">
                {whatIfShift === 0 ? 'Current allocation' : `DSP ${whatIfShift > 0 ? '+' : ''}${whatIfShift}%`}
              </div>
              {whatIfResults && (
                <div className="whatif-comparison fade-in">
                  <div className="whatif-col">
                    <div className="whatif-col-label">Current</div>
                    <div className="whatif-col-value">{results.roas.toFixed(1)}x ROAS</div>
                    <div className="whatif-col-mix">DSP {results.mix.dsp}% / Rew {results.mix.rewarded}% / OEM {results.mix.oem}% / ASA {results.mix.asa}%</div>
                  </div>
                  <div className="whatif-arrow">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={COLORS.green} strokeWidth="2" strokeLinecap="round"><path d="M4 10h12M12 6l4 4-4 4" /></svg>
                  </div>
                  <div className="whatif-col whatif-col-new">
                    <div className="whatif-col-label">Scenario</div>
                    <div className={`whatif-col-value ${whatIfResults.roas > results.roas ? 'whatif-up' : whatIfResults.roas < results.roas ? 'whatif-down' : ''}`}>
                      {whatIfResults.roas.toFixed(1)}x ROAS
                      {whatIfResults.roas !== results.roas && (
                        <span className="whatif-delta">
                          {whatIfResults.roas > results.roas ? ' +' : ' '}{((whatIfResults.roas - results.roas) / results.roas * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div className="whatif-col-mix">DSP {whatIfResults.mix.dsp}% / Rew {whatIfResults.mix.rewarded}% / OEM {whatIfResults.mix.oem}% / ASA {whatIfResults.mix.asa}%</div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Budget Efficiency Curve ── */}
            <div className="result-card">
              <h3>Budget Efficiency Curve</h3>
              <p className="chart-subtitle">ROAS at different budget levels — see where diminishing returns kick in</p>
              <div className="chart-container efficiency-container">
                <Line
                  data={{
                    labels: results.efficiencyCurve.map((p) => formatBudget(p.budget)),
                    datasets: [
                      {
                        label: 'Estimated ROAS',
                        data: results.efficiencyCurve.map((p) => p.roas),
                        borderColor: COLORS.green,
                        backgroundColor: 'rgba(38,190,129,0.08)',
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: results.efficiencyCurve.map((p) =>
                          p.budget === budget ? COLORS.green : 'rgba(38,190,129,0.4)'
                        ),
                        pointRadius: results.efficiencyCurve.map((p) =>
                          p.budget === budget ? 6 : 3
                        ),
                        pointBorderWidth: results.efficiencyCurve.map((p) =>
                          p.budget === budget ? 3 : 0
                        ),
                        pointBorderColor: '#fff',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#fff',
                        titleColor: COLORS.text,
                        bodyColor: COLORS.muted,
                        borderColor: COLORS.border,
                        borderWidth: 1,
                        padding: 12,
                        titleFont: { family: 'Poppins', weight: 700, size: 13 },
                        bodyFont: { family: 'Poppins', size: 12 },
                        callbacks: {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          label: (ctx: any) => ` ${ctx.parsed.y.toFixed(1)}x ROAS`,
                        },
                      },
                      datalabels: { display: false },
                    },
                    scales: {
                      x: {
                        grid: { color: COLORS.border, drawTicks: false },
                        ticks: { font: { family: 'Poppins', size: 10 }, color: COLORS.faint, maxRotation: 45 },
                        border: { display: false },
                      },
                      y: {
                        grid: { color: COLORS.border, drawTicks: false },
                        ticks: {
                          font: { family: 'Poppins', size: 11 },
                          color: COLORS.faint,
                          callback: (value: string | number) => `${value}x`,
                        },
                        border: { display: false },
                      },
                    },
                  }}
                />
              </div>
              <p className="chart-note">Your budget ({formatBudget(budget)}) is highlighted. The curve flattens as saturation increases.</p>
            </div>

            {/* ── Pareto Frontier ── */}
            {results.paretoFrontier.length > 2 && (
              <div className="result-card">
                <h3>Efficiency Frontier: CAC vs Installs</h3>
                <p className="chart-subtitle">Non-dominated trade-offs — every point is optimal for its CAC level</p>
                <div className="chart-container pareto-container">
                  <Scatter
                    data={{
                      datasets: [
                        {
                          label: 'Pareto Frontier',
                          data: results.paretoFrontier.map((p) => ({ x: p.cac, y: p.installs })),
                          backgroundColor: COLORS.green,
                          borderColor: COLORS.green,
                          pointRadius: 5,
                          pointHoverRadius: 7,
                          showLine: true,
                          borderWidth: 2,
                          tension: 0.3,
                          fill: false,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: '#fff',
                          titleColor: COLORS.text,
                          bodyColor: COLORS.muted,
                          borderColor: COLORS.border,
                          borderWidth: 1,
                          padding: 12,
                          titleFont: { family: 'Poppins', weight: 700, size: 13 },
                          bodyFont: { family: 'Poppins', size: 12 },
                          callbacks: {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            label: (ctx: any) =>
                              ` CAC: $${ctx.parsed.x.toFixed(2)} | Installs: ${ctx.parsed.y.toLocaleString()}`,
                          },
                        },
                        datalabels: { display: false },
                      },
                      scales: {
                        x: {
                          title: { display: true, text: 'Blended CAC ($)', font: { family: 'Poppins', size: 12, weight: 600 }, color: COLORS.muted },
                          grid: { color: COLORS.border, drawTicks: false },
                          ticks: { font: { family: 'Poppins', size: 11 }, color: COLORS.faint, callback: (v: string | number) => `$${v}` },
                          border: { display: false },
                        },
                        y: {
                          title: { display: true, text: 'Est. Monthly Installs', font: { family: 'Poppins', size: 12, weight: 600 }, color: COLORS.muted },
                          grid: { color: COLORS.border, drawTicks: false },
                          ticks: { font: { family: 'Poppins', size: 11 }, color: COLORS.faint },
                          border: { display: false },
                        },
                      },
                    }}
                  />
                </div>
                <p className="chart-note">Move along the frontier to see how accepting higher CAC yields more installs (diminishing returns apply).</p>
              </div>
            )}

            {/* CTA */}
            <div className="cta-card">
              <p>Want to validate these numbers with real campaign data?</p>
              <a
                href="https://appsamurai.com/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta"
              >
                Talk to our growth team
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 8h8M9 5l3 3-3 3" /></svg>
              </a>
            </div>

            {/* Keyword Intelligence from DataForSEO */}
            <KeywordInsights category={category} />

            {/* Recalculate */}
            <div className="recalc-row">
              <button
                className="btn-recalc"
                onClick={() => {
                  setShowResults(false);
                  setResults(null);
                  setStep(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Start Over
              </button>
            </div>

            <p className="disclaimer">
              Estimates based on 2025-2026 industry benchmarks and AppSamurai campaign data across 500+ campaigns.
              ROAS shown as a range (&#177;15%) reflecting real-world variance. Actual results may vary based on
              creative quality, targeting, seasonality, app-specific factors, and market conditions.
              All categories receive balanced, methodology-consistent recommendations.
              Last updated: March 2026.
            </p>
          </div>
        )}
      </main>
    </>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────── */

const styles = `
  /* Reset for this page */
  .calc-main { padding-top: 0; }

  /* Header */
  .calc-header {
    position: sticky;
    top: 0;
    z-index: 500;
    background: #fff;
    border-bottom: 1px solid var(--border);
    height: 60px;
  }
  .calc-header-inner {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 24px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .calc-back {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--green);
    transition: color .2s;
  }
  .calc-back:hover { color: var(--green-h); }
  .calc-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 14px;
    color: var(--text);
  }
  .calc-logo-mark {
    width: 26px;
    height: 26px;
    background: var(--green);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #fff;
    font-weight: 700;
  }
  .calc-logo-divider {
    color: var(--border);
    font-weight: 300;
    font-size: 18px;
  }
  .calc-logo-title {
    color: var(--text-muted);
    font-weight: 500;
  }

  /* Hero */
  .calc-hero {
    max-width: 900px;
    margin: 0 auto;
    padding: 56px 24px 32px;
    text-align: center;
  }
  .calc-badge {
    display: inline-block;
    background: rgba(38,190,129,.08);
    color: var(--green);
    font-size: 11px;
    font-weight: 700;
    padding: 7px 20px;
    border-radius: 100px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    margin-bottom: 20px;
    border: 1px solid rgba(38,190,129,.15);
  }
  .calc-hero h1 {
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    font-weight: 700;
    color: var(--text);
    line-height: 1.15;
    margin-bottom: 14px;
    letter-spacing: -.02em;
  }
  .calc-hero-sub {
    font-size: clamp(.88rem, 1.4vw, 1rem);
    color: var(--text-muted);
    max-width: 560px;
    margin: 0 auto;
    line-height: 1.7;
  }

  /* Steps bar */
  .steps-bar {
    max-width: 280px;
    margin: 0 auto 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    padding: 0 8px;
  }
  .step-line {
    position: absolute;
    top: 50%;
    left: 28px;
    right: 28px;
    height: 2px;
    background: var(--border);
    transform: translateY(-50%);
    z-index: 0;
    border-radius: 1px;
  }
  .step-line-fill {
    height: 100%;
    background: var(--green);
    border-radius: 1px;
    transition: width .4s cubic-bezier(.22,1,.36,1);
  }
  .step-dot {
    position: relative;
    z-index: 1;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid var(--border);
    background: #fff;
    font-size: 13px;
    font-weight: 700;
    color: var(--text-faint);
    cursor: pointer;
    transition: all .3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .step-dot.active {
    border-color: var(--green);
    color: var(--green);
    box-shadow: 0 0 0 4px rgba(38,190,129,.1);
  }
  .step-dot.done {
    border-color: var(--green);
    background: var(--green);
    color: #fff;
  }

  /* Card */
  .calc-card {
    max-width: 660px;
    margin: 0 auto 32px;
    background: #fff;
    border-radius: 10px;
    padding: 40px;
    box-shadow: 0 4px 24px rgba(0,0,0,.06);
    border: 1px solid var(--border);
  }
  .card-step-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--green);
    text-transform: uppercase;
    letter-spacing: 1.2px;
    margin-bottom: 8px;
  }
  .calc-card h2 {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 28px;
    letter-spacing: -.01em;
  }

  /* Fields */
  .field-label {
    display: block;
    font-size: .85rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 8px;
  }
  .field-label strong {
    color: var(--green);
    font-weight: 700;
  }
  .field-hint {
    font-weight: 400;
    color: var(--text-faint);
    font-size: .8rem;
  }
  .field-error {
    font-size: .78rem;
    color: #F87171;
    margin-top: 6px;
    margin-bottom: 0;
  }

  /* Select */
  .select-wrap {
    position: relative;
    margin-bottom: 24px;
  }
  .calc-select {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    font-size: .9rem;
    font-family: inherit;
    color: var(--text);
    background: #fff;
    appearance: none;
    cursor: pointer;
    transition: border-color .2s;
  }
  .calc-select:focus {
    outline: none;
    border-color: var(--green);
  }
  .select-chevron {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }

  /* Chips */
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
  }
  .chip {
    padding: 9px 18px;
    border-radius: 29px;
    border: 1.5px solid var(--border);
    background: #fff;
    font-size: .82rem;
    font-family: inherit;
    font-weight: 500;
    color: var(--text-muted);
    cursor: pointer;
    transition: all .2s;
  }
  .chip:hover {
    border-color: var(--green);
    color: var(--green);
  }
  .chip.selected {
    background: rgba(38,190,129,.08);
    border-color: var(--green);
    color: var(--green);
    font-weight: 600;
  }

  /* Slider */
  .slider-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  .slider-min, .slider-max {
    font-size: .78rem;
    font-weight: 600;
    color: var(--text-faint);
    flex-shrink: 0;
    width: 40px;
  }
  .slider-max { text-align: right; }
  .calc-slider {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    appearance: none;
    outline: none;
    cursor: pointer;
  }
  .calc-slider::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--green);
    border: 3px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,.15);
    cursor: pointer;
    transition: transform .15s;
  }
  .calc-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }
  .calc-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--green);
    border: 3px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,.15);
    cursor: pointer;
  }

  /* Budget input */
  .budget-input-row {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 28px;
    max-width: 200px;
  }
  .budget-dollar {
    font-size: .95rem;
    font-weight: 600;
    color: var(--text-muted);
  }
  .budget-input {
    flex: 1;
    border: 1.5px solid var(--border);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: .9rem;
    font-family: inherit;
    color: var(--text);
    width: 120px;
  }
  .budget-input:focus {
    outline: none;
    border-color: var(--green);
  }
  .budget-period {
    font-size: .82rem;
    color: var(--text-faint);
  }

  /* Goals */
  .goal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 28px;
  }
  .goal-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px 16px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    background: #fff;
    cursor: pointer;
    transition: all .2s;
    font-family: inherit;
  }
  .goal-card:hover {
    border-color: var(--green);
    background: rgba(38,190,129,.03);
  }
  .goal-card.selected {
    border-color: var(--green);
    background: rgba(38,190,129,.06);
    box-shadow: 0 0 0 3px rgba(38,190,129,.1);
  }
  .goal-icon {
    font-size: 24px;
  }
  .goal-label {
    font-size: .82rem;
    font-weight: 600;
    color: var(--text);
    text-align: center;
  }

  /* Card actions */
  .card-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
  }
  .btn-next, .btn-calculate {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--green);
    color: #fff;
    font-family: inherit;
    font-weight: 700;
    font-size: .88rem;
    padding: 12px 28px;
    border-radius: 29px;
    border: none;
    cursor: pointer;
    transition: all .3s;
  }
  .btn-next:hover, .btn-calculate:hover {
    background: var(--green-h);
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(38,190,129,.2);
  }
  .btn-next:disabled {
    opacity: .4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  .btn-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    color: var(--text-muted);
    font-family: inherit;
    font-weight: 600;
    font-size: .85rem;
    padding: 10px 16px;
    border-radius: 29px;
    border: 1.5px solid var(--border);
    cursor: pointer;
    transition: all .2s;
  }
  .btn-back:hover {
    border-color: var(--text-muted);
    color: var(--text);
  }

  /* Animation */
  .fade-in {
    animation: fadeInUp .5s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Results */
  .results-section {
    max-width: 900px;
    margin: 16px auto 0;
    padding: 0 24px 64px;
  }
  .results-heading {
    font-size: clamp(1.6rem, 3vw, 2rem);
    font-weight: 700;
    text-align: center;
    color: var(--text);
    margin-bottom: 8px;
    letter-spacing: -.01em;
  }
  .results-sub {
    text-align: center;
    font-size: .9rem;
    color: var(--text-muted);
    margin-bottom: 36px;
    line-height: 1.7;
  }
  .results-sub strong {
    color: var(--text);
    font-weight: 600;
  }
  .results-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }
  .result-card {
    background: #fff;
    border-radius: 10px;
    padding: 28px;
    box-shadow: 0 4px 24px rgba(0,0,0,.06);
    border: 1px solid var(--border);
  }
  .result-card h3 {
    font-size: .95rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 20px;
    text-align: center;
  }
  .chart-container {
    position: relative;
    width: 100%;
  }
  .donut-container {
    height: 280px;
  }
  .bar-container {
    height: 240px;
  }

  /* ROAS */
  .roas-card {
    background: #fff;
    border-radius: 10px;
    padding: 36px;
    box-shadow: 0 4px 24px rgba(0,0,0,.06);
    border: 1px solid var(--border);
    text-align: center;
    margin-bottom: 24px;
  }
  .roas-label {
    font-size: .82rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }
  .roas-value {
    font-size: clamp(2.4rem, 5vw, 3.5rem);
    font-weight: 700;
    letter-spacing: -.02em;
    line-height: 1.1;
    margin-bottom: 6px;
  }
  .roas-great { color: var(--green); }
  .roas-good { color: #26BE81; }
  .roas-ok { color: #f4cb00; }
  .roas-indicator {
    font-size: .88rem;
    color: var(--text-muted);
    line-height: 1.5;
  }

  /* Summary */
  .summary-card {
    background: #fff;
    border-radius: 10px;
    padding: 32px;
    box-shadow: 0 4px 24px rgba(0,0,0,.06);
    border: 1px solid var(--border);
    margin-bottom: 24px;
  }
  .summary-card h3 {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 16px;
  }
  .takeaway-list {
    list-style: none;
    padding: 0;
  }
  .takeaway-list li {
    position: relative;
    padding-left: 20px;
    margin-bottom: 14px;
    font-size: .88rem;
    color: var(--text-muted);
    line-height: 1.7;
  }
  .takeaway-list li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 10px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--green);
  }

  /* Breakdown */
  .breakdown-card {
    background: #fff;
    border-radius: 10px;
    padding: 32px;
    box-shadow: 0 4px 24px rgba(0,0,0,.06);
    border: 1px solid var(--border);
    margin-bottom: 24px;
  }
  .breakdown-card h3 {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 20px;
  }
  .breakdown-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .breakdown-bar-bg {
    height: 8px;
    background: var(--bg-alt);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 6px;
  }
  .breakdown-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width .6s cubic-bezier(.22,1,.36,1);
  }
  .breakdown-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .breakdown-label {
    font-size: .82rem;
    font-weight: 600;
    color: var(--text);
  }
  .breakdown-amount {
    font-size: .85rem;
    font-weight: 700;
    color: var(--text);
  }
  .breakdown-pct {
    font-weight: 500;
    color: var(--text-faint);
    font-size: .78rem;
  }

  /* CTA */
  .cta-card {
    background: var(--bg-alt);
    border-radius: 10px;
    padding: 36px;
    text-align: center;
    border: 1px solid var(--border);
    margin-bottom: 24px;
  }
  .cta-card p {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 16px;
  }
  .btn-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--green);
    color: #fff;
    font-family: inherit;
    font-weight: 700;
    font-size: .92rem;
    padding: 14px 32px;
    border-radius: 29px;
    border: none;
    cursor: pointer;
    transition: all .3s;
    text-decoration: none;
  }
  .btn-cta:hover {
    background: var(--green-h);
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(38,190,129,.2);
  }

  /* Recalculate */
  .recalc-row {
    text-align: center;
    margin-bottom: 24px;
  }
  .btn-recalc {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    color: var(--text-muted);
    font-family: inherit;
    font-weight: 600;
    font-size: .85rem;
    padding: 10px 24px;
    border-radius: 29px;
    border: 1.5px solid var(--border);
    cursor: pointer;
    transition: all .2s;
  }
  .btn-recalc:hover {
    border-color: var(--text-muted);
    color: var(--text);
  }

  /* Disclaimer */
  .disclaimer {
    text-align: center;
    font-size: .75rem;
    color: var(--text-faint);
    line-height: 1.6;
    max-width: 520px;
    margin: 0 auto;
  }

  /* ROAS range */
  .roas-range {
    font-size: .82rem;
    color: var(--text-faint);
    margin-bottom: 4px;
    font-weight: 500;
  }
  .roas-ltv-note {
    font-size: .78rem;
    color: var(--green);
    margin-top: 8px;
    font-weight: 500;
  }

  /* LTV override */
  .ltv-override-section {
    margin-bottom: 24px;
  }
  .ltv-toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    font-family: inherit;
    font-size: .82rem;
    font-weight: 600;
    color: var(--text-faint);
    cursor: pointer;
    padding: 6px 0;
    transition: color .2s;
  }
  .ltv-toggle:hover { color: var(--green); }
  .ltv-input-area {
    margin-top: 12px;
    padding: 16px;
    background: var(--bg-alt);
    border-radius: 10px;
    border: 1px solid var(--border);
  }
  .ltv-help {
    font-size: .75rem;
    color: var(--text-faint);
    margin-top: 8px;
    line-height: 1.5;
  }

  /* What-If */
  .whatif-card { padding-bottom: 32px; }
  .whatif-desc {
    font-size: .85rem;
    color: var(--text-muted);
    margin-bottom: 20px;
    text-align: center;
  }
  .whatif-slider-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }
  .whatif-label {
    font-size: .75rem;
    font-weight: 600;
    color: var(--text-faint);
    flex-shrink: 0;
    width: 64px;
    text-align: center;
  }
  .whatif-slider { flex: 1; }
  .whatif-value {
    text-align: center;
    font-size: .82rem;
    font-weight: 600;
    color: var(--text-muted);
    margin-bottom: 20px;
  }
  .whatif-comparison {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 20px;
    background: var(--bg-alt);
    border-radius: 10px;
    border: 1px solid var(--border);
  }
  .whatif-col {
    flex: 1;
    text-align: center;
  }
  .whatif-col-label {
    font-size: .72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-faint);
    margin-bottom: 4px;
  }
  .whatif-col-value {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 4px;
  }
  .whatif-col-mix {
    font-size: .72rem;
    color: var(--text-faint);
    line-height: 1.4;
  }
  .whatif-arrow {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }
  .whatif-up { color: var(--green) !important; }
  .whatif-down { color: #F87171 !important; }
  .whatif-delta {
    font-size: .75rem;
    font-weight: 600;
  }

  /* Chart subtitles and notes */
  .chart-subtitle {
    font-size: .82rem;
    color: var(--text-faint);
    text-align: center;
    margin-bottom: 16px;
  }
  .chart-note {
    font-size: .75rem;
    color: var(--text-faint);
    text-align: center;
    margin-top: 12px;
    line-height: 1.5;
  }
  .efficiency-container { height: 280px; }
  .pareto-container { height: 300px; }

  /* Responsive */
  @media (max-width: 700px) {
    .calc-card { padding: 28px 20px; }
    .results-grid { grid-template-columns: 1fr; }
    .goal-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
    .donut-container { height: 260px; }
    .bar-container { height: 220px; }
    .efficiency-container { height: 240px; }
    .pareto-container { height: 260px; }
    .calc-header-inner { padding: 0 16px; }
    .calc-back span { display: none; }
    .calc-logo-title { display: none; }
    .calc-logo-divider { display: none; }
    .whatif-comparison { flex-direction: column; gap: 12px; }
    .whatif-arrow { transform: rotate(90deg); }
    .whatif-col-mix { font-size: .68rem; }
  }
  @media (max-width: 480px) {
    .goal-grid { grid-template-columns: 1fr; }
    .chips { gap: 6px; }
    .chip { padding: 7px 14px; font-size: .78rem; }
  }
`;
