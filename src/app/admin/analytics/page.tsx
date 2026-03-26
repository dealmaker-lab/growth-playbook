import { cookies } from 'next/headers';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import LoginForm from './LoginForm';
import { FunnelChart, SectionChart } from './AdminCharts';

/* ---------- Types ---------- */
interface Lead {
  email: string;
  source: string | null;
  utm_source: string | null;
  created_at: string | null;
}

interface AnalyticsRow {
  event_type: string;
  section: string | null;
  created_at: string | null;
}

/* ---------- Data Fetching ---------- */
async function getLeadStats(supabase: ReturnType<typeof createSupabaseAdmin>) {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).toISOString();
  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - now.getDay()
  ).toISOString();

  const [totalRes, weekRes, todayRes] = await Promise.all([
    supabase
      .from('playbook_leads')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('playbook_leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfWeek),
    supabase
      .from('playbook_leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfToday),
  ]);

  return {
    total: totalRes.count ?? 0,
    thisWeek: weekRes.count ?? 0,
    today: todayRes.count ?? 0,
  };
}

async function getFunnelData(
  supabase: ReturnType<typeof createSupabaseAdmin>
) {
  const { data, error } = await supabase
    .from('playbook_analytics')
    .select('event_type, section');

  if (error || !data) return [];

  const rows = data as AnalyticsRow[];

  const pageViews = rows.filter((r) => r.event_type === 'page_view').length;
  const reachedGate = rows.filter(
    (r) => r.event_type === 'section_view' && r.section === 'gate'
  ).length;
  const unlocked = rows.filter((r) => r.event_type === 'gate_unlock').length;
  const reachedCh4 = rows.filter(
    (r) => r.event_type === 'section_view' && r.section === 'ch4'
  ).length;
  const usedCalc = rows.filter(
    (r) => r.event_type === 'calculator_use'
  ).length;
  const ctaClick = rows.filter((r) => r.event_type === 'cta_click').length;

  return [
    { label: 'Page Views', count: pageViews },
    { label: 'Reached Gate', count: reachedGate },
    { label: 'Unlocked', count: unlocked },
    { label: 'Reached Ch4', count: reachedCh4 },
    { label: 'Used Calculator', count: usedCalc },
    { label: 'Clicked CTA', count: ctaClick },
  ];
}

async function getRecentLeads(
  supabase: ReturnType<typeof createSupabaseAdmin>
) {
  const { data, error } = await supabase
    .from('playbook_leads')
    .select('email, source, utm_source, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return [];
  return (data as Lead[]) ?? [];
}

async function getTopSections(
  supabase: ReturnType<typeof createSupabaseAdmin>
) {
  const { data, error } = await supabase
    .from('playbook_analytics')
    .select('section')
    .eq('event_type', 'section_view')
    .not('section', 'is', null);

  if (error || !data) return [];

  const counts: Record<string, number> = {};
  for (const row of data as { section: string }[]) {
    counts[row.section] = (counts[row.section] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([section, count]) => ({ section, count }))
    .sort((a, b) => b.count - a.count);
}

/* ---------- Helpers ---------- */
function formatDate(iso: string | null): string {
  if (!iso) return '--';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ---------- Page Component ---------- */
export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get('admin_session')?.value === '1';

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const supabase = createSupabaseAdmin();
  const [stats, funnel, leads, sections] = await Promise.all([
    getLeadStats(supabase),
    getFunnelData(supabase),
    getRecentLeads(supabase),
    getTopSections(supabase),
  ]);

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>Playbook Analytics</h1>
          <p style={styles.headerSub}>
            Growth Playbook lead capture and engagement data
          </p>
        </div>
        <a href="/" style={styles.backLink}>
          &larr; Back to Playbook
        </a>
      </header>

      {/* Lead Stats Cards */}
      <section style={styles.cardRow}>
        <StatCard label="Total Leads" value={stats.total} color="#26BE81" />
        <StatCard label="This Week" value={stats.thisWeek} color="#af9cff" />
        <StatCard label="Today" value={stats.today} color="#00c4c4" />
      </section>

      {/* Charts Row */}
      <div style={styles.chartsRow}>
        {/* Lead Funnel */}
        <section style={styles.chartCard}>
          <h2 style={styles.h2}>Lead Funnel</h2>
          <div style={{ height: '300px' }}>
            <FunnelChart steps={funnel} />
          </div>
        </section>

        {/* Top Sections */}
        <section style={styles.chartCard}>
          <h2 style={styles.h2}>Top Sections Viewed</h2>
          <div style={{ height: '300px' }}>
            <SectionChart sections={sections} />
          </div>
        </section>
      </div>

      {/* Recent Leads Table */}
      <section style={styles.tableCard}>
        <h2 style={styles.h2}>Recent Leads</h2>
        {leads.length === 0 ? (
          <p style={styles.empty}>No leads captured yet.</p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Source</th>
                  <th style={styles.th}>UTM Source</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr key={i} style={i % 2 === 0 ? styles.trEven : undefined}>
                    <td style={styles.td}>{lead.email}</td>
                    <td style={styles.td}>{lead.source || '--'}</td>
                    <td style={styles.td}>{lead.utm_source || '--'}</td>
                    <td style={styles.tdDate}>{formatDate(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------- Stat Card ---------- */
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div style={styles.statCard}>
      <div
        style={{
          ...styles.statDot,
          background: color,
          boxShadow: `0 0 12px ${color}40`,
        }}
      />
      <p style={styles.statValue}>{value.toLocaleString()}</p>
      <p style={styles.statLabel}>{label}</p>
    </div>
  );
}

/* ---------- Styles ---------- */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#F5F7F9',
    padding: '32px 40px 64px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'var(--font-b)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap' as const,
    gap: '16px',
  },
  h1: {
    fontSize: '26px',
    fontWeight: 700,
    color: '#222',
    margin: 0,
    fontFamily: 'var(--font-h)',
  },
  headerSub: {
    fontSize: '14px',
    color: '#666',
    margin: '4px 0 0',
  },
  backLink: {
    fontSize: '13px',
    color: '#26BE81',
    fontWeight: 600,
    textDecoration: 'none',
  },

  /* Stat Cards */
  cardRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    background: '#fff',
    borderRadius: '14px',
    padding: '28px 24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    textAlign: 'center' as const,
  },
  statDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    margin: '0 auto 12px',
  },
  statValue: {
    fontSize: '36px',
    fontWeight: 700,
    color: '#222',
    margin: '0 0 4px',
    fontFamily: 'var(--font-h)',
  },
  statLabel: {
    fontSize: '13px',
    color: '#999',
    fontWeight: 500,
    margin: 0,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },

  /* Charts */
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  chartCard: {
    background: '#fff',
    borderRadius: '14px',
    padding: '28px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  h2: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#222',
    margin: '0 0 20px',
    fontFamily: 'var(--font-h)',
  },

  /* Table */
  tableCard: {
    background: '#fff',
    borderRadius: '14px',
    padding: '28px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  tableWrap: {
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '14px',
  },
  th: {
    textAlign: 'left' as const,
    padding: '10px 16px',
    fontWeight: 600,
    fontSize: '12px',
    color: '#999',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    borderBottom: '1.5px solid #E8ECF1',
  },
  td: {
    padding: '12px 16px',
    color: '#222',
    borderBottom: '1px solid #F0F0F0',
  },
  tdDate: {
    padding: '12px 16px',
    color: '#666',
    fontSize: '13px',
    borderBottom: '1px solid #F0F0F0',
    whiteSpace: 'nowrap' as const,
  },
  trEven: {
    background: '#FAFBFC',
  },
  empty: {
    color: '#999',
    fontSize: '14px',
    textAlign: 'center' as const,
    padding: '32px 0',
  },
};
