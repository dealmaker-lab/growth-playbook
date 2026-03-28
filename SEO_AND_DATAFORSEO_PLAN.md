# SEO Overhaul + DataForSEO Integration Plan

**Status:** Ready to execute after team finalizes content
**Estimated effort:** 3 sessions (Phase 1: 2 sessions, Phase 2: 1 session)
**Priority order:** By SEO impact, zero-cost fixes first

---

## Pre-Flight: Current State Summary

| Item | Current | Problem |
|------|---------|---------|
| Gated content | `display:none` CSS class | Google can't index 75% of content |
| Pages | Single `/` page + `/calculator` | No individual chapter URLs to rank |
| Structured data | None | No rich results in SERPs |
| Headings | Brand-speak ("The Programmatic Engine") | Nobody searches for these phrases |
| Canonical tags | Missing | Risk of duplicate content |
| Alt text | Missing on most images | Accessibility + image SEO gap |
| Sitemap | 2 entries only | Doesn't reflect content depth |
| FAQs | None | Missing FAQ rich result opportunity |
| JSON-LD | None | No Article, FAQ, Breadcrumb, or Org schema |
| Component size | 1,420 lines in one file | Hard to maintain, bad for code splitting |

---

## PHASE 1: Critical SEO Fixes (Priority Order)

### Step 1: Make Gated Content Crawlable

**Files to modify:**
- `src/components/PlaybookContent.tsx` (lines ~915, gated wrapper)
- `src/styles/globals.css` (lines 254-255, `.gated-locked` class)

**What to do:**

1. Replace `display:none` gate with a blur overlay approach:

```css
/* OLD — kills SEO */
.gated-locked { display: none; }
.gated-locked.unlocked { display: block; }

/* NEW — content in DOM, visually gated */
.gated-locked {
  position: relative;
  max-height: 600px;
  overflow: hidden;
}
.gated-locked::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 300px;
  background: linear-gradient(transparent, var(--bg-primary));
  pointer-events: none;
}
.gated-locked.unlocked {
  max-height: none;
  overflow: visible;
}
.gated-locked.unlocked::after {
  display: none;
}
```

2. Add `data-nosnippet` attribute to gated sections (prevents Google showing previews of locked content while still indexing for ranking):

```tsx
<div id="gatedContent"
     data-nosnippet
     className={`gated-locked${gateUnlocked ? ' unlocked' : ''}`}>
```

3. Add `<noscript>` fallback with full text content at the bottom of the page as a safety net for crawlers that don't execute JS.

4. Move the email gate form ABOVE the gated content div so it's always visible regardless of gate state.

**Why this is Step 1:** Biggest SEO impact. 75% of content is currently invisible to Google. Zero cost, immediate effect.

---

### Step 2: Rewrite Headings for Search Intent

**File to modify:** `src/components/PlaybookContent.tsx`

**Heading rewrites (keep originals as styled subtitles below):**

| Location (line) | Current | SEO Heading | Subtitle (keep original) |
|---|---|---|---|
| ~614 | "The Programmatic Engine" | "How to Scale Mobile UA with Programmatic DSP in 2026" | The Programmatic Engine |
| ~651 | "Bidding and Scaling" | "Programmatic Bidding Strategy: From CPM to Predictive ROAS" | Bidding and Scaling |
| ~683 | "Creative Strategy: Targeting Through Psychology" | "Mobile Ad Creative Best Practices 2026" | Creative Strategy |
| ~923 | "Rewarded Models" | "Rewarded Playtime: The Value-Exchange Model Driving 3x Higher LTV" | Rewarded Models |
| ~974 | "Finding the 'Aha! Moment'" | "Rewarded Playtime by Game Genre: Strategies for Every Vertical" | Finding the 'Aha! Moment' |
| ~1057 | "OEM & On-Device Discovery" | "OEM User Acquisition: Reaching 3B+ Android Users Before the App Store" | OEM & On-Device Discovery |
| ~1121 | "Sophisticated Targeting" | "OEM Ad Targeting: Moving Beyond Demographics" | Sophisticated Targeting |
| ~1170 | "Apple Search Ads & ASO Synergy" | "Apple Search Ads + ASO: The Demand Capture Flywheel for Mobile Growth" | ASA & ASO Synergy |
| ~1179 | "Performance-Led Optimization" | "Apple Search Ads Optimization: CPA Targeting Beyond Installs" | Performance-Led Optimization |
| ~1223 | "Brand Protection & Share of Voice" | "Defending Your Brand Keywords on the App Store" | Brand Protection |

