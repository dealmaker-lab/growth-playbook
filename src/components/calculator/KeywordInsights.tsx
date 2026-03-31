'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface KeywordRow {
  keyword: string;
  volume: number;
  cpc: number;
  competition: string;
  opportunity: string;
  updated_at: string;
}

interface KeywordInsightsProps {
  category: string;
}

export default function KeywordInsights({ category }: KeywordInsightsProps) {
  const [keywords, setKeywords] = useState<KeywordRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKeywords = useCallback((cat: string) => {
    setLoading(true);
    fetch(`/api/keywords?category=${encodeURIComponent(cat)}&_t=${Date.now()}`)
      .then((r) => r.json())
      .then((data) => {
        setKeywords(data.keywords || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchKeywords(category);
  }, [category, fetchKeywords]);

  if (loading) {
    return (
      <div style={{ marginTop: '32px', padding: '24px', background: '#F5F7F9', borderRadius: '16px', border: '1px solid #E8ECF1' }}>
        <div style={{ height: '200px', background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '8px' }} />
      </div>
    );
  }

  if (keywords.length === 0) return null;

  return (
    <div style={{ marginTop: '32px', padding: '28px', background: '#F5F7F9', borderRadius: '16px', border: '1px solid #E8ECF1' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '20px' }}>&#128273;</span>
        <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 700, color: '#222', margin: 0 }}>
          Top App Store Keywords for {category}
        </h4>
      </div>
      <p style={{ fontSize: '.82rem', color: '#666', marginBottom: '16px', lineHeight: 1.6 }}>
        Real search volume data to inform your ASA keyword strategy. Focus budget on low-competition keywords first — they convert 2-3x better.
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E8ECF1' }}>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#222' }}>Keyword</th>
              <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600, color: '#222' }}>Volume/mo</th>
              <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 600, color: '#222' }}>Difficulty</th>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#222' }}>Opportunity</th>
            </tr>
          </thead>
          <tbody>
            {keywords.slice(0, 10).map((kw) => (
              <tr key={kw.keyword} style={{ borderBottom: '1px solid #E8ECF1' }}>
                <td style={{ padding: '10px 12px', color: '#222', fontWeight: 500 }}>
                  &ldquo;{kw.keyword}&rdquo;
                </td>
                <td style={{ textAlign: 'right', padding: '10px 12px', color: '#666', fontVariantNumeric: 'tabular-nums' }}>
                  {kw.volume.toLocaleString()}
                </td>
                <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: '100px',
                      fontSize: '.72rem',
                      fontWeight: 600,
                      background:
                        kw.competition === 'LOW'
                          ? 'rgba(38,190,129,.1)'
                          : kw.competition === 'HIGH'
                            ? 'rgba(248,113,113,.1)'
                            : 'rgba(244,203,0,.1)',
                      color:
                        kw.competition === 'LOW'
                          ? '#26BE81'
                          : kw.competition === 'HIGH'
                            ? '#F87171'
                            : '#8B6914',
                    }}
                  >
                    {kw.competition}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', color: '#666', fontSize: '.82rem' }}>
                  {kw.opportunity || 'Discovery'}
                  {kw.opportunity === 'Hidden Gem' && ' \u2728'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fff', borderRadius: '8px', border: '1px solid #E8ECF1', fontSize: '.82rem', color: '#666', lineHeight: 1.6 }}>
        <strong style={{ color: '#222' }}>&#128161; Tip:</strong> Focus your ASA budget on Low difficulty keywords first — they convert at 2-3x the rate of High competition terms. Feed winners into your ASO metadata for organic ranking.{' '}
        <Link href="/#ch4" style={{ color: 'var(--cyan)', fontWeight: 600, textDecoration: 'none' }}>
          Learn more in Chapter 4 &rarr;
        </Link>
      </div>
    </div>
  );
}
