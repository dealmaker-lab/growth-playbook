import Image from 'next/image';
import Link from 'next/link';
import TopNav from '@/components/shared/TopNav';
import Footer from '@/components/shared/Footer';
import HashRedirect from '@/components/shared/HashRedirect';

const EBOOK_LINKS = [
  { href: '/growth-playbook', label: 'Mobile Growth Playbook' },
  { href: '/rewarded-playtime', label: 'Rewarded Playtime Handbook' },
  { href: '/monetization-playbook', label: 'Monetization Playbook' },
  { href: '/calculator', label: 'ROI Calculator' },
];

const EBOOKS = [
  {
    slug: 'growth-playbook',
    title: 'Mobile Growth Strategy Guide',
    label: 'GUIDE',
    description:
      'The definitive strategy guide for Programmatic DSP, Rewarded Playtime, OEM Discovery, and Apple Search Ads. Data-backed frameworks and an interactive ROI calculator for growth teams.',
    chapters: 4,
    readTime: '25 min',
    accentHex: '#2EC97E',
    tags: ['DSP', 'Rewarded', 'OEM', 'ASA/ASO'],
    cover: '/covers/growth-playbook.png',
    newUntil: '2026-07-13', // 90 days from 2026-04-14
  },
  {
    slug: 'rewarded-playtime',
    title: 'Rewarded Playtime Handbook',
    label: 'HANDBOOK',
    description:
      'How rewarded playtime is reshaping mobile gaming monetization. Covers the dual-value model, genre-by-genre dynamics, a regional landscape across the US, South Korea, Japan, Brazil, and Europe, plus campaign strategy and KPIs.',
    chapters: 7,
    readTime: '20 min',
    accentHex: '#af9cff',
    tags: ['Gaming', 'IAPs', 'Regional', 'LTV'],
    cover: '/covers/rewarded-playtime.png',
    newUntil: '2026-09-01', // 90 days from 2026-06-03 refresh
  },
  {
    slug: 'monetization-playbook',
    title: 'Monetization Playbook for Casual & Hybrid Casual Games',
    label: 'PLAYBOOK',
    description:
      'A 2025–2026 field guide to revenue strategy for casual and hybrid casual games: the full monetization stack, LiveOps, direct-to-consumer web stores, retention frameworks, and rewarded UA.',
    chapters: 10,
    readTime: '30 min',
    accentHex: '#f48dff',
    tags: ['Monetization', 'LiveOps', 'IAP', 'DTC'],
    cover: '/images/mon/cover.png',
    newUntil: '2026-09-11', // 90 days from 2026-06-13 launch
  },
];

export default function HubPage() {
  return (
    <>
      <TopNav ebookLinks={EBOOK_LINKS} />
      <HashRedirect />

      {/* HERO */}
      <section className="hub-hero">
        <div className="wrap">
          <span className="hero-badge">AppSamurai Content Hub</span>
          <h1 className="hub-hero-title">
            Mobile Growth <em>Playbooks</em>
          </h1>
          <p className="hub-hero-sub">
            Three strategy guides for mobile growth teams. Programmatic DSP,
            Rewarded Playtime, OEM Discovery, and Apple Search Ads, with
            frameworks and data from AppSamurai&rsquo;s work with 10,000+ apps.
          </p>
        </div>
      </section>

      {/* EBOOK GRID */}
      <section className="hub-grid-section">
        <div className="wrap">
          <div className="hub-grid">
            {EBOOKS.map((book) => {
              const isNew =
                'newUntil' in book &&
                typeof book.newUntil === 'string' &&
                new Date() < new Date(book.newUntil);
              return (
              <Link
                key={book.slug}
                href={`/${book.slug}`}
                className="hub-card"
                style={{ '--card-accent': book.accentHex } as React.CSSProperties}
              >
                <div className="hub-card-cover">
                  <Image
                    src={book.cover}
                    alt={book.title}
                    width={800}
                    height={480}
                    className="hub-card-img"
                    priority
                  />
                  <span className="hub-card-label">{book.label}</span>
                  {isNew && <span className="hub-card-new">NEW</span>}
                </div>
                <div className="hub-card-body">
                  <p className="hub-card-desc">{book.description}</p>
                  <div className="hub-card-tags">
                    {book.tags.map((tag) => (
                      <span key={tag} className="hub-tag">{tag}</span>
                    ))}
                  </div>
                  <div className="hub-card-footer">
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
                </div>
              </Link>
              );
            })}
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