**Pattern for each heading:**
```tsx
<h2 id="ch1" className="chapter-heading">
  How to Scale Mobile UA with Programmatic DSP in 2026
</h2>
<p className="chapter-subtitle">The Programmatic Engine</p>
```

---

### Step 3: Add JSON-LD Structured Data

**File to create:** `src/components/StructuredData.tsx`
**File to modify:** `src/app/layout.tsx`

**Schema types to add:**

1. **TechArticle** (main playbook):
```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "2026 Mobile Growth Strategy Guide: DSP, Rewarded, OEM & ASA",
  "author": { "@type": "Organization", "name": "AppSamurai" },
  "publisher": {
    "@type": "Organization",
    "name": "AppSamurai",
    "logo": { "@type": "ImageObject", "url": "https://appsamurai.com/logo.png" }
  },
  "datePublished": "2026-01-15",
  "dateModified": "2026-03-28",
  "description": "The definitive strategy guide for scaling mobile user acquisition...",
  "image": "/hero-bg.png",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://growth-playbook-six.vercel.app/" }
}
```

2. **FAQPage** (per chapter, see Step 5)

3. **BreadcrumbList**:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "AppSamurai", "item": "https://appsamurai.com" },
    { "@type": "ListItem", "position": 2, "name": "Growth Playbook", "item": "https://growth-playbook-six.vercel.app/" },
    { "@type": "ListItem", "position": 3, "name": "ROI Calculator", "item": "https://growth-playbook-six.vercel.app/calculator" }
  ]
}
```

4. **Organization**:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AppSamurai",
  "url": "https://appsamurai.com",
  "logo": "https://appsamurai.com/logo.png",
  "sameAs": [
    "https://www.linkedin.com/company/appsamurai/",
    "https://twitter.com/appsamurai"
  ]
}
```

---

### Step 4: Add Missing SEO Elements

**Files to modify:**
- `src/app/layout.tsx` — canonical, meta robots, enhanced OG tags
- `src/components/PlaybookContent.tsx` — alt text, image lazy loading, heading hierarchy
- `src/app/calculator/page.tsx` — page-specific metadata

**Checklist:**

- [ ] Add canonical tag in layout.tsx metadata:
  ```ts
  alternates: { canonical: 'https://growth-playbook-six.vercel.app/' }
  ```
- [ ] Add meta robots:
  ```ts
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 }
  ```
- [ ] Add `alt` text to ALL `<img>` tags (currently ~20 images missing alt text)
- [ ] Add `loading="lazy"` to below-fold images (everything after hero)
- [ ] Verify heading hierarchy: one `<h1>` per page, chapters `<h2>`, sections `<h3>`
- [ ] Add calculator page metadata export:
  ```ts
  export const metadata = {
    title: 'Mobile UA ROI Calculator | AppSamurai Growth Playbook',
    description: 'Calculate your mobile user acquisition ROI across DSP, Rewarded, OEM, and ASA channels...',
    alternates: { canonical: 'https://growth-playbook-six.vercel.app/calculator' }
  }
  ```
- [ ] Add per-chapter OG tags (if chapters become separate pages)

---

### Step 5: Add FAQ Sections with Schema Markup

**File to create:** `src/components/FAQ.tsx`
**File to modify:** `src/components/PlaybookContent.tsx` (add FAQ after each chapter)

**Component pattern:**
```tsx
// FAQ.tsx
interface FAQItem { question: string; answer: string; }

export function FAQ({ items, chapterName }: { items: FAQItem[]; chapterName: string }) {
  return (
    <section className="faq-section" aria-label={`${chapterName} FAQ`}>
      <h3>Frequently Asked Questions</h3>
      {items.map((item, i) => (
        <details key={i}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
      {/* JSON-LD inline */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": items.map(item => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": { "@type": "Answer", "text": item.answer }
        }))
      })}} />
    </section>
  );
}
```

**FAQ content (16 questions across 4 chapters):**

**Chapter 1 — DSP:**
1. "What is programmatic mobile advertising?" → 2-3 sentence answer about DSPs, RTB, targeting
2. "How does predictive ROAS modeling work for mobile apps?" → Brief explanation of ML-based bid optimization
3. "What is mobile ad incrementality testing?" → Explain ghost bids, PSA holdouts
4. "How much does programmatic mobile advertising cost?" → CPM ranges, factors affecting cost

