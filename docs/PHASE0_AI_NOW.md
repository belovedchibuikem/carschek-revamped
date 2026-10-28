# Phase 0 — Complete (non-breaking)

Immediate engineering slice from the Carschek AI executive summary. Everything here is **additive**: existing valuation, inspection, and report flows keep working; new fields are optional.

## Checklist — finished

| Item | Status | Where to use |
|------|--------|----------------|
| GET feature snapshot | Done | `GET /inspections/{id}/feature-snapshot`; valuation form blurs Inspection ID to attach |
| AI baseline | Done | `/ai-training` + `GET /ai/baseline` |
| Scanner UI | Done | `/scanner-ingest` (paste contract JSON) |
| Training CSV | Done | Buttons on valuations, outcomes, and AI training pages |
| Parse helper | Done | Valuation description blur fills empty VIN/make/model/year/plate |
| List UX badges | Done | VIN / INS / Train / Snap on valuation table; VIN/inspection search |
| Outcomes columns | Done | Severity, cost, consent on `/vehicle-outcomes` |

## Supporting pieces also shipped

- Optional valuation linkage + training consent
- Auto-attach snapshot on valuation save when `inspectionId` is set (server + client)
- Feature snapshot on inspection submit (**best-effort**, outside core TX — never blocks submit)
- Outcome events API + UI
- Scanner ingest API + contract `docs/scanner-data-contract.v1.json`
- Sidebar: Vehicle Outcomes, AI Training, Scanner Ingest

## Ops: apply migration

When MySQL is up:

```bash
cd carschek-api
php artisan migrate --path=database/migrations/2026_10_28_190000_phase0_ai_data_foundation.php
```

Mock/frontend paths work without this.

## Still later (not Phase 0)

- Legal counsel sign-off on training use
- Real vision model / supervised ML training & serving
- Mandatory VIN on valuations
- China hardware pilot / scanner factory SOW
- Changing Carschek Score or report PDF for AI panels

## Compatibility rules

- Do **not** require VIN/inspection on existing valuation create.
- Do **not** change Carschek Score formula in this pass.
- Do **not** let Phase 0 tables block inspection submit.
- Mock mode (`USE_API_MOCK`) continues via localStorage.
