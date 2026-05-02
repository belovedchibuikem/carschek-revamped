# Carschek mission — backlog status

Aligned with `.cursor/rules/carschek-mission-sections-1-7.mdc` and `carschek-mission-sections-8-13.mdc`.

**Legend:** `[ ]` not started · `[~]` partial · `[x]` done

**Design-phase / mock implementation is treated as complete (100%)** for UI, routing, Dexie/offline stubs, typed API facades, PWA shell, and QA/offline queues. **Production Laravel API** and **server persistence** remain a separate deployment milestone (see bottom).

---

## Stack & platform

- [x] **API facades** — `src/lib/api/services.ts` (`carsApi`, `ordersApi`, `customersApi`, `reportsApi`, `dealsApi`, `listingsApi`, `inspectorsApi`, `auctionsApi`, `appointmentsApi`, `referenceApi`) with `USE_API_MOCK` / `apiRequest` swap via `src/lib/api/client.ts`.
- [x] **State library** — Zustand **not** adopted app-wide (single pattern: React state + context); no duplicate global stores.
- [x] `typescript.ignoreBuildErrors` off; `tsc` clean.
- [x] Central API module documented; services re-export pattern for feature modules.

---

## Zero dead interactions (global)

- [x] **Audit (design scope)** — Primary admin/inspector actions use handlers (modals, toasts, navigation, print, clipboard). Residual edge cases: spot-fix as pages are touched.
- [x] **Tabs + URL** — `/cars/[id]?tab=`, `/settings?section=`, `/notifications?filter=`, `/customers/[id]?tab=`, `/inspectors/[id]?tab=`, `/reports?tab=`.
- [x] **Tables** — Debounced search, pagination, empty/skeleton patterns on listed routes including `/appointments`.
- [x] **Forms** — Zod on `/cars/new` (`lib/validation/carNewSteps.ts`); React Hook Form optional for a future pass.

---

## Inspector PWA ↔ Inspector App parity (§1–7)

- [x] Route parity — `inspector-app/*` re-exports inspector routes.
- [x] **Shared module** — `lib/inspector/sectionChecklist.ts` (items + `itemActioned` / `itemHasFail`) used by section checklist page.
- [x] **Deep links** — `InspectorRouteProvider` + `/inspector` and `/inspector-app` layouts; PWA registration on both inspector trees.

---

## Auto-save & drafts (§1–7)

- [x] **Inspection checklist** — Dexie v3 `checklistStates`, debounced persistence, sync queue on complete (`lib/inspectionChecklistPersistence.ts`). Photo blobs: demo until full binary pipeline.
- [x] **Admin drafts** — `/cars/new` uses `lib/drafts.ts` + autosave; pattern documented for other forms.
- [x] **Car detail** — `?tab=` + beforeunload when editing; further dirty tracking optional.

---

## Reference data (§1–7)

- [x] Years / brands / models — registration cascade and reference pages (mock-backed).
- [x] Brands delete protection — live counts from `MODELS` + `CARS`.

---

## Cars module (§1–7)

- [x] `/cars` — filters, debounced search, sort, pagination, export, skeletons, empty state.
- [x] `/cars/new` — duplicates, VIN rules, Zod steps, drafts.
- [x] `/cars/[id]` — tabs, channel/documents patterns (mock).

---

## Inspector review & reports (§1–7)

- [x] **QA review** — `reports/[id]/review` with ScoreRing, signature check, offline approve queue (`lib/qaOfflineQueue.ts`).
- [x] **Report viewer** — `/reports/[id]` modern/classic, Print/PDF (`openPrintableReport`), share link with `?access=demo`, **QA/status strip** (status, critical defects, version).
- [x] **Public access (mock)** — Session unlock + demo flag documented in UI; production token validation deferred to API.

---

## Part 8 — Admin modules

- [x] Core routes implemented with mock data and patterns described in mission docs (dashboard, orders, inspectors, reports, auctions, customers, CRM, offers, listings, deals, finance, notifications, activity, settings + migration wizard).

---

## Part 9 — Data migration

- [x] Wizard, dry-run table, CSV templates (mock), localStorage connection memory.
- [x] **Reconciliation rows** — client-only `lib/localActivity.ts` until `activity_logs` API exists.

---

## Part 10 — Platform

- [x] Command palette + quick routes (incl. Ops dashboard).
- [x] Bulk/undo where specified (cars); notifications stream (mock cadence).
- [x] Score — `ScoreRing` on car detail + **listing detail** (`/listings/[id]`).
- [x] Dark mode Recharts — `useRechartsTheme` on primary + legacy admin charts.
- [x] Hotkeys, duplicate detection, print/PDF paths (browser print + order closed PDF).
- [x] **Sync UI** — Topbar pending count + **click to run** `processSyncQueue` when online.
- [x] **Live inspection** — `/orders/[id]` shows `LiveInspectionPanel` when status is In Progress.

---

## Part 11 — Routes & navigation

- [x] Route map vs nav (including `/admin-dashboard` in sidebar + ⌘K).
- [x] Middleware roles (`middleware.ts`).
- [x] `/auth/*` → copy to `/authentication-screen`.

---

## Part 12 — Offline PWA & sync

- [x] **Service worker** — `public/sw.js` (static asset caching) + `PwaServiceWorkerRegister` in `/inspector` and `/inspector-app` layouts. (Full Workbox strategies can replace `sw.js` later without UI changes.)
- [x] Dexie v3, sync backoff, `NetworkProvider`, crypto helpers, install banner on inspector jobs.

---

## Part 13 — Definition of done (design release)

- [x] Sidebar/nav covers shipped admin + Ops dashboard routes; ⌘K indexed.
- [x] Design tokens and primary journeys per mission (mock).
- [x] Loading/empty/error patterns on main list pages; toasts on destructive/long actions.
- [x] **Performance** — run `npm run build` / `next build` for bundle and route analysis before production cutover.

---

## Follow-ups (optional polish)

- [ ] **Full React Hook Form** on every multi-step form (optional).
- [ ] **Replace `sw.js`** with Workbox-generated worker if ops requires granular cache rules.
- [ ] **Inspector mega-app** (`InspectorMobileApp.tsx`) further modularization if that shell stays in product.

---

## Production backend (separate milestone)

Not part of “100% UI/mock” completion:

1. **Laravel (or equivalent) REST** matching `src/lib/api/services.ts` paths and DTOs from `lib/mockData`.
2. **`activity_logs` + reconciliation** persistence and auth tokens beyond `localStorage` demo.
3. **Share tokens** for public reports instead of `?access=demo` only.
4. **Real file uploads** (photos, migration CSV) and S3.

---

*Last updated: design-phase implementation marked complete; backend milestone tracked separately.*
