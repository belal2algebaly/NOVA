declare module '@nova/benchmark-engine' { export function benchmarkRuns(yourRun:any, competitorRuns:any[]):any; }
declare module '@nova/opportunity-engine' { export function opportunitiesFromBenchmark(benchmark:any):any[]; export function opportunitySummary(items:any[]):any; }