**Chapter 2 — Rewarded:**
1. "What is Rewarded Playtime in mobile gaming?" → Value-exchange model, how users earn rewards
2. "How does Rewarded Playtime compare to traditional user acquisition?" → LTV lift, retention improvement
3. "What is an offerwall and how does it monetize apps?" → Explain offerwall mechanics
4. "What LTV can you expect from Rewarded Playtime campaigns?" → Data-backed ranges by genre

**Chapter 3 — OEM:**
1. "What is OEM user acquisition for mobile apps?" → Pre-installed apps, device-level discovery
2. "How do pre-loaded app installs (PAI) work?" → Explain factory-level bundling
3. "Which Android OEM partners are available for advertising?" → Samsung, Xiaomi, Oppo, etc.
4. "How much cheaper is OEM advertising vs social media ads?" → Cost comparison data

**Chapter 4 — ASA:**
1. "How do Apple Search Ads and ASO work together?" → Keyword intelligence loop
2. "What is a Custom Product Page on the App Store?" → CPP explanation + ASA connection
3. "How do you defend brand keywords on the App Store?" → Brand bidding strategy
4. "What is the ASA-ASO Halo Effect?" → Organic uplift from paid search presence

---

### Step 6: Expand Sitemap

**File to modify:** `src/app/sitemap.ts`

```ts
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://growth-playbook-six.vercel.app';
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/#ch1`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/#ch2`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/#ch3`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/#ch4`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/calculator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];
}
```

> **Note:** If chapters become separate pages (`/dsp`, `/rewarded`, `/oem`, `/asa`), replace `/#ch1` etc. with full paths. Fragment URLs (`#ch1`) have limited SEO value — separate pages are strongly preferred.

---

### Step 7 (Optional but High Impact): Break Into Chapter Pages

**Decision needed from team:** Keep single-page scroll experience or split into chapter pages?

**If splitting (recommended for SEO):**

New route structure:
```
src/app/
├── page.tsx                   → Hub/landing (hero + stats + TOC + email gate)
├── dsp/page.tsx               → Chapter 1 full content
├── rewarded/page.tsx          → Chapter 2 full content
├── oem/page.tsx               → Chapter 3 full content
├── asa/page.tsx               → Chapter 4 full content
├── calculator/page.tsx        → Existing calculator
```

Each chapter page:
- Own `<title>` and `<meta description>` targeting that chapter's keywords
- Own JSON-LD `TechArticle` schema
- Breadcrumb navigation: Home > Growth Playbook > Chapter Name
- Previous/Next chapter links at bottom
- Email gate check: redirect to `/` if cookie not set (chapters require unlock)
- Share buttons with chapter-specific OG image

**Refactoring approach:**
1. Extract chapter content from `PlaybookContent.tsx` into separate components:
   - `src/components/chapters/ChapterDSP.tsx`
   - `src/components/chapters/ChapterRewarded.tsx`
   - `src/components/chapters/ChapterOEM.tsx`
   - `src/components/chapters/ChapterASA.tsx`
2. Create shared `ChapterLayout.tsx` with breadcrumbs, prev/next nav, gate check
3. Hub page (`/`) imports chapter teasers (first paragraph + "Read Chapter →" CTA)
4. Each chapter page imports its full chapter component

**If keeping single page (simpler, less SEO benefit):**
- Add defined `<section>` landmarks with proper `id` attributes
- Add `<article>` wrapper around each chapter
- Expand sitemap with fragment references (limited value)
- Use `ScrollSpy` to update URL hash as user scrolls

---

## PHASE 2: DataForSEO Integration

### Step 8: Build Keyword Volume Cache System

**Files to create:**
- `src/lib/dataforseo.ts` — API client
- `src/data/keyword-volumes.json` — Pre-populated cache
- `src/app/api/admin/refresh-keywords/route.ts` — Admin refresh endpoint

