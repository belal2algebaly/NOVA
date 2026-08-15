# NOVA 1.0 — Phase 3 Audit Engine

Implemented:
- Authenticated server-side URL scanning from a project.
- SSRF protection: local/private destinations are rejected after DNS resolution.
- HTML response validation, 15s timeout, redirect handling and bounded HTML processing.
- Automatic Homepage / PLP / PDP / Cart classification with confidence evidence.
- Evidence-first rule model with pass/warn/fail/review/unknown.
- PDP review rule distinguishes structured/actual evidence from review-language-only sections.
- Visual proximity (e.g. reviews near ATC) is explicitly Unknown in the server-only scanner rather than falsely passing.
- Score + evidence coverage persisted in audit_runs.report.
- Audit history and finding detail UI.
- Detected commerce platform written back to the connected store.

Not falsely claimed in Phase 3:
- No rendered browser screenshot capture yet. That needs a Playwright/browser worker and storage.
- No full-site crawler yet; this pass scans a requested page URL.
- No competitor discovery yet (Phase 4).
