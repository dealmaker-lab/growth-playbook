'use client';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  chapterColor?: string;
}

export default function FAQ({ items, chapterColor = 'var(--green)' }: FAQProps) {
  return (
    <section className="sec sec-w" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
      <div className="wrap">
        <h4
          style={{
            fontFamily: 'var(--font-h)',
            fontSize: '.85rem',
            fontWeight: 700,
            color: chapterColor,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '16px',
          }}
        >
          Frequently Asked Questions
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((item, i) => (
            <details
              key={i}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r)',
                overflow: 'hidden',
              }}
            >
              <summary
                style={{
                  padding: '16px 20px',
                  fontFamily: 'var(--font-h)',
                  fontWeight: 600,
                  fontSize: '.9rem',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {item.question}
                <span style={{ fontSize: '1.2rem', color: 'var(--text-faint)', transition: 'transform .2s', flexShrink: 0, marginLeft: '12px' }}>+</span>
              </summary>
              <div
                style={{
                  padding: '0 20px 16px',
                  fontSize: '.88rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.75,
                }}
              >
                {item.answer}
              </div>
            </details>
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: items.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: item.answer,
                },
              })),
            }),
          }}
        />
      </div>
    </section>
  );
}

export const DSP_FAQ = [
  {
    question: 'What is programmatic mobile advertising?',
    answer: 'Programmatic mobile advertising uses automated, AI-driven bidding to buy ad inventory across thousands of independent apps in real-time. Unlike walled garden platforms (Meta, Google), programmatic DSPs access the Open Internet where users spend 60%+ of their mobile time, offering precise targeting through bid-level transparency and predictive ROAS modeling.',
  },
  {
    question: 'How does predictive ROAS modeling work for mobile apps?',
    answer: 'Predictive ROAS modeling uses machine learning to analyze historical campaign data and predict which users will complete high-value post-install events (purchases, subscriptions, level completions) before the ad is served. This shifts optimization from cheap impressions (CPM) to deep-funnel CPA targets, achieving more predictable profitability.',
  },
  {
    question: 'What is mobile ad incrementality testing?',
    answer: 'Incrementality testing measures whether ad spend drives genuinely new users or simply takes credit for organic installs. Techniques include ghost bids (bidding without showing ads), PSA holdout groups, and geo-based lift tests. In the SKAN 5.0 era, incrementality has replaced last-click attribution as the gold standard for proving campaign value.',
  },
  {
    question: 'How much does programmatic mobile advertising cost?',
    answer: 'Programmatic CPMs vary by geography and vertical — typically $2-$8 for mid-tier inventory and $8-$20+ for premium placements. However, the real metric is cost per acquired user (CPI/CPA). With predictive bidding, programmatic campaigns often achieve 15-30% lower effective CPA than social platforms by targeting high-receptivity moments in independent apps.',
  },
];

export const REWARDED_FAQ = [
  {
    question: 'What is Rewarded Playtime in mobile gaming?',
    answer: 'Rewarded Playtime is a value-exchange user acquisition model where users earn real rewards (gift cards, in-app currency, discounts) based on actual time spent playing a game or completing in-app milestones. Unlike traditional incentivized installs, it rewards sustained engagement over 60-90 days, driving 2-3x higher LTV than standard UA channels.',
  },
  {
    question: 'How does Rewarded Playtime compare to traditional user acquisition?',
    answer: 'Rewarded Playtime users generate significantly higher lifetime value because the reward mechanic drives genuine engagement, not just downloads. Data shows D90 LTV of $14.80 for Rewarded Playtime vs $3.10 for incentivized installs. Retention rates are also higher because users develop real attachment to the app through the extended reward window.',
  },
  {
    question: 'What is an offerwall and how does it monetize apps?',
    answer: 'An offerwall is an in-app ad unit that presents users with a menu of tasks they can complete (install an app, reach a game level, complete a survey) in exchange for in-app rewards. For publishers, offerwalls generate revenue per completed action while feeling like a native feature rather than an ad interruption, leading to higher eCPMs and better user retention.',
  },
  {
    question: 'What LTV can you expect from Rewarded Playtime campaigns?',
    answer: 'LTV varies by genre — hypercasual games typically see $5-$8 D90 LTV, casual/puzzle games $10-$15, and mid-core titles $15-$25+. The key differentiator is the 60-90 day reward window that extends engagement beyond the critical first-week churn period. Rewarded Playtime consistently delivers 2-3x the LTV of traditional incentivized installs across all genres.',
  },
];

