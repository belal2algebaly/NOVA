type AuditCheck = {
  key?: string;
  id?: string;
  title?: string;
  status?: string;
  weight?: number;
  evidence?: string | string[];
  recommendation?: string;
};

type AuditRun = {
  id?: string;
  name?: string;
  competitor_name?: string;
  report?: {checks?: AuditCheck[]};
  checks?: AuditCheck[];
};

const comparable = (status: string) => ['pass', 'fail', 'warn'].includes(String(status || '').toLowerCase());

function normalizeEvidence(evidence: AuditCheck['evidence']) {
  if (Array.isArray(evidence)) return evidence.filter(Boolean).join(' · ');
  return evidence || '';
}

export function normalizeCheck(check: AuditCheck = {}) {
  return {
    key: check.key || check.id || String(check.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: check.title || 'Untitled check',
    status: String(check.status || 'unknown').toLowerCase(),
    weight: Number(check.weight || 0),
    evidence: normalizeEvidence(check.evidence),
    recommendation: check.recommendation || '',
  };
}

export function benchmarkRuns(yourRun: AuditRun, competitorRuns: AuditRun[] = []) {
  const yours = (yourRun?.report?.checks || yourRun?.checks || []).map(normalizeCheck);
  const comps = competitorRuns.map((run, i) => ({
    id: run.id || `c${i}`,
    name: run.name || run.competitor_name || `Competitor ${i + 1}`,
    checks: (run.report?.checks || run.checks || []).map(normalizeCheck),
  }));

  const map = new Map<string, any>();
  for (const check of yours) {
    map.set(check.key, {key: check.key, title: check.title, yours: check, competitors: []});
  }

  for (const competitor of comps) {
    for (const check of competitor.checks) {
      if (!map.has(check.key)) {
        map.set(check.key, {key: check.key, title: check.title, yours: null, competitors: []});
      }
      map.get(check.key).competitors.push({name: competitor.name, ...check});
    }
  }

  const rows = [...map.values()].map(row => {
    const known = row.competitors.filter((item: any) => comparable(item.status));
    const passing = known.filter((item: any) => item.status === 'pass').length;
    const rate = known.length ? Math.round((passing / known.length) * 100) : null;
    const yourStatus = row.yours?.status || 'unknown';
    const gap = (yourStatus === 'fail' || yourStatus === 'warn') && rate != null && rate >= 60;
    return {...row, competitorPassRate: rate, competitorKnown: known.length, gap};
  });

  const gaps = rows.filter(row => row.gap).sort((a, b) => (b.yours?.weight || 0) - (a.yours?.weight || 0));
  const comparableRows = rows.filter(row => comparable(row.yours?.status) && row.competitorKnown > 0);
  const wins = comparableRows.filter(row => row.yours?.status === 'pass' && (row.competitorPassRate ?? 100) < 60).length;

  return {
    rows,
    gaps,
    wins,
    comparable: comparableRows.length,
    coverage: rows.length ? Math.round((comparableRows.length / rows.length) * 100) : 0,
  };
}
