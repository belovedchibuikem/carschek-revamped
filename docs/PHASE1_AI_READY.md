# Phase 1 — AI-ready product (non-breaking)

Assisted insights only. **No trained ML claims.** Existing inspection score, valuation create, and photo capture keep working if flags are off or providers fail.

## Shipped

| Item | Behavior | Kill switch |
|------|----------|-------------|
| **Observed risks** on reports | Rule-based from defects + score + section fail rates; disclaimer on report | `NEXT_PUBLIC_PHASE1_OBSERVED_RISKS=false` |
| **Valuation assistant** | Suggest market / FSV / condition; **Apply** button only — never silent overwrite | `NEXT_PUBLIC_PHASE1_VALUATION_ASSIST=false` |
| **Pricing guidance** | Same heuristic engine as valuation assist | (uses same helper) |
| **Vision assist** | Stub by default; optional OpenAI if `OPENAI_API_KEY` or `CARSCHEK_VISION_API_KEY`; human confirm required | `NEXT_PUBLIC_PHASE1_VISION_ASSIST=false` |
| **Instrumentation** | Feature snapshots (Phase 0) + report `observedRisks` payload for later training | — |

## Where to see it

- Inspection report (modern/classic) → **Observed risks (assisted)** section  
- `/vehicle-valuation` → New/Edit form → **Valuation assistant** panel  
- Listings → Pricing Guidance Tool → heuristic range + disclaimer  
- Damage photo capture → suggestion with Accept / Edit / Ignore  

## Provider setup (optional)

```env
# .env.local (Next)
NEXT_PUBLIC_PHASE1_OBSERVED_RISKS=true
NEXT_PUBLIC_PHASE1_VALUATION_ASSIST=true
NEXT_PUBLIC_PHASE1_VISION_ASSIST=true
OPENAI_API_KEY=           # or CARSCHEK_VISION_API_KEY=
# CARSCHEK_VISION_MODEL=gpt-4o-mini
```

Without a key, vision stays on the safe stub — capture UX unchanged.

## Compatibility rules

- Do not change Carschek Score formula.
- Do not auto-apply AI severity without Accept.
- Do not auto-fill valuation prices without Apply.
- Label copy: assisted / observed / suggestion — not “predicted failure” or “AI market price”.
