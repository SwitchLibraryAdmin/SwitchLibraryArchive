# SD Card Builder — Design Document
**Date:** 2026-03-03
**Status:** Approved

## Overview

A client-side SD card build configurator for SwitchHack. Users pick CFW modules from a categorized checklist, see live RAM budget tracking, and generate a ready-to-flash SD card package. Inspired by Ninite (frictionless list) and PCPartPicker (sticky sidebar with live stats).

---

## Architecture

- **File:** `/builder/index.html`
- **Pattern:** Matches existing pages (`<base href="/">`, shared assets, site nav)
- **Dependencies:**
  - `assets/css/tailwind.min.css` (local Tailwind bundle)
  - `assets/css/styles.css` (shared site styles)
  - `assets/fonts/inter-latin.woff2` (locally hosted Inter)
  - `assets/fonts/jetbrains-mono-latin.woff2` (locally hosted JetBrains Mono)
  - `assets/js/nav.js` (site navigation component)
- **Data:** `MODULE_CATALOG` declared as inline `<script>` block
- **No backend. No build step. Pure client-side.**

---

## Layout

- Sticky site nav at top
- `max-w-[1440px]` centered container
- **70/30 split** with `border-r` divider between columns (desktop)
- Left (70%): search bar + SELECT ALL / CLEAR + scrollable module list
- Right (30%): sticky sidebar at `top-[72px]`
- Mobile: sidebar collapses, sticky bottom bar slides up when modules are selected

---

## Visual System

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| Surface 0 | `#0a0a0b` | Page background |
| Surface 1 | `#111113` | Input backgrounds, checkbox bg |
| Surface 2 | `#18181b` | Row hover, RAM bar track |
| Surface 3 | `#222225` | Stat boxes |
| Border | `#1e1e22` | All 1px borders |
| Muted | `#71717a` | Descriptions, secondary labels |
| Text | `#e4e4e7` | Primary body text |
| Accent | `#06B6D4` (cyan-500) | Checkbox, selected border, RAM bar (normal), button |
| Accent hover | `#22D3EE` (cyan-400) | Hover interactions, scrollbar thumb |
| Accent tint | `rgba(6,212,212,0.06)` | Selected row background |
| Warn mid | `#EAB308` | RAM bar at >60% |
| Warn | `#EF4444` | RAM bar at >80%, remove button hover |

### Typography

| Weight | Usage |
|---|---|
| Inter 800 | Category section headers (`CORE CFW`) |
| Inter 700 | Module names (`sys-clk`, `Atmosphere`) |
| Inter 300 | Module descriptions |
| JetBrains Mono | RAM values, badges (`REQUIRED`, `RECOMMENDED`), build button text, search hint |

### Component States

**Module row:**
- Default: transparent bg, `border-b border-[#1e1e22]`, `border-l-2 border-l-transparent`
- Hover: bg `#18181b`
- Selected: `border-l-[#06B6D4]` + `rgba(6,182,212,0.06)` bg tint

**Checkbox:**
- Unchecked: `1px solid #1e1e22`, bg `#111113`
- Checked: `border-[#06B6D4]`, bg `rgba(6,182,212,0.08)`, cyan `✓` in JetBrains Mono

**Badges:**
- `REQUIRED`: `text-[#06B6D4] border-[#06B6D4]/30 bg-[#06B6D4]/5` — checkbox is locked
- `RECOMMENDED`: `text-zinc-400 border-zinc-700` — subtle, not loud

**Build button:**
- Disabled: `border-zinc-700 text-zinc-600 bg-surface-1 cursor-not-allowed`
- Active idle: `border-[#06B6D4] text-[#06B6D4] bg-[#06B6D4]/10`
- Active hover: `bg-[#06B6D4] text-[#0a0a0b]` + pulse animation
- Building: text → `BUILDING…`, disabled
- Done: text → `✓ PACKAGE READY`, full cyan fill for 2s then reset

**Sidebar selected list items:**
- Dot color: cyan (normal) → yellow (ram_kb > 1024) → red (ram_kb > 4096)
- Remove button: fades in on group hover, red on hover, hidden for required modules

---

## Data Integration

### MODULE_CATALOG Schema

```js
{ id, owner, repo, name, category, tags, ram_kb, desc }
```

### Mapping

| Field | Behavior |
|---|---|
| `category` | Groups rows into 5 labeled sections |
| `tags.includes('required')` | Locked checkbox, cyan `REQUIRED` badge, auto-added to `selected` Set on init |
| `tags.includes('recommended')` | Muted `RECOMMENDED` badge, not locked |
| `ram_kb` | All math in KB. Budget = 32,768 KB. Display ≥1024 as `X.X MB`, else `X KB` |
| `owner` / `repo` | Stored in data, not rendered (reserved for future GitHub release integration) |

### Removed from Wireframe
- `dep` field and auto-select dependency logic (no deps in catalog)
- Sidebar stat grid ("Files" / "SD Size") — no size/file data available
- `size`, `files` fields

### Sidebar Layout (post-removal)

```
RAM BUDGET                    0.0 / 32 MB
[████░░░░░░░░░░░░░░░░░░░░░░]  0%

────────────────────────────────────
SELECTED                      3 modules
  • Atmosphere                   —
  • Hekate                       —
  • sys-patch                    —

────────────────────────────────────
[ BUILD SD CARD → ]
  ZIP archive · FAT32 ready
```

---

## JavaScript Logic

All logic inline in `<script>` at bottom of page. No framework.

| Function | Behavior |
|---|---|
| `renderModules()` | Generates category sections + rows from `MODULE_CATALOG`. Inits required modules into `selected` Set. |
| `toggleModule(id, checked)` | Adds/removes from `selected`. Blocks deselect for required. Calls `updateRow()` + `updateSidebar()`. |
| `updateRow(id, on)` | Toggles selected class + left border color. |
| `updateSidebar()` | Recomputes RAM total (sum of `ram_kb`), updates bar width/color, updates selected list, updates module count, enables/disables build button, updates mobile bar. |
| `selectAll()` | Checks all modules. |
| `deselectAll()` | Unchecks all non-required modules. |
| Search listener | Filters rows by `name`, `desc`, `category`. Hides empty category sections. |
| `doBuild()` | Mock: BUILDING… (1.5s) → ✓ PACKAGE READY (2s) → reset. |
| Keyboard `/` | Focuses search input. |

---

## Mobile

- Sidebar hidden on `< lg`
- Sticky bottom bar (`fixed bottom-0`) slides up (`translateY(0)`) when any module is selected
- Bar shows: `X.X / 32 MB` + `N selected` + `BUILD →` button
