# Carschek AI — Executive Summary

**Document purpose:** Brief leadership and the CTO on what is required to launch predictive AI under Carschek (future fault foresight + valuation intelligence), what is already in place, what is missing, and the concrete CTO workstream.

**Strategic context:** Carschek may soon engage a China-based scanner/tracker manufacturer. Hardware must write data to a **Carschek-controlled local server** so that telemetry can later train proprietary models. Software readiness must start **before** hardware lands.

**Verdict:** Achievable. Carschek today is a strong **inspection + scoring + operations platform**, not a trained predictive AI. A credible “Carschek AI” brand requires a deliberate data pipeline, outcome labels, valuation linkage, and (for strong fault prediction) owned scanner/tracker signals.

---

## 1. Product goals

| Capability | Customer value | Nature |
|------------|----------------|--------|
| **Fault foresight** | Show likely future failures / risk areas from an inspected vehicle | Supervised learning + explainable risk scores |
| **Valuation intelligence** | Estimate market / FSV / condition value from known Carschek valuations and sales | Supervised regression / comps + condition features |
| **Hardware data moat** | Own scanner + tracker data on local servers → continuous training fuel | Device + gateway + ingest contract |

These are **two models (plus a data platform)**, not one switch to flip.

---

## 2. What is already in place

### Platform & product

- End-to-end inspection flows (admin + inspector PWA/app), checklist structure (S01–S27), severity, defects, photos, reports, Carschek score.
- Rule-based **Carschek Score** (weighted sections + severity penalties) — production-usable, not ML.
- Early **defect-hint / fail-rate style** statistics foundation (item × body type patterns).
- Valuation UI and API shapes: market value, FSV, condition value, notes, status.
- AI UI placeholders: photo defect-detect stub, AI inspector tools demo, optional LLM chat proxy — **not** trained Carschek models.
- Offline/PWA patterns and sync architecture suitable for field capture.
- Legacy historical inspections on the order of **~900** jobs (plus damage images, OBD *presence* toggles, free-text comments) — useful seed, not sufficient alone for strong “next fault” prediction.

### Organizational advantage

- Domain workflow already captures structured condition data at scale potential.
- Brand and distribution path (banks, dealers, customers) for AI-assisted reports and valuations.
- Clear hardware strategy: produce or co-brand scanner/tracker with **local server ownership**.

---

## 3. What is not in place (critical gaps)

| Gap | Why it blocks AI |
|-----|------------------|
| **Future-outcome labels** | No systematic record of what failed *after* inspection (repairs, re-inspects, warranty, customer reports, tracker alerts). Without labels, fault prediction cannot be trained honestly. |
| **Real OBD / scanner telemetry** | Current OBD is largely Yes/No checklist presence, not DTC codes, freeze-frame, live PIDs, or ECU dumps. |
| **Valuation ↔ vehicle linkage** | Many valuations are thin / free-text vehicle descriptions; not consistently joined to VIN, car ID, inspection ID, mileage, score, defect set. |
| **Observed market outcomes** | FSV often derived by ratio; sold-price / true market labels are sparse. |
| **Central training warehouse** | Inspection, valuation, sales, and (future) device data are not unified into an exportable ML-ready store with governance. |
| **Production vision model** | Photo “AI” is a stub/mock path, not a labeled vision pipeline. |
| **Device ingest contract** | No frozen schema for scanner → local server → Carschek cloud/warehouse. |
| **ML ops** | No model registry, evaluation harness, bias/region checks, human-in-the-loop sign-off for regulated clients (banks/insurance). |
| **Legal / consent / retention** | No formal policy for using inspection/device data for model training and customer-facing predictions. |
| **Sufficient labeled volume** | Hundreds of inspections support **v0 risk scores**; credible predictive models need thousands of inspections **plus** follow-up outcomes; valuation needs hundreds+ of **linked** priced cars. |

---

## 4. What must be done (work program)

### Phase 0 — Data foundation (start immediately)

