import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AIPageBrief } from '../../../../components/AIPageBrief';
import { ActionButton } from '../../../../components/ActionButton';
import { CompetitorDiscoveryExperience } from '../../../../components/CompetitorDiscoveryExperience';
import { ConfidenceBadge, Freshness, QualityMeter } from '../../../../components/IntelligenceUI';
import { Sidebar } from '../../../../components/Sidebar';
import { isSupabaseConfigured } from '../../../../lib/config';
import { isDiscoveryConfigured } from '../../../../lib/competitors/discovery';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { refreshStoreProfile } from '../../../actions/competitors';

export const maxDuration = 120;
type CompetitorsSearchParams = {
  error?: string;
  added?: string;
  discovered?: string;
  profile?: string;
};

export default async function Competitors({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<CompetitorsSearchParams>;
}) {
  const { id } = await params;
  const q = await searchParams;

  if (!isSupabaseConfigured) redirect('/dashboard');

  const supabase = await createSupabaseServerClient();
  const { data: researchSessions } = await supabase
    .from('research_sessions')
    .select('id,status,quality_score,metrics,research_brief,search_plan,started_at,completed_at,error')
    .eq('project_id', id)
    .order('started_at', { ascending: false })
    .limit(5);

  const { data: project } = await supabase
    .from('projects')
    .select(
      'id,name,stores(id,url,name,profile,profile_updated_at),competitors(id,name,store_url,classification,match_score,confidence_score,source,status,evidence,profile,signals,created_at)',
    )
    .eq('id', id)
    .maybeSingle();

  if (!project) notFound();

  const store: any = Array.isArray((project as any).stores)
    ? (project as any).stores[0]
    : (project as any).stores;
  const profile = store?.profile || {};
  const allCompetitors = [...((project as any).competitors || [])];
  const competitors = allCompetitors
    .filter((c: any) => {
      const source = String(c.source || '');
      const manual = source === 'manual' || source.startsWith('manual:');
      const verifiedAutomatic = source.startsWith('auto:') && c.status === 'validated' && c.classification === 'Local Direct';
      return manual || verifiedAutomatic;
    })
    .sort((a: any, b: any) => (b.match_score || 0) - (a.match_score || 0));
  const refresh = refreshStoreProfile.bind(null, id);
  const localCount = competitors.filter((c: any) =>
    String(c.classification || '').toLowerCase().includes('local'),
  ).length;
  const avgConfidence = competitors.length
    ? Math.round(
        competitors.reduce(
          (total: number, c: any) => total + Number(c.confidence_score || 0),
          0,
        ) / competitors.length,
      )
    : 0;
  const taxonomyConfidence = Number(profile.taxonomyConfidence || 0);
  const storeUnderstandingQuality = Math.round(
    (Number(profile.marketConfidence || 0) +
      taxonomyConfidence +
      (profile.priceMedian ? 80 : 25)) /
      3,
  );

  return (
    <main className="shell">
      <Sidebar projectId={id} />

      <section className="workspace">
        <header className="pageHeader">
          <div>
            <p className="eyebrow">{project.name.toUpperCase()} / COMPETITORS</p>
            <h1>Competitor Intelligence</h1>
            <p className="muted">
              Local market first, then regional references. Industry similarity alone is never enough for a direct competitor
            </p>
          </div>
          <Link className="ghost" href={`/projects/${id}`}>
            Overview
          </Link>
        </header>

        <AIPageBrief
          projectId={id}
          title="Competitor intelligence"
          question="Analyze my validated competitor set. Which competitors are truly direct, what makes them relevant, and what competitive gaps matter most?"
        />

        {q.error && <p className="alert error" role="alert">{q.error}</p>}
        {q.added && <p className="alert success">Competitor validated and saved</p>}
        {q.profile && <p className="alert success">Store understanding refreshed</p>}
        {q.discovered && (
          <p className="alert success" data-discovery-feedback>
            Discovery completed. Only competitors that passed the strict Local Direct evidence gate were saved
          </p>
        )}

        <div className="qualityGate">
          <div>
            <span>Validated set quality</span>
            <strong>{competitors.length ? `${avgConfidence}%` : '—'}</strong>
          </div>
          <div>
            <span>Local market matches</span>
            <strong>
              {localCount}/{competitors.length || 0}
            </strong>
          </div>
          <div>
            <span>Taxonomy confidence</span>
            <strong>{taxonomyConfidence ? `${taxonomyConfidence}%` : '—'}</strong>
          </div>
        </div>

        <CompetitorDiscoveryExperience
          projectId={id}
          competitors={competitors}
          configured={isDiscoveryConfigured()}
          researchSessions={(researchSessions || []) as any[]}
          marketCard={
            <article className="panel marketPanel">
              <div className="panelhead">
                <div>
                  <p className="eyebrow">YOUR STORE</p>
                  <h2>Market understanding</h2>
                  <Freshness value={store?.profile_updated_at} />
                </div>
                <form action={refresh}>
                  <ActionButton className="ghost" pendingLabel="Refreshing…">
                    Refresh profile
                  </ActionButton>
                </form>
              </div>

              <div className="marketHero">
                <div>
                  <span>Primary market</span>
                  <strong>{profile.primaryMarket || 'Not proven'}</strong>
                  <ConfidenceBadge
                    value={profile.marketConfidence}
                    label="market confidence"
                  />
                </div>
                <div>
                  <span>Currency</span>
                  <strong>{profile.currencies?.[0] || '—'}</strong>
                  <small>{profile.languageFamily || 'Language unknown'}</small>
                </div>
              </div>

              <dl className="facts">
                <div>
                  <dt>Platform</dt>
                  <dd>{profile.platform || 'Unknown'}</dd>
                </div>
                <div>
                  <dt>Shipping markets</dt>
                  <dd>{profile.shippingMarkets?.join(', ') || 'Not proven'}</dd>
                </div>
                <div>
                  <dt>Price range</dt>
                  <dd>
                    {profile.priceMedian
                      ? `${profile.currencies?.[0] || ''} ${profile.priceMin ?? '—'} – ${profile.priceMax ?? '—'}`
                      : 'Not proven'}
                  </dd>
                </div>
                <div>
                  <dt>Categories</dt>
                  <dd>
                    {profile.categories?.slice(0, 6).join(', ') || 'Run profile analysis'}
                    {profile.taxonomyConfidence
                      ? ` · ${profile.taxonomyConfidence}% taxonomy confidence`
                      : ''}
                  </dd>
                </div>
              </dl>

              <QualityMeter
                label="Store understanding quality"
                value={storeUnderstandingQuality}
                note="Combines market, taxonomy and pricing evidence"
              />

              {profile.marketEvidence?.length > 0 && (
                <div className="evidenceChips compactChips">
                  {profile.marketEvidence.map((evidence: string) => (
                    <span key={evidence}>{evidence}</span>
                  ))}
                </div>
              )}
            </article>
          }
        />
      </section>
    </main>
  );
}