**DataForSEO client (`src/lib/dataforseo.ts`):**
```ts
const DATAFORSEO_LOGIN = 'marketing@appsamurai.com';
const DATAFORSEO_PASSWORD = 'bc183171c04a06e2';
const BASE_URL = 'https://api.dataforseo.com/v3';

const auth = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');

interface KeywordData {
  volume: number;
  cpc: number;
  competition: 'LOW' | 'MEDIUM' | 'HIGH';
  updatedAt: string;
}

export async function fetchKeywordVolumes(
  keywords: string[]
): Promise<Record<string, KeywordData>> {
  const response = await fetch(`${BASE_URL}/keywords_data/google_ads/search_volume/live`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{
      keywords,
      location_code: 2840, // United States
      language_code: 'en',
    }]),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) return {};

  const data = await response.json();
  const result: Record<string, KeywordData> = {};

  // Parse response into clean format
  for (const item of data?.tasks?.[0]?.result || []) {
    result[item.keyword] = {
      volume: item.search_volume ?? 0,
      cpc: item.cpc ?? 0,
      competition: item.competition_level ?? 'LOW',
      updatedAt: new Date().toISOString().split('T')[0],
    };
  }

  return result;
}
```

**Environment variables to add (.env):**
```
DATAFORSEO_LOGIN=marketing@appsamurai.com
DATAFORSEO_PASSWORD=bc183171c04a06e2
```

> **Security note:** Move credentials to env vars, never hardcode in source. The values above are for reference only.

**Seed keyword list (50 terms):**
```json
[
  "rewarded playtime", "mobile user acquisition", "programmatic mobile advertising",
  "mobile DSP", "OEM user acquisition", "app store optimization", "apple search ads",
  "mobile app retargeting", "offerwall monetization", "mobile ad creative",
  "incrementality testing mobile", "custom product pages", "SKAN attribution",
  "mobile gaming UA", "rewarded ads", "pre-loaded app installs",
  "mobile app LTV", "CPI mobile advertising", "demand side platform mobile",
  "app store keyword optimization", "mobile growth strategy 2026",
  "programmatic ROAS", "mobile ad fraud prevention", "in-app advertising",
  "mobile attribution", "deep linking mobile apps", "mobile retargeting strategy",
  "app install campaigns", "mobile programmatic buying", "rewarded video ads",
  "OEM advertising mobile", "Samsung Galaxy Store ads", "Xiaomi GetApps advertising",
  "Apple Search Ads optimization", "ASO keyword research", "app store ranking factors",
  "mobile UA cost benchmarks", "CPI by country mobile", "mobile gaming monetization",
  "casual game user acquisition", "hypercasual game marketing", "mobile ad creatives",
  "playable ads mobile", "endcard optimization", "mobile DSP vs social ads",
  "app store custom product pages", "mobile growth playbook", "UA channel mix strategy",
  "mobile advertising ROI", "cross-channel mobile marketing"
]
```

**Admin refresh endpoint (`src/app/api/admin/refresh-keywords/route.ts`):**
- Protected by same admin password as analytics dashboard
- POST request triggers full keyword refresh
- Writes to `src/data/keyword-volumes.json` or Supabase `playbook_keyword_cache` table
- Returns count of keywords refreshed + any errors
- Cost: ~$0.075 per refresh

---

### Step 9: Calculator Keyword Intelligence Section

**Files to create:**
- `src/components/calculator/KeywordInsights.tsx`
- `src/data/calculator-keywords.json`

**Pre-cached keyword data per app category (5 categories x 15 keywords):**

Using DataForSEO endpoint: `POST /dataforseo_labs/google/keyword_suggestions/live`

Seed queries per category:
- Gaming: `"mobile game"`, `"puzzle game"`, `"idle game"`, `"strategy game"`
- E-commerce: `"shopping app"`, `"e-commerce app"`, `"deals app"`
- FinTech: `"finance app"`, `"investment app"`, `"banking app"`
- Health & Fitness: `"fitness app"`, `"health tracker"`, `"workout app"`
- Utility: `"utility app"`, `"productivity app"`, `"vpn app"`

**KeywordInsights component:**
```tsx
// Shows after channel mix + CAC + ROAS results in calculator
// Reads from static JSON cache, zero API calls on page load
// Includes link: "Learn more about ASA keyword strategy in Chapter 4 →"
// Renders as a styled table with Volume, Difficulty, Opportunity columns
// "Opportunity" column: derived from volume/difficulty ratio
//   High volume + Low difficulty = "Hidden Gem"
//   High volume + High difficulty = "Brand Defense"
//   Low volume + Low difficulty = "Long-tail Win"
//   Medium anything = "Discovery"
```

**Refresh schedule:**
- Monthly via admin endpoint
- Cost: ~$0.25/month
- Graceful degradation: if cache missing, section doesn't render

---

## PHASE 3: WordPress Deployment Prep

### Step 10: Configure basePath for Reverse Proxy

**File to modify:** `next.config.ts`