1. Define and implement a **Carschek training warehouse** (or warehouse schema on existing API DB): inspections, items, severities, scores, photos metadata, cars, valuations, sales, devices, outcomes.
2. Enforce **identity keys**: VIN / chassis, `car_id`, `inspection_id` on every valuation and outcome event.
3. Introduce **outcome capture**: repair events, re-inspection deltas, customer-reported failures, tracker alerts, warranty claims (even manual CSV upload at first).
4. Migrate / backfill legacy inspections into normalized item structure where feasible.
5. Draft **Scanner Data Contract** (JSON/MQTT): device_id, VIN, timestamp, DTCs, PID snapshot, freeze-frame, firmware, location optional — for China vendor negotiations.
6. Data governance: retention, consent flag for training use, PII handling, audit log of model training extracts.

### Phase 1 — AI-ready product (ship value without claiming full ML)

1. Customer-facing **“Observed risks”** on reports: explainable section/item risk from stats + rules + score (honest labeling: assisted insight, not guaranteed prediction).
2. **Valuation assistant**: comps + mileage/year/score/condition heuristics; valuator remains accountable.
3. Replace photo defect stub with a real vision assist (third-party or open model) under Carschek UX — still human-confirmed.
4. Instrument everything for later training (feature snapshots at report finalize).

**Status:** Implemented as non-breaking assisted UX — see `docs/PHASE1_AI_READY.md` (flags + stub fallback).

### Phase 2 — Train Carschek models

1. **Valuation model v0** first (cleaner labels once Phase 0 linkage exists).
2. **Fault risk classifiers** once minimum outcome volume is met (by system: engine, transmission, suspension, electrical, etc.).
3. Serve via Carschek API; UI shows confidence + drivers (“why this risk”).
4. Evaluation: holdout sets by brand/year/region; ban silent model deploy for bank/insurance flows without QA threshold.

### Phase 3 — Own scanner + tracker

1. Factory engagement: white-label / Carschek-branded units.
2. **Local server / on-prem gateway** mandatory — raw + decoded data owned by Carschek.
3. Sync job: local server → warehouse → retraining cadence.
4. Tracker continuous signals become the long-term label engine for fault foresight.

---

## 5. China scanner / tracker — non-negotiables for discussion

Require in writing:

- Carschek **owns** raw and decoded data; no lock-in to vendor-only cloud.
- **Local / on-prem server** or gateway with documented LAN API.
- Open protocol: VIN, DTCs, live PIDs, freeze-frame, ECU inventory, timestamps, firmware version.
- Export formats Carschek can ingest (JSON/CSV/MQTT).
- Sample datasets + pilot devices for Nigeria (or target market) fleet.
- White-label / branding path.
- Privacy, retention, and deletion rights.

Without these, Carschek rents insights; with them, Carschek trains **proprietary AI**.

---

## 6. Effort & timeline (order of magnitude)

| Workstream | Effort signal | Calendar (focused team) |
|------------|---------------|-------------------------|
| Phase 0 data foundation + contracts | 3–6 weeks engineering | ~1–1.5 months |
| Phase 1 risk + valuation assist (rules/stats + UX) | 4–8 weeks | ~2 months |
| Valuation model v0 (after clean labels) | 6–12 weeks data + ML + API + UI | ~2–3 months post–Phase 0 |
| Credible fault prediction | **6–18 months** outcome collection in parallel; 2–4 months model build once labels exist | Start labeling now |
| Scanner local-server integration | 2–4 months after API freeze | Parallel to vendor engagement |
| Full Carschek AI brand (fault + price + tracker loop) | Multi-quarter program | **12–24 months** realistic |

**Team shape (minimum):** CTO-led; 1 backend/data engineer; 1 product/engineering owner for report/valuation UX; ML support (internal or contractor) from Phase 2; legal/compliance review for training use of customer data.

---

## 7. CTO action list (accountable owner)

### Immediate (this quarter)

