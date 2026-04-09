import Link from 'next/link';

const ALL_EBOOKS = [
  {
    slug: 'growth-playbook',
    title: 'Mobile Growth Strategy Guide',
    description: 'DSP, Rewarded, OEM & ASA strategies for 2026.',
    accentHex: '#26BE81',
  },
  {
    slug: 'rewarded-playtime',
    title: 'Rewarded Playtime Handbook',
    description: 'Engage, retain, monetize in mobile gaming.',
    accentHex: '#af9cff',
  },
  {
    slug: 'hybrid-casual',
    title: 'The Rise of Hybrid-Casual Games',
    description: 'The next era in mobile gaming market growth.',
    accentHex: '#f48dff',
  },
];

interface RelatedEbooksProps {
  currentSlug: string;
}

export default function RelatedEbooks({ currentSlug }: RelatedEbooksProps) {
  const others = ALL_EBOOKS.filter((b) => b.slug !== currentSlug);

  return (
    <section className="sec sec-l" style={{ padding: '48px 0' }}>
      <div className="wrap">
        <div className="toc-label rv">Continue Reading</div>
        <h3 className="rv" style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.2rem,2.5vw,1.5rem)', fontWeight: 700, textAlign: 'center', color: 'var(--text)', marginBottom: '24px' }}>More from AppSamurai</h3>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${others.length},1fr)`, gap: '20px' }}>
          {others.map((book) => (
            <Link
              key={book.slug}
              href={`/${book.slug}`}
              className="hub-card"
              style={{ '--card-accent': book.accentHex } as React.CSSProperties}
            >
              <div className="hub-card-accent" />
              <div className="hub-card-body">
                <h4 className="hub-card-title" style={{ fontSize: '1.05rem' }}>{book.title}</h4>
                <p className="hub-card-desc" style={{ fontSize: '.82rem' }}>{book.description}</p>
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
  );
}
