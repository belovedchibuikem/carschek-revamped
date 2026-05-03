# Prompt 15 — Inspection App: Fix Section Layout

## ⚠️ Rule
Do NOT redesign anything. Fix layout only. Keep all existing colours, fonts, icons, and button styles exactly as they are.

---

## Problem — Layout: Single Column Instead of Two Columns

**Current (wrong):** Every checklist item stacks in a single column, one item per full row.

**Required (correct):** Items are arranged in a **two-column grid** — two items side by side per row, each item in its own card taking 50% width.

### Fix

Replace the current single-column item list with a **CSS grid** layout:

```css
.checklist-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
```

Each checklist item card occupies **one grid cell**. If a section has an odd number of items, the last item occupies only the left cell (right cell is empty).

On mobile (< 640px): collapse to single column `grid-template-columns: 1fr`.

---

## Three Buttons on Every Item — No Exceptions

Every checklist item across **all sections** always shows all three buttons:

```
[ Yes/Good ]  [ No/Bad ]  [ N/A ]
```

Never hide, conditionally render, or remove N/A from any item. All three buttons are always present and always selectable.

**Visual target (correct):**

```
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│ Head Light (Right)               │  │ Left Headlight                   │
│ [Yes/Good]  [No/Bad]  [N/A]     │  │ [Yes/Good]  [No/Bad]  [N/A]     │
└──────────────────────────────────┘  └──────────────────────────────────┘
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│ Tail Light (Right)               │  │ Tail Light (Left)                │
│ [Yes/Good]  [No/Bad]  [N/A]     │  │ [Yes/Good]  [No/Bad]  [N/A]     │
└──────────────────────────────────┘  └──────────────────────────────────┘
```

---

## Button Width Rule

Inside each item card the three buttons share the full card width equally — each button is **33.33% width**. Buttons fill the card horizontally with no gaps between them (except the existing border/outline separation already in the design).
