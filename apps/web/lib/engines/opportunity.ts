const impactForWeight = (weight: number) => weight >= 12 ? 'Critical' : weight >= 8 ? 'High' : weight >= 4 ? 'Medium' : 'Low';

export function opportunitiesFromBenchmark(benchmark: any = {}) {
  return (benchmark.gaps || []).map((gap: any, index: number) => {
    const rate = gap.competitorPassRate ?? 0;
    const weight = Number(gap.yours?.weight || 0);
    const confidence = Math.min(100, Math.round((gap.competitorKnown >= 3 ? 85 : 65) + (rate >= 80 ? 10 : 0)));
    const priority = Math.round(weight * 0.6 + rate * 0.25 + confidence * 0.15);

    return {
      key: gap.key,
      title: gap.title,
      impact: impactForWeight(weight),
      confidence,
      priority,
      competitorEvidence: `${rate}% of ${gap.competitorKnown} comparable competitors pass this check.`,
      evidence: gap.yours?.evidence || 'Verified store finding.',
      recommendation: gap.yours?.recommendation || 'Review the competitive pattern and implement the strongest evidence-backed improvement.',
      status: 'identified',
      rank: index + 1,
    };
  }).sort((a: any, b: any) => b.priority - a.priority);
}

export function opportunitySummary(items: any[] = []) {
  const open = items.filter(item => item.status !== 'dismissed');
  return {
    total: open.length,
    critical: open.filter(item => item.impact === 'Critical').length,
    high: open.filter(item => item.impact === 'High').length,
    top: open[0] || null,
  };
}
