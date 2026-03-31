'use client';

import { useState, useEffect } from 'react';

/**
 * ML Foundations: Dynamic Content Ranking Component
 *
 * Fetches engagement-based section rankings from /api/rankings
 * and displays a "Trending Chapters" bar in the playbook.
 *
 * Uses ranking algorithm: views * 0.4 + scroll_depth * 0.3 + unique_sessions * 0.3
 * Falls back to default order when analytics data is insufficient.
 */

interface SectionRanking {
  section: string;
  label: string;
  score: number;
  viewCount: number;
  uniqueSessions: number;
  avgScrollDepth: number;
}

interface RankingsResponse {
  rankings: SectionRanking[];
  source: 'analytics' | 'default';
  eventCount?: number;
}

const SECTION_ANCHORS: Record<string, string> = {
  'ch1-dsp': '#ch1-dsp-programmatic',
  'ch2-rewarded': '#ch2-rewarded-models',
  'ch3-oem': '#ch3-oem-discovery',
  'ch4-asa': '#ch4-asa-aso',
};

const SECTION_ICONS: Record<string, string> = {
  'ch1-dsp': '1',
  'ch2-rewarded': '2',
  'ch3-oem': '3',
  'ch4-asa': '4',
};

export default function TrendingContent() {
  const [rankings, setRankings] = useState<SectionRanking[]>([]);
  const [source, setSource] = useState<'analytics' | 'default'>('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRankings() {
      try {
        const res = await fetch('/api/rankings');
        if (!res.ok) throw new Error('Failed to fetch');
        const data: RankingsResponse = await res.json();
        setRankings(data.rankings);
        setSource(data.source);
      } catch {
        // Fail silently — component is non-critical
      } finally {
        setLoading(false);
      }
    }
    fetchRankings();
  }, []);

  if (loading || rankings.length === 0) return null;

  return (
    <>
      <style>{trendingStyles}</style>
      <div className="trending-section">
        <div className="trending-header">
          <span className="trending-badge">
            {source === 'analytics' ? 'Trending Now' : 'Explore Chapters'}
          </span>
          {source === 'analytics' && (
            <span className="trending-hint">Based on reader engagement</span>
          )}
        </div>
        <div className="trending-grid">
          {rankings.map((r, i) => (
            <a
              key={r.section}
              href={SECTION_ANCHORS[r.section] || `#${r.section}`}
              className={`trending-card ${i === 0 ? 'trending-top' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.querySelector(SECTION_ANCHORS[r.section] || `#${r.section}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <div className="trending-rank">
                <span className="trending-num">{SECTION_ICONS[r.section] || i + 1}</span>
              </div>
              <div className="trending-info">
                <div className="trending-label">{r.label}</div>
                <div className="trending-bar-bg">
                  <div
                    className="trending-bar-fill"
                    style={{ width: `${r.score}%` }}
                  />
                </div>
              </div>
              {i === 0 && source === 'analytics' && (
                <span className="trending-fire">Most Read</span>
              )}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

const trendingStyles = `
  .trending-section {
    max-width: 820px;
    margin: 0 auto 40px;
    padding: 0 24px;
  }
  .trending-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  .trending-badge {
    display: inline-block;
    background: rgba(38,190,129,.08);
    color: var(--green, #26BE81);
    font-size: 11px;
    font-weight: 700;
    padding: 6px 16px;
    border-radius: 100px;
    letter-spacing: 1px;
    text-transform: uppercase;
    border: 1px solid rgba(38,190,129,.15);
  }
  .trending-hint {
    font-size: .78rem;
    color: var(--text-faint, #999);
  }
  .trending-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .trending-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    background: #fff;
    border: 1px solid var(--border, #E8ECF1);
    border-radius: 10px;
    text-decoration: none;
    transition: all .2s;
    cursor: pointer;
    position: relative;
  }
  .trending-card:hover {
    border-color: var(--green, #26BE81);
    box-shadow: 0 4px 16px rgba(38,190,129,.08);
    transform: translateY(-1px);
  }
  .trending-top {
    border-color: rgba(38,190,129,.3);
    background: rgba(38,190,129,.02);
  }
  .trending-rank {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--bg-alt, #F5F7F9);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .trending-top .trending-rank {
    background: var(--green, #26BE81);
  }
  .trending-top .trending-num {
    color: #fff;
  }
  .trending-num {
    font-size: .82rem;
    font-weight: 700;
    color: var(--text-muted, #666);
  }
  .trending-info {
    flex: 1;
    min-width: 0;
  }
  .trending-label {
    font-size: .88rem;
    font-weight: 600;
    color: var(--text, #222);
    margin-bottom: 6px;
  }
  .trending-bar-bg {
    height: 4px;
    background: var(--bg-alt, #F5F7F9);
    border-radius: 2px;
    overflow: hidden;
  }
  .trending-bar-fill {
    height: 100%;
    background: var(--green, #26BE81);
    border-radius: 2px;
    transition: width .6s cubic-bezier(.22,1,.36,1);
  }
  .trending-fire {
    font-size: .68rem;
    font-weight: 700;
    color: var(--green, #26BE81);
    background: rgba(38,190,129,.08);
    padding: 4px 10px;
    border-radius: 100px;
    text-transform: uppercase;
    letter-spacing: .5px;
    flex-shrink: 0;
  }

  @media (max-width: 700px) {
    .trending-section { padding: 0 16px; }
    .trending-card { padding: 12px 14px; gap: 10px; }
    .trending-label { font-size: .82rem; }
    .trending-fire { display: none; }
  }
`;