```ts
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // ... existing config
};
```

**Vercel env var to set:**
```
NEXT_PUBLIC_BASE_PATH = /e-book/growth-playbook
```

This makes all internal links, assets, and API routes work under `/e-book/growth-playbook/`.

### Step 11: Update All Internal Links

After basePath is set, verify:
- Calculator link: `/calculator` → automatically becomes `/e-book/growth-playbook/calculator`
- Chapter links: `/#ch1` → becomes `/e-book/growth-playbook/#ch1`
- API routes: `/api/unlock` → becomes `/e-book/growth-playbook/api/unlock`
- Static assets: Next.js handles automatically with basePath

### Step 12: Update Canonical URLs

Update layout.tsx metadata to use the final WordPress URL:
```ts
metadataBase: new URL('https://appsamurai.com'),
alternates: {
  canonical: '/e-book/growth-playbook/'
}
```

### Step 13: Configure Reverse Proxy on WordPress Server

See `WORDPRESS_PROXY.md` in this repo for the full nginx/Apache config.

**Key proxy rule (nginx):**
```nginx
location /e-book/growth-playbook/ {
    proxy_pass https://growth-playbook-six.vercel.app/e-book/growth-playbook/;
    proxy_set_header Host growth-playbook-six.vercel.app;
    proxy_ssl_server_name on;
}
```

### Step 14: Post-Deploy Verification

Full checklist in `WORDPRESS_PROXY.md`. Key checks:
- All pages return 200
- API routes work through proxy
- Cookie sets correctly under appsamurai.com domain
- Static assets (images, fonts) load
- GA4 events fire under appsamurai.com
- OG previews show correct metadata when shared on LinkedIn/Twitter

---

## Supabase Schema Additions

### Table: `playbook_keyword_cache`

```sql
CREATE TABLE playbook_keyword_cache (
  id SERIAL PRIMARY KEY,
  keyword TEXT NOT NULL UNIQUE,
  category TEXT, -- 'playbook' or 'calculator-gaming', 'calculator-ecommerce', etc.
  volume INTEGER DEFAULT 0,
  cpc DECIMAL(10,2) DEFAULT 0,
  competition TEXT DEFAULT 'LOW',
  opportunity TEXT, -- derived: 'Hidden Gem', 'Brand Defense', 'Long-tail Win', 'Discovery'
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_keyword_cache_category ON playbook_keyword_cache(category);
```

---

## Cost Summary

| Item | One-Time | Monthly |
|------|----------|---------|
| Playbook keyword population | $0.075 | — |
| Playbook keyword refresh | — | $0.30 |
| Calculator category keywords | $0.25 | $0.25 |
| **Total** | **$0.33** | **$0.55** |

---

## Execution Order (When Ready)

```
Session 1: SEO Foundations
├── Step 1: Fix gated content visibility (biggest impact)
├── Step 2: Rewrite headings for search intent
├── Step 3: Add JSON-LD structured data
├── Step 4: Add missing SEO elements (canonical, alt, robots)
└── Commit + deploy + verify with Lighthouse

Session 2: FAQs + Sitemap + (Optional) Chapter Pages
├── Step 5: Add FAQ sections with schema markup
├── Step 6: Expand sitemap
├── Step 7: Break into chapter pages (if team decides yes)
└── Commit + deploy + verify with Rich Results Test

Session 3: DataForSEO + WordPress Prep
├── Step 8: Build keyword cache system
├── Step 9: Calculator keyword intelligence section
├── Step 10-12: basePath + canonical URL updates
├── Step 13-14: WordPress proxy config + verification
└── Commit + deploy + full E2E verification
```

---

## Decision Points for Team

Before execution, the team needs to decide:

1. **Single page vs. chapter pages?** (Step 7)
   - Chapter pages = much better SEO but changes the UX
   - Single page = simpler but limits keyword ranking potential

2. **Final WordPress URL path?**
   - Proposed: `appsamurai.com/e-book/growth-playbook/`
   - Or: `appsamurai.com/resources/growth-playbook/`
   - Or: `appsamurai.com/growth-playbook/`

3. **DataForSEO credentials location?**
   - Vercel env vars (recommended)
   - Or Supabase vault

4. **FAQ answer content?**
   - Claude drafts, team reviews
   - Or team writes answers directly

5. **Chapter-specific OG images?**
   - One hero-bg.png for all (current)
   - Or unique images per chapter (more work, better social sharing)
