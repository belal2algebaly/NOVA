# NOVA 1.0 Architecture

```text
Chrome Extension ─┐
                  ├─> NOVA API / shared contracts ─> PostgreSQL / Storage
Web Dashboard ────┘                 │
                                    └─> Scan Worker / Browser Automation
```

## Rules
1. The extension is a client, not the source of truth.
2. Audit scoring and recommendation ranking live in `packages/audit-engine`.
3. DOM collection remains browser-specific and will be progressively moved behind adapters.
4. Every finding carries status, evidence, confidence and optional weight.
5. `unknown` and `review` are never treated as passes.
6. Competitor match score and evidence confidence are separate values.
7. The web app must never display demo data as if it came from a completed live scan.
