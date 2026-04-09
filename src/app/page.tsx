import Link from 'next/link';
import TopNav from '@/components/shared/TopNav';
import Footer from '@/components/shared/Footer';

const EBOOK_LINKS = [
  { href: '/growth-playbook', label: 'Mobile Growth Playbook' },
  { href: '/rewarded-playtime', label: 'Rewarded Playtime Handbook' },
  { href: '/hybrid-casual', label: 'Hybrid-Casual Games' },
  { href: '/calculator', label: 'ROI Calculator' },
];

const EBOOKS = [
  {
    slug: 'growth-playbook',
    title: 'Mobile Growth Strategy Guide',
    subtitle: '2026 Edition',
    description:
      'The definitive strategy guide for Programmatic DSP, Rewarded Playtime, OEM Discovery, and Apple Search Ads. Data-backed frameworks and an interactive ROI calculator for growth teams.',
    chapters: 4,
    readTime: '25 min',
    accentVar: '--green',
    accentHex: '#26BE81',
    tags: ['DSP', 'Rewarded', 'OEM', 'ASA/ASO'],
  },
  {
    slug: 'rewarded-playtime',
    title: 'Rewarded Playtime Handbook',
    subtitle: 'Engage, Retain, Monetize',
    description:
      'How rewarded playtime is reshaping mobile gaming monetization. Covers market trends, campaign strategy, KPI measurement, and best practices for casual and mid-core games.',
    chapters: 6,
    readTime: '15 min',
    accentVar: '--purple',
    accentHex: '#af9cff',
    tags: ['Gaming', 'IAPs', 'Retention', 'KPIs'],
  },
  {
    slug: 'hybrid-casual',
    title: 'The Rise of Hybrid-Casual Games',
    subtitle: 'The Next Era in Mobile Gaming',
    description:
      'Why hybrid-casual games emerged, how they combine casual accessibility with mid-core depth, and what marketing strategies drive growth in this fast-growing segment.',
    chapters: 5,
    readTime: '20 min',
    accentVar: '--pink',
    accentHex: '#f48dff',
    tags: ['Hybrid-Casual', 'UA', 'Monetization', 'Retention'],
  },
];

export default function HubPage() {
  return (
    <>
      <TopNav ebookLinks={EBOOK_LINKS} />

      {/* HERO */}
      <section className="hub-hero">
        <div className="wrap">
          <span className="hero-badge">AppSamurai Content Hub</span>
          <h1 className="hub-hero-title">
            Mobile Growth <em>Resources</em>
          </h1>
          <p className="hub-hero-sub">
            Interactive strategy guides, market research, and data-driven
            frameworks built for mobile growth teams. Free to read, backed by
            10,000+ campaigns.
          </p>
        </div>
      </section>

      {/* EBOOK GRID */}
      <section className="hub-grid-section">
        <div className="wrap">
          <div className="hub-grid">
            {EBOOKS.map((book) => (
              <Link
                key={book.slug}
                href={`/${book.slug}`}
                className="hub-card"
                style={{ '--card-accent': book.accentHex } as React.CSSProperties}
              >
                <div className="hub-card-accent" />
                <div className="hub-card-body">
                  <span className="hub-card-subtitle">{book.subtitle}</span>
                  <h2 className="hub-card-title">{book.title}</h2>
                  <p className="hub-card-desc">{book.description}</p>
                  <div className="hub-card-tags">
                    {book.tags.map((tag) => (
                      <span key={tag} className="hub-tag">{tag}</span>
                    ))}
                  </div>
                  <div className="hub-card-meta">
                    <span>{book.chapters} chapters</span>
                    <span className="hub-meta-dot" />
                    <span>{book.readTime} read</span>
                  </div>
                  <span className="hub-card-cta">
                    Read Now
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATOR CTA */}
      <section className="hub-calc-cta">
        <div className="wrap">
          <div className="hub-calc-inner">
            <div>
              <h3>Model Your Growth Strategy</h3>
              <p>
                Combine all 4 pillars into a personalized budget allocation with
                estimated CAC and ROAS projections.
              </p>
            </div>
            <Link href="/calculator" className="btn-primary">
              Open ROI Calculator
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
