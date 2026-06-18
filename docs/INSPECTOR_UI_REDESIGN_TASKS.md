# Inspector Mobile UI Redesign — Task Tracker

Reference: product mockups (overview, vehicle photos grid, damage photos + modal + camera + AI states, review, success, report preview, template picker).

**Last updated:** 2026-06-12  
**Overall progress:** 14 / 14 core inspector UI tasks complete

---

## Progress summary

| ID | Task | Status | Notes |
|----|------|--------|-------|
| T1 | Task tracker | ✅ Done | This document |
| T2 | Overview hub | ✅ Done | Navy hero, checklist grid, photo cards |
| T3 | Vehicle photos screen | ✅ Done | Full-page capture grid |
| T4 | Capture card copy | ✅ Done | `vehiclePhotoAngles.ts` |
| T5 | Order-level damage photos | ✅ Done | Dexie hub helpers |
| T6 | Damage photos hub | ✅ Done | Capture-first → name/description |
| T7 | Camera modal | ✅ Done | AI badge, guide overlay |
| T8 | Review screen | ✅ Done | Live Dexie metrics + submit |
| T9 | Report preview card | ✅ Done | `ReportPreviewSummary` on report screen |
| T10 | Template picker | ✅ Done | `ReportFormatPicker` + Dexie persistence |
| T11 | Submission success | ✅ Done | `/inspect/[id]/success` (PWA + app) |
| T12 | Damage Dexie v7 | ✅ Done | `damageLabel`, `comment`, `aiSeverity` |
| T13 | Real checklist metrics | ✅ Done | `checklistMetrics.ts` |
| T14 | Accessibility | ✅ Done | Aria labels, reduced-motion AI |

---

## Completed (detail)

- [x] **T1 — Task tracker** — Maps scope vs reference screens; progress table above.
- [x] **T2 — Overview hub** — Single-scroll layout: hero (vehicle + timer + ring + stats), 3-column checklist cards, photo documentation cards with live counts.
- [x] **T3 — Vehicle photos screen** — Full-page layout: header, progress, numbered cards, sticky footer (`presentation="page"`).
- [x] **T4 — Capture card copy** — `VEHICLE_PHOTO_GRID_ORDER` + `vehiclePhotoCardTitle()` (11 angles).
- [x] **T5 — Order-level damage photos** — `loadDamagePhotosForOrder` / `persistOrderHubDamagePhoto` (section `order`).
- [x] **T6 — Damage photos hub** — Capture-first flow (camera → name + description); inline AI on details sheet; comments on list + report PDF.
- [x] **T7 — Camera modal** — Damage header, `AI On` pill, dashed frame overlay.
- [x] **T8 — Review screen** — Score ring, pass/fail/NA from Dexie, real defects list, photo strip, signature, submit.
- [x] **T9 — Report preview** — `ReportPreviewSummary`: logo, gauge, category bars, critical alert, OK/NOT OK thumbs, Share + Flag QA shortcuts above full document.
- [x] **T10 — Template picker** — `ReportFormatPicker` (Modern vs Classic); persisted via `reportFormatStore` + Dexie; toggle on report toolbar after selection.
- [x] **T11 — Submission success** — `SubmissionSuccessScreen` at `/inspector/inspect/[id]/success` and `/inspector-app/inspect/[id]/success`; review submit redirects here (not toast-only).
- [x] **T12 — Damage Dexie v7** — Schema v7: `damageLabel`, `comment`, `aiSeverity` on `damagePhotos`; label preferred over parsing `itemKey`.
- [x] **T13 — Real checklist metrics** — `loadInspectionChecklistMetrics()` aggregates Dexie checklist + photos; drives Overview hero stats and Review pass/fail/defects/score.
- [x] **T14 — Accessibility** — `usePrefersReducedMotion` for AI spinner; aria on review photo strip, damage hub status, report preview score ring.

---

## Key files (this pass)

| Area | Path |
|------|------|
| Checklist metrics | `src/lib/inspection/checklistMetrics.ts` |
| Overview | `src/components/inspection/screens/OverviewScreen.tsx` |
| Review + submit | `src/components/inspection/screens/ReviewScreen.tsx` |
| Success | `src/components/inspection/screens/SubmissionSuccessScreen.tsx` |
| Report preview | `src/components/inspection/ReportPreviewSummary.tsx` |
| Format picker | `src/components/inspection/ReportFormatPicker.tsx` |
| Report shell | `src/components/inspection/ReportScreen.tsx` |
| Damage hub | `src/components/inspection/screens/DamagePhotosHubScreen.tsx` |
| Dexie schema | `src/lib/db/schema.ts` (v7) |
| A11y hook | `src/hooks/usePrefersReducedMotion.ts` |

---

## Routes (PWA ↔ inspector-app parity)

| Flow | PWA | Inspector app |
|------|-----|---------------|
| Overview | `/inspector/inspect/[id]/overview` | `/inspector-app/inspect/[id]/overview` |
| Vehicle photos | `…/vehicle-photos` | `…/vehicle-photos` |
| Damage photos | `…/damage-photos` | `…/damage-photos` |
| Review | `…/review` | `…/review` |
| **Success** | `…/success` | `…/success` |
| Report | `…/report` | `…/report` |

---

## Notes

- **Admin (`/inspector-app`)** and **PWA (`/inspector`)** share screens via `InspectorRouteContext` + mirrored routes.
- Design tokens: navy `#1E3A5F`, accent `#2E75B6`, success `#1A7A4A`, danger `#C0392B`, warning `#D35400`, orange `#ff5722`.
- Broader Carschek mission items (admin modules, migration wizard, PWA sync queue UI, etc.) are tracked separately in `.cursor/rules/carschek-mission-sections-*.mdc`.

---

## Verification checklist

- [ ] Complete an inspection through overview → sections → damage (capture first) → review → submit → success → report PDF
- [ ] Confirm overview section dots match checklist progress after saving sections
- [ ] Confirm review shows real defects (not mock data)
- [ ] Download coloured valuation PDF from `/vehicle-valuation`
- [ ] Test reduced motion: OS setting on → AI spinner static on damage details sheet
