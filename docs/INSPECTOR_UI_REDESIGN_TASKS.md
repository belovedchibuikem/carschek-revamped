# Inspector Mobile UI Redesign — Task TrackerReference: product mockups (overview, vehicle photos grid, damage photos + modal + camera + AI states, review, success, report preview, template picker).

## Completed (this pass)

- [x] **Task T1 — Task tracker** — This document; maps scope vs reference screens.
- [x] **Task T2 — Overview hub** — Single-scroll layout: navy hero (vehicle + timer + ring + stats), 3-column checklist cards, photo documentation cards with live counts; links to dedicated Vehicle / Damage flows.
- [x] **Task T3 — Vehicle photos screen** — Full-page layout: header, progress, info banner, numbered 2-column cards, per-slot Capture CTA, sticky footer CTA + back link (`presentation="page"`).
- [x] **Task T4 — Capture card copy** — `vehiclePhotoAngles.ts`: `VEHICLE_PHOTO_GRID_ORDER` + `vehiclePhotoCardTitle()` aligned to reference naming (11 angles).
- [x] **Task T5 — Order-level damage photos** — Dexie helpers `loadDamagePhotosForOrder` / `persistOrderHubDamagePhoto` (section `order`, keys `hub:…`).
- [x] **Task T6 — Damage photos hub screen** — List / empty / AI banner / add modal / camera / dark AI progress / result actions; hub routes for PWA + inspector-app.
- [x] **Task T7 — Camera modal** — Damage-oriented header: optional subtitle, `AI On` pill, dashed frame + “Position within frame” (closer to reference).
- [x] **Task T8 — Review screen** — Navy “Review & Submit” hero band, score + health label, 4-stat row, photo documentation summary strip, green primary submit CTA.

## Pending / follow-up

- [ ] **Task T9 — Report preview screen** — Match reference card (CARSCHEK header, gauge, category bars, critical alert, thumbs, share row, flag QA).
- [ ] **Task T10 — Template picker modal** — “Classic vs Modern” cards + selection persistence (ties to `ReportScreen` / PDF).
- [ ] **Task T11 — Submission success** — Dedicated route or inline state: green check, “Report Submitted!”, QA copy, “View Report Preview” (post-submit, not only toast).
- [ ] **Task T12 — Damage Dexie vNext** — Optional columns: `damageLabel`, `comment`, `aiSeverity` (avoid encoding in `itemKey`).
- [ ] **Task T13 — Real checklist metrics** — Replace heuristic “items done” / ETA with aggregated Dexie checklist state + timers.
- [ ] **Task T14 — Accessibility** — Focus order, aria labels on capture grid, reduced-motion for AI stepper.

## Notes

- **Admin (`/inspector-app`)** and **PWA (`/inspector`)** share the same screens via `InspectorRouteContext` + mirrored `app` routes.
- **Hub routes (both trees):** `inspect/[id]/vehicle-photos`, `inspect/[id]/damage-photos` (full-page `VehiclePhotos` + `DamagePhotosHubScreen`).
- Design tokens: navy `#1E3A5F`, accent `#2E75B6`, success `#1A7A4A`, danger `#C0392B`, warning `#D35400`, amber AI banners.