export const OEM_FAQ = [
  {
    question: 'What is OEM user acquisition for mobile apps?',
    answer: 'OEM (Original Equipment Manufacturer) user acquisition places your app directly on Android devices through partnerships with manufacturers like Samsung, Xiaomi, Oppo, and Vivo. Ads appear at system-level touchpoints — home screens, lock screens, setup wizards, and native app stores — reaching users before they even open the Google Play Store.',
  },
  {
    question: 'How do pre-loaded app installs (PAI) work?',
    answer: 'Pre-loaded App Installs (PAI) bundle your app directly onto new devices at the factory level. When a user powers on their new phone, your app is already installed and ready to use. This format offers the highest reach and lowest friction of any UA channel — zero download required, zero app store competition, and the app appears alongside the device\'s core apps.',
  },
  {
    question: 'Which Android OEM partners are available for advertising?',
    answer: 'Major OEM advertising partners include Samsung (Galaxy Store, Samsung Daily), Xiaomi (GetApps, Mi Browser), Oppo (App Market, Theme Store), Vivo (V-appstore), Huawei (AppGallery), Realme, OnePlus, and carrier partners like T-Mobile, Verizon, and AT&T. Together these cover 3B+ active Android users globally, with particularly strong reach in APAC, LATAM, and EMEA.',
  },
  {
    question: 'How much cheaper is OEM advertising vs social media ads?',
    answer: 'OEM advertising typically offers 40-60% lower CPMs compared to Meta and Google Ads because the inventory is less competitive and ad fatigue is minimal. OEM placements appear in clean, uncluttered system environments where your brand stands out. Combined with precise device-level targeting (model, carrier, region), OEM campaigns deliver consistently higher ROAS than congested social platforms.',
  },
];

export const ASA_FAQ = [
  {
    question: 'How do Apple Search Ads and ASO work together?',
    answer: 'Apple Search Ads (ASA) and App Store Optimization (ASO) create a powerful intelligence loop: ASA reveals which keywords convert best through paid testing, and those winning keywords are fed into your app metadata (title, subtitle, keyword field) to boost organic rankings. Conversely, strong organic visibility from ASO lowers your ASA CPAs because Apple rewards relevance. This "Halo Effect" means combined spend is more efficient than either channel alone.',
  },
  {
    question: 'What is a Custom Product Page on the App Store?',
    answer: 'Custom Product Pages (CPPs) let you create up to 35 unique versions of your App Store listing, each with different screenshots, preview videos, and promotional text. When linked to specific ASA keyword groups, CPPs match search intent precisely — a user searching "puzzle games" sees puzzle-focused screenshots, while "multiplayer games" shows social gameplay. This relevance boost increases conversion rates by 20-40%.',
  },
  {
    question: 'How do you defend brand keywords on the App Store?',
    answer: 'Brand defense requires bidding on your own brand name and common misspellings to maintain 90%+ Share of Voice (SOV). Without active defense, competitors can bid on your brand terms and steal up to 30% of your high-intent traffic. Combine defensive bidding with optimized ASO so your organic listing also appears strong, creating a double presence that crowds out competitors.',
  },
  {
    question: 'What is the ASA-ASO Halo Effect?',
    answer: 'The Halo Effect is the phenomenon where running Apple Search Ads campaigns boosts your organic App Store rankings — even for keywords you\'re not bidding on. Increased paid visibility drives more installs, which Apple\'s algorithm interprets as growing popularity, lifting your organic position. Studies show a well-run ASA campaign can increase organic installs by 10-20% as a secondary benefit.',
  },
];
