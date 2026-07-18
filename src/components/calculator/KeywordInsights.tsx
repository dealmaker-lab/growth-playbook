'use client';

import { useEffect, useState } from 'react';

/**
 * What App Store search actually looks like in the chosen category.
 *
 * This replaces a table headed "Top App Store Keywords" that was in fact
 * showing GOOGLE web-search volumes. The honest data turned out not to support
 * a keyword table at all: App Store demand is a handful of enormous generic
 * terms ("games", "free games") plus a long list of app names, with no rich
 * non-brand long tail. There is also no API anywhere that returns App Store
 * volume for a curated keyword list, so the old shape could not be salvaged.
 *
 * So the widget shows what the data does support, which is the more useful
 * point for an ASA plan anyway: the split between generic discovery demand and
 * branded demand, with real numbers on both sides.
 *
 * Every number here, the share included, comes from the API. Nothing about the
 * split is asserted in copy, because it varies by category and a hard-coded
 * claim would eventually be false for one of them.
 */

interface Row {
  keyword: string;
  volume: number;
}
interface Payload {
  brand: Row[];
  generic: Row[];
  brandCount: number;
  genericCount: number;
  brandShare: number;
  total: number;
  updatedAt: string | null;
}

export default function KeywordInsights({ category }: { category: string }) {
  const [data, setData] = useState<{ category: string; payload: Payload | null } | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch(`/api/appstore-keywords?category=${encodeURIComponent(category)}`, { signal: ac.signal })
      .then((r) => r.json())
      .then((payload: Payload) => setData({ category, payload }))
      .catch((err) => {
        if (err?.name !== 'AbortError') setData({ category, payload: null });
      });
    return () => ac.abort();
  }, [category]);

  // Loading is derived from whether the data we hold matches the category we
  // were asked for, so a category switch can never show the previous one's rows.
  if (!data || data.category !== category) {
    return <div className="kwi-skeleton" aria-hidden="true" />;
  }

  const p = data.payload;
  if (!p || !p.total) return null;

  const genericShare = 100 - p.brandShare;
  const updated = p.updatedAt
    ? new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  return (
    <section className="kwi" aria-labelledby="kwi-title">
      <h4 id="kwi-title" className="kwi-title">
        What App Store search looks like in {category}
      </h4>
      <p className="kwi-sub">
        Real App Store search volume for the terms this category&rsquo;s leading apps compete for,
        split by whether the searcher already had an app in mind.
      </p>

      {/* Headline stat first. The two-column brand/generic layout the earlier
          draft used implied a parity the data does not have: measured July 2026
          FinTech and Utility come back 100% branded with ZERO generic terms, and
          E-commerce with one. An empty column reads as a broken widget, so the
          share leads and the generic list appears only when there is something
          honest to put in it. */}
      <div className="kwi-stat">
        <div className="kwi-stat-num">{p.brandShare}%</div>
        <p className="kwi-stat-label">
          of App Store search volume here is someone typing an app&rsquo;s name
        </p>
        <div
          className="kwi-bar"
          role="img"
          aria-label={`Branded searches ${p.brandShare} percent, generic discovery ${genericShare} percent`}
        >
          <span className="kwi-bar-brand" style={{ width: `${p.brandShare}%` }} />
          <span className="kwi-bar-generic" style={{ width: `${genericShare}%` }} />
        </div>
        <div className="kwi-legend">
          <span>
            <i className="kwi-dot kwi-dot-brand" aria-hidden="true" />
            {p.brandCount} branded
          </span>
          <span>
            <i className="kwi-dot kwi-dot-generic" aria-hidden="true" />
            {p.genericCount} generic
          </span>
          <span className="kwi-legend-total">{p.total} terms tracked</span>
        </div>
      </div>

      <div className={`kwi-cols${p.generic.length ? '' : ' kwi-cols-one'}`}>
        <div className="kwi-col">
          <h5>Most-searched branded terms</h5>
          <ul>
            {p.brand.map((r) => (
              <li key={r.keyword}>
                <span className="kwi-kw">{r.keyword}</span>
                <span className="kwi-vol">{r.volume.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
        {p.generic.length > 0 && (
          <div className="kwi-col">
            <h5>Generic discovery terms</h5>
            <ul>
              {p.generic.map((r) => (
                <li key={r.keyword}>
                  <span className="kwi-kw">{r.keyword}</span>
                  <span className="kwi-vol">{r.volume.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="kwi-tip">
        <strong>What this means for ASA.</strong>{' '}
        {p.brandShare >= 50 ? (
          <>
            People arrive at the App Store already knowing the app they want, so an Apple Search Ads
            plan starts by defending your own brand terms, where a rival can otherwise intercept
            demand you paid to create, and then conquesting theirs. Generic discovery terms are the
            far smaller pool and every app in the category bids them, which makes them the most
            contested inventory on the store.
          </>
        ) : (
          <>
            {genericShare}% of the search volume here is generic discovery, which is unusual for the
            App Store and means people in this category browse rather than arrive with an app in
            mind. Head terms are worth bidding, but they are few and heavily contested, so pair them
            with brand defence before spending up on discovery.
          </>
        )}
      </p>

      <p className="kwi-source">
        Based on the top {p.total}{' '}App Store search terms that this category&rsquo;s leading apps rank
        for, US storefront. Volume via DataForSEO; each term is classed as branded or generic from
        the App Store&rsquo;s own results for it{updated ? `. Updated ${updated}` : ''}.
      </p>
    </section>
  );
}
