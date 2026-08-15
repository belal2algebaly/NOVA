# NOVA Extension Migration

This directory preserves NOVA v0.5.0 as the working Chrome client during Phase 1. The DOM collector still lives in `scanner.js`; shared scoring and report contracts now exist in platform packages and will be wired through an adapter in Phase 3 after the API contract is live. This avoids breaking the published scanning behavior during the platform migration.