1. **Adopt this program as a formal initiative** with Phase 0–3 milestones and success metrics (e.g. % valuations linked to VIN/inspection; N outcome events/month; scanner contract signed).
2. **Freeze the Scanner Data Contract** draft before China meetings; bring it as a negotiation appendix.
3. **Commission Phase 0 schema** on Carschek API: warehouse tables or views; mandatory links on valuations; outcome event API + admin capture UI (even minimal).
4. **Stop treating mock AI as product AI** in external messaging; align sales/investor language to “AI-ready platform → Carschek AI.”
5. **Inventory real production data volume** (live DB counts: inspections, items with severity, valuations, sold prices) and report baseline to leadership.
6. **Decide hosting** for training extracts and future model serving (Carschek-controlled cloud vs on-prem; Nigeria data residency if required).
7. **Legal brief:** consent, training use, customer disclosure for predictive statements on reports.

### Vendor / China trip (CTO + commercial)

8. Lead technical due diligence with scanner manufacturers using the non-negotiables in Section 5.
9. Require a **pilot SOW**: N devices, local server image, sample logs, ingest proof into Carschek staging within 90 days of unit delivery.
10. Reject proposals that only offer vendor-cloud dashboards without raw export and local storage.

### Build ownership

11. Assign engineering owners for: (a) data warehouse & linkage, (b) report “observed risks” UX, (c) valuation assistant, (d) device ingest.
12. Define **Definition of Done for AI v0**: linked valuations ≥ agreed threshold; outcome pipeline live; risk panel on customer report; model card / limitations documented.
13. Establish **ML governance**: human sign-off for bank/insurance valuations; confidence thresholds; rollback plan.
14. Budget: Phase 0–1 engineering; Phase 2 ML contractor/GPU; Phase 3 hardware NRE + local servers (separate CapEx).
15. Quarterly review: data volume, label quality, model accuracy vs human valuators/inspectors — kill or double-down criteria.

### Explicit CTO deliverables (artifacts)

| Artifact | Owner | When |
|----------|-------|------|
| Scanner Data Contract v1 (PDF/JSON schema) | CTO | Before China visit |
| Phase 0 ERD + migration plan | CTO → Backend lead | Week 2–4 |
| Data baseline report (live counts + quality) | CTO | Week 1–2 |
| AI messaging guidelines (internal/external) | CTO + CEO/Marketing | Week 2 |
| Legal/training-use checklist | CTO + Counsel | Month 1 |
| Pilot vendor scorecard (China candidates) | CTO | During/after visit |
| Carschek AI roadmap (12–24 months) with KPIs | CTO | Month 1, then quarterly |

---

## 8. Risks if we skip foundations

- Claiming “AI prediction” without outcome labels creates **reputational and regulatory risk** with banks and insurers.
- Buying scanners without a data contract creates **vendor lock-in** and no training moat.
- Training only on unlinked valuations yields **unusable price models**.
- Photo stub AI presented as production capability erodes trust when accuracy is audited.

---

## 9. Recommended leadership decision

1. Approve **Phase 0 + Phase 1** now (software/data), independent of hardware timing.  
2. Treat China engagement as **data-ownership + local-server** procurement, not only device cost.  
3. Hold **full “Carschek AI” launch marketing** until valuation linkage and an honest risk product ship; use “AI-assisted / AI-ready” until models are evaluated.  
4. Make the **CTO accountable** for the action list in Section 7, with monthly status to the CEO.

---

## 10. One-line summary

**Carschek can become a proprietary vehicle AI company — but only if we first own clean, linked inspection + valuation + outcome data, and only if any China scanner writes that data to servers we control; the CTO must freeze the data contract, stand up the warehouse and outcome pipeline, and govern model claims until the labels and volume exist.**

---

## 11. Implementation status — Phase 0 **complete** (non-breaking)

See `docs/PHASE0_AI_NOW.md`. Finished checklist:

- GET feature snapshot + client attach on Inspection ID blur
- `/ai-training` baseline + CSV exports
- `/scanner-ingest` UI
- Training CSV on valuations / outcomes / AI training
- Description parse helper; list VIN/INS/Train/Snap badges
- Outcomes severity / cost / consent columns

**Still required outside this Phase 0 code:** run Phase 0 migration when MySQL is up; legal consent policy; China vendor pilot; actual model training (Phase 2).

*Internal planning document — Carschek. Update after live DB baseline and vendor shortlist.*
