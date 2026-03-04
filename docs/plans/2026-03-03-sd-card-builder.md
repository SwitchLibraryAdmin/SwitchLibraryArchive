# SD Card Builder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build `/builder/index.html` — a client-side SD card configurator where users pick CFW modules from a categorized checklist with live RAM budget tracking and a sticky sidebar.

**Architecture:** Single self-contained HTML file at `/builder/index.html` using the site's shared assets (local fonts, Tailwind bundle, nav.js). All logic is inline JS at the bottom. `MODULE_CATALOG` is the sole data source — no backend, no build step, no framework.

**Tech Stack:** HTML5, Tailwind CSS (local bundle via `assets/css/tailwind.min.css`), vanilla JS, Inter + JetBrains Mono (locally hosted in `assets/fonts/`)

**Design doc:** `docs/plans/2026-03-03-sd-card-builder-design.md`

---

## Reference: MODULE_CATALOG schema

```js
{ id, owner, repo, name, category, tags, ram_kb, desc }
// tags: [] | ['required'] | ['recommended']
// ram_kb: integer — budget is 32768 (32 MB)
// required modules: locked checkbox, auto-selected on init
```

Exact catalog is in `/Users/lunt3/SwitchHack/MODULE_CATALOG` (no extension — it's a JS snippet).

---

## Reference: Color tokens

```
Surface 0: #0a0a0b   Surface 1: #111113   Surface 2: #18181b   Surface 3: #222225
Border:    #1e1e22   Muted:     #71717a   Text:      #e4e4e7
Accent:    #06B6D4   Accent-400:#22D3EE   Accent-tint: rgba(6,182,212,0.06)
Warn-mid:  #EAB308   Warn:      #EF4444
```

---

## Reference: Existing page pattern

Study `prep/index.html` lines 1–43 for the exact boilerplate: `<base href="/">`, meta tags, preload links, CSS links, font preloads, nav.js injection pattern.

---

### Task 1: Scaffold HTML boilerplate

**Files:**
- Create: `builder/index.html`

**Step 1: Create the file with the standard page shell**

Copy the head pattern from `prep/index.html` (lines 1–43), then adapt:

```html
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <base href="/">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SwitchHack — SD Card Builder</title>
  <meta name="description" content="Build your custom CFW SD card. Pick your modules, track your RAM budget, and download a ready-to-flash ZIP.">
  <meta property="og:title" content="SwitchHack — SD Card Builder">
  <meta property="og:description" content="Build your custom CFW SD card. Pick your modules, track your RAM budget, and download a ready-to-flash ZIP.">
  <meta property="og:url" content="https://switchhack.com/builder/">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="SwitchHack">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎮</text></svg>">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="X-Frame-Options" content="DENY">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <link rel="preload" href="assets/css/tailwind.min.css" as="style">
  <link rel="preload" href="assets/css/styles.css" as="style">
  <link rel="preload" href="assets/js/nav.js" as="script">
  <link rel="preload" href="assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/jetbrains-mono-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="assets/css/tailwind.min.css">
  <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body class="bg-[#0a0a0b] text-[#e4e4e7] font-sans antialiased min-h-screen">

  <div id="nav-container"></div>
  <script src="assets/js/nav.js"></script>

  <!-- MAIN CONTENT GOES HERE -->

</body>
</html>
```

**Step 2: Verify in browser**

Open `builder/index.html` in browser (via local server or direct file). Confirm:
- Site nav renders at the top
- Page background is near-black `#0a0a0b`
- No console errors

**Step 3: Commit**

```bash
git add builder/index.html
git commit -m "feat: scaffold /builder page with site boilerplate"
```

---

### Task 2: Add Tailwind config + inline custom styles

**Files:**
- Modify: `builder/index.html` — add `<script>` config and `<style>` block inside `<head>`, before closing `</head>`

**Step 1: Add Tailwind config extending colors**

Insert this before `</head>`:

```html
  <script>
    if (typeof tailwind !== 'undefined') {
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Inter', 'sans-serif'],
              mono: ['"JetBrains Mono"', 'monospace'],
            },
          },
        },
      };
    }
  </script>
```

Note: The local `tailwind.min.css` is a pre-compiled bundle, so the `tailwind.config` runtime config won't apply — font classes will fall back to the site's existing font-sans/font-mono setup from `styles.css`. This is fine; Inter is already the default `font-sans` in the site.

**Step 2: Add the inline `<style>` block**

```html
  <style>
    /* ── Custom checkbox ── */
    .mod-check { display: none; }
    .mod-check + .check-box {
      width: 18px; height: 18px;
      border: 1px solid #1e1e22;
      background: #111113;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: all .15s ease;
    }
    .mod-check:checked + .check-box {
      border-color: #06B6D4;
      background: rgba(6,182,212,0.08);
    }
    .mod-check:checked + .check-box::after {
      content: '✓';
      color: #06B6D4;
      font-size: 11px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    /* ── Module row ── */
    .mod-row { transition: background .12s ease; }
    .mod-row:hover { background: #18181b; }
    .mod-row.selected {
      border-left-color: #06B6D4 !important;
      background: rgba(6,182,212,0.06);
    }

    /* ── RAM bar ── */
    .ram-fill {
      transition: width .35s cubic-bezier(.4,0,.2,1), background .35s ease;
    }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #111113; }
    ::-webkit-scrollbar-thumb { background: #1e1e22; border-radius: 0; }
    ::-webkit-scrollbar-thumb:hover { background: #06B6D4; }

    /* ── Build button pulse ── */
    @keyframes buildPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(6,182,212,0.4); }
      50%       { box-shadow: 0 0 0 6px rgba(6,182,212,0); }
    }
    .build-btn:not(:disabled):hover { animation: buildPulse 1.5s infinite; }

    /* ── Sidebar selected item slide-in ── */
    .sel-item { animation: slideIn .2s ease-out; }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(6px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    /* ── Category header rule ── */
    .cat-line::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #1e1e22;
      margin-left: 12px;
    }
  </style>
```

**Step 3: Verify**

Reload in browser. No visual change expected yet, but confirm no CSS errors in console.

**Step 4: Commit**

```bash
git add builder/index.html
git commit -m "feat: add builder color tokens and component styles"
```

---

### Task 3: Build the left panel HTML

**Files:**
- Modify: `builder/index.html` — replace `<!-- MAIN CONTENT GOES HERE -->` with the full two-column layout

**Step 1: Replace the placeholder with the layout wrapper + left panel**

```html
  <!-- ── Page Header ── -->
  <section class="border-b border-[#1e1e22] bg-[#111113]/50">
    <div class="max-w-[1440px] mx-auto px-6 py-8">
      <p class="font-mono text-xs text-[#06B6D4] uppercase tracking-widest mb-2">SD Card Builder</p>
      <h1 class="text-2xl font-bold text-white tracking-tight">Build your custom SD card</h1>
      <p class="text-sm text-[#71717a] mt-1">Select the modules you want. RAM cost is tracked live. Download a ready-to-flash ZIP.</p>
    </div>
  </section>

  <!-- ── Two-Column Layout ── -->
  <div class="max-w-[1440px] mx-auto flex px-6 gap-0">

    <!-- LEFT: Module List (70%) -->
    <main class="w-full lg:w-[70%] py-8 pr-0 lg:pr-8 border-r-0 lg:border-r border-[#1e1e22] min-h-screen">

      <!-- Search / Filter Bar -->
      <div class="flex items-center gap-3 mb-8">
        <div class="relative flex-1">
          <input
            type="text"
            id="searchInput"
            placeholder="Filter modules…"
            class="w-full bg-[#111113] border border-[#1e1e22] text-sm text-white/90 placeholder:text-[#71717a]
                   px-4 py-2.5 outline-none focus:border-[#06B6D4]/50 transition-colors font-sans"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[#71717a] border border-[#1e1e22] px-1.5 py-0.5">/</span>
        </div>
        <button
          onclick="selectAll()"
          class="text-[11px] font-mono text-[#71717a] border border-[#1e1e22] px-3 py-2.5
                 hover:text-[#06B6D4] hover:border-[#06B6D4]/40 transition-colors whitespace-nowrap"
        >SELECT ALL</button>
        <button
          onclick="deselectAll()"
          class="text-[11px] font-mono text-[#71717a] border border-[#1e1e22] px-3 py-2.5
                 hover:text-[#06B6D4] hover:border-[#06B6D4]/40 transition-colors"
        >CLEAR</button>
      </div>

      <!-- Module categories injected by JS -->
      <div id="moduleList"></div>

    </main>

    <!-- RIGHT SIDEBAR GOES HERE (Task 4) -->

  </div>

  <!-- MOBILE BAR GOES HERE (Task 5) -->
```

**Step 2: Verify in browser**

Reload. Confirm:
- Page header renders with cyan `SD Card Builder` label
- Search input visible with `/` hint badge
- SELECT ALL and CLEAR buttons render
- Layout takes correct width

**Step 3: Commit**

```bash
git add builder/index.html
git commit -m "feat: add builder page header and left panel shell"
```

---

### Task 4: Build the right sidebar HTML

**Files:**
- Modify: `builder/index.html` — replace `<!-- RIGHT SIDEBAR GOES HERE (Task 4) -->` with the sidebar `<aside>`

**Step 1: Add the sidebar**

```html
    <!-- RIGHT: Sticky Sidebar (30%) -->
    <aside class="hidden lg:block w-[30%] py-8 pl-8">
      <div class="sticky top-[72px]">

        <!-- RAM Budget -->
        <div class="mb-6">
          <div class="flex items-baseline justify-between mb-2">
            <span class="text-[11px] font-mono font-bold text-[#71717a] uppercase tracking-widest">RAM Budget</span>
            <span class="font-mono text-sm">
              <span id="ramUsed" class="text-white font-bold">0</span>
              <span class="text-[#71717a] font-normal"> / 32 MB</span>
            </span>
          </div>
          <div class="h-2 bg-[#18181b] border border-[#1e1e22] overflow-hidden">
            <div id="ramBar" class="ram-fill h-full bg-[#06B6D4]" style="width:0%"></div>
          </div>
          <div class="flex justify-between mt-1.5">
            <span id="ramPercent" class="font-mono text-[10px] text-[#71717a]">0%</span>
            <span id="ramWarning" class="font-mono text-[10px] text-[#EF4444] opacity-0 transition-opacity">⚠ HIGH RAM</span>
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-[#1e1e22] mb-5"></div>

        <!-- Selected Modules List -->
        <div class="mb-6">
          <div class="flex items-baseline justify-between mb-3">
            <span class="text-[11px] font-mono font-bold text-[#71717a] uppercase tracking-widest">Selected</span>
            <span id="selCount" class="font-mono text-[10px] text-[#71717a]">0 modules</span>
          </div>
          <div id="selectedList" class="space-y-0 max-h-[calc(100vh-360px)] overflow-y-auto">
            <div id="emptyState" class="text-sm text-[#71717a]/60 font-sans font-light py-8 text-center leading-relaxed">
              No modules selected.<br>
              <span class="text-[#71717a]/40 text-xs">Check items on the left to begin.</span>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-[#1e1e22] mb-5"></div>

        <!-- Build Button -->
        <button
          id="buildBtn"
          disabled
          class="build-btn w-full py-4 font-mono font-bold text-sm uppercase tracking-widest
                 border-2 border-[#06B6D4] bg-[#06B6D4]/10 text-[#06B6D4]
                 disabled:border-[#1e1e22] disabled:bg-[#111113] disabled:text-[#71717a] disabled:cursor-not-allowed
                 hover:bg-[#06B6D4] hover:text-[#0a0a0b] transition-all duration-200"
        >Build SD Card →</button>
        <p class="text-center font-mono text-[10px] text-[#71717a]/50 mt-2">ZIP archive · FAT32 ready</p>

      </div>
    </aside>
```

**Step 2: Verify in browser**

Reload. Confirm:
- Sidebar visible on desktop (hidden on narrow viewport)
- RAM bar track renders (empty, gray)
- Build button visible, disabled/grayed out
- Empty state text shows in selected list

**Step 3: Commit**

```bash
git add builder/index.html
git commit -m "feat: add sticky sidebar with RAM bar and build button"
```

---

### Task 5: Add mobile sticky bottom bar

**Files:**
- Modify: `builder/index.html` — replace `<!-- MOBILE BAR GOES HERE (Task 5) -->` with the bar div

**Step 1: Add mobile bar**

```html
  <!-- Mobile Sticky Bottom Bar -->
  <div
    id="mobileBar"
    class="lg:hidden fixed bottom-0 left-0 right-0 bg-[#111113]/95 backdrop-blur-md
           border-t border-[#1e1e22] px-4 py-3 z-50
           flex items-center justify-between
           translate-y-full transition-transform duration-200"
  >
    <div>
      <span class="font-mono text-xs text-white font-bold">
        <span id="mobRam">0</span> / 32 MB
      </span>
      <span class="font-mono text-[10px] text-[#71717a] ml-2">
        <span id="mobCount">0</span> selected
      </span>
    </div>
    <button
      onclick="doBuild()"
      class="font-mono text-xs font-bold bg-[#06B6D4] text-[#0a0a0b] px-5 py-2 tracking-wider
             hover:bg-[#22D3EE] transition-colors"
    >BUILD →</button>
  </div>
```

**Step 2: Verify in browser (mobile simulation)**

Open DevTools → toggle device toolbar → narrow to mobile width. Bottom bar should be hidden (translated off-screen). It will slide up once JS runs.

**Step 3: Commit**

```bash
git add builder/index.html
git commit -m "feat: add mobile sticky bottom bar"
```

---

### Task 6: Inject MODULE_CATALOG

**Files:**
- Modify: `builder/index.html` — add `<script>` block with data before the logic script (before closing `</body>`)
- Source data: `/Users/lunt3/SwitchHack/MODULE_CATALOG` (read this file — it has no extension, it's a plain JS snippet)

**Step 1: Read the MODULE_CATALOG file and paste it verbatim into a script block**

Add this before `</body>`:

```html
  <script>
    /* ── Data ── */
    const MODULE_CATALOG = [ /* PASTE EXACT ARRAY FROM MODULE_CATALOG FILE HERE */ ];
    const MAX_RAM_KB = 32768; // 32 MB
  </script>
```

Important: paste the array exactly as-is. Do not rename fields. Do not transform values.

**Step 2: Verify in browser console**

Open DevTools console, type `MODULE_CATALOG.length`. Should return `18`.

**Step 3: Commit**

```bash
git add builder/index.html
git commit -m "feat: inject MODULE_CATALOG as inline data source"
```

---

### Task 7: Implement renderModules()

**Files:**
- Modify: `builder/index.html` — add logic script block after the data script

**Step 1: Add state + renderModules()**

```html
  <script>
    /* ── State ── */
    const selected = new Set();

    /* ── Helpers ── */
    function fmtRam(ram_kb) {
      if (ram_kb === 0) return '—';
      if (ram_kb >= 1024) return (ram_kb / 1024).toFixed(1) + ' MB';
      return ram_kb + ' KB';
    }

    function ramColor(ram_kb) {
      if (ram_kb >= 4096) return 'text-[#EF4444]';
      if (ram_kb >= 1024) return 'text-[#EAB308]';
      return 'text-[#71717a]/60';
    }

    function dotColor(ram_kb) {
      if (ram_kb >= 4096) return 'bg-[#EF4444]';
      if (ram_kb >= 1024) return 'bg-[#EAB308]';
      return 'bg-[#06B6D4]';
    }

    /* ── Render module list ── */
    function renderModules() {
      const container = document.getElementById('moduleList');
      const categories = [...new Set(MODULE_CATALOG.map(m => m.category))];

      container.innerHTML = categories.map(cat => {
        const mods = MODULE_CATALOG.filter(m => m.category === cat);
        return `
          <section class="mb-8" data-cat="${cat}">
            <div class="cat-line flex items-center mb-3">
              <h2 class="font-mono font-bold text-[11px] uppercase tracking-[.2em] text-[#71717a]">${cat}</h2>
            </div>
            <div class="space-y-0">
              ${mods.map(m => {
                const isRequired = m.tags.includes('required');
                const isRecommended = m.tags.includes('recommended');
                return `
                  <label
                    data-id="${m.id}"
                    class="mod-row flex items-start gap-4 border border-[#1e1e22] border-b-0 last:border-b
                           p-4 cursor-pointer select-none
                           border-l-2 ${isRequired ? 'border-l-[#06B6D4] bg-[rgba(6,182,212,0.06)] selected' : 'border-l-transparent'}"
                  >
                    <input
                      type="checkbox"
                      class="mod-check"
                      value="${m.id}"
                      ${isRequired ? 'checked' : ''}
                      onchange="toggleModule('${m.id}', this.checked)"
                    />
                    <div class="check-box mt-0.5"></div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-sans font-bold text-sm text-white/95">${m.name}</span>
                        ${isRequired
                          ? '<span class="font-mono text-[9px] text-[#06B6D4] border border-[#06B6D4]/30 bg-[#06B6D4]/5 px-1.5 py-0.5 uppercase tracking-wider">Required</span>'
                          : ''}
                        ${isRecommended
                          ? '<span class="font-mono text-[9px] text-[#71717a] border border-[#1e1e22] px-1.5 py-0.5 uppercase tracking-wider">Recommended</span>'
                          : ''}
                      </div>
                      <p class="font-sans font-light text-xs text-[#71717a] mt-1 leading-relaxed">${m.desc}</p>
                    </div>
                    <div class="flex-shrink-0 mt-0.5">
                      <span class="font-mono text-[11px] font-bold ${ramColor(m.ram_kb)}">${fmtRam(m.ram_kb)}</span>
                    </div>
                  </label>
                `;
              }).join('')}
            </div>
          </section>
        `;
      }).join('');

      // Initialise required modules into selected set
      MODULE_CATALOG.filter(m => m.tags.includes('required')).forEach(m => selected.add(m.id));
      updateSidebar();
    }
  </script>
```

**Step 2: Call renderModules() at the bottom of the script block**

```js
    renderModules();
```

**Step 3: Verify in browser**

Reload. Confirm:
- All 5 categories render: Core CFW, Overlays, Sysmodules, File & Save Tools, Homebrew Apps, Streaming & Media, Emulation
- Category headers are small-caps mono in muted color
- Module rows show name, description, RAM value, badges
- Required modules (Atmosphere, Hekate) show cyan REQUIRED badge and are pre-checked
- Recommended modules show muted RECOMMENDED badge

**Step 4: Commit**

```bash
git add builder/index.html
git commit -m "feat: implement renderModules() from MODULE_CATALOG"
```

---

### Task 8: Implement toggleModule() + updateRow()

**Files:**
- Modify: `builder/index.html` — add to the logic `<script>` block, before `renderModules()` call

**Step 1: Add toggle and row update functions**

```js
    /* ── Toggle a module on/off ── */
    function toggleModule(id, checked) {
      const mod = MODULE_CATALOG.find(m => m.id === id);
      if (!mod) return;

      // Required modules cannot be deselected
      if (mod.tags.includes('required') && !checked) {
        const cb = document.querySelector(`input[value="${id}"]`);
        if (cb) cb.checked = true;
        return;
      }

      if (checked) {
        selected.add(id);
      } else {
        selected.delete(id);
      }

      updateRow(id, checked);
      updateSidebar();
    }

    /* ── Update a single row's selected visual state ── */
    function updateRow(id, on) {
      const row = document.querySelector(`label[data-id="${id}"]`);
      if (!row) return;
      if (on) {
        row.classList.add('selected');
        row.style.borderLeftColor = '#06B6D4';
      } else {
        row.classList.remove('selected');
        row.style.borderLeftColor = 'transparent';
      }
    }
```

**Step 2: Verify in browser**

Click a non-required module checkbox. Confirm:
- Row gets cyan left border and subtle tint
- Clicking again removes it
- Clicking Atmosphere's checkbox while checked does nothing (stays checked)

**Step 3: Commit**

```bash
git add builder/index.html
git commit -m "feat: implement toggleModule and updateRow"
```

---

### Task 9: Implement updateSidebar()

**Files:**
- Modify: `builder/index.html` — add `updateSidebar()` to the logic script block

**Step 1: Add updateSidebar()**

```js
    /* ── Recompute and render the sidebar ── */
    function updateSidebar() {
      const mods = MODULE_CATALOG.filter(m => selected.has(m.id));
      const totalKb = mods.reduce((s, m) => s + m.ram_kb, 0);
      const pct = Math.min((totalKb / MAX_RAM_KB) * 100, 100);

      // RAM display: show as MB if >= 1024 KB
      const displayRam = totalKb >= 1024
        ? (totalKb / 1024).toFixed(1) + ' MB'
        : totalKb + ' KB';
      document.getElementById('ramUsed').textContent = displayRam;
      document.getElementById('ramPercent').textContent = Math.round(pct) + '%';

      // RAM bar color
      const bar = document.getElementById('ramBar');
      bar.style.width = pct + '%';
      bar.style.background = pct > 80 ? '#EF4444' : pct > 60 ? '#EAB308' : '#06B6D4';

      // Warning label
      document.getElementById('ramWarning').style.opacity = pct > 80 ? '1' : '0';

      // Selected list
      const list = document.getElementById('selectedList');
      const emptyEl = document.getElementById('emptyState');

      if (mods.length === 0) {
        list.innerHTML = '';
        list.appendChild(emptyEl);
        emptyEl.style.display = '';
      } else {
        if (emptyEl) emptyEl.style.display = 'none';
        list.innerHTML = mods.map(m => `
          <div class="sel-item flex items-center justify-between py-2 px-3 border-b border-[#1e1e22]/50 group hover:bg-[#18181b]/50 transition-colors">
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor(m.ram_kb)}"></span>
              <span class="text-xs font-sans text-white/80 truncate">${m.name}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-[10px] text-[#71717a]">${fmtRam(m.ram_kb)}</span>
              <button
                onclick="event.stopPropagation(); removeMod('${m.id}')"
                class="opacity-0 group-hover:opacity-100 text-[#71717a] hover:text-[#EF4444] text-xs transition-opacity ${m.tags.includes('required') ? 'invisible' : ''}"
              >✕</button>
            </div>
          </div>
        `).join('');
      }

      document.getElementById('selCount').textContent = mods.length + ' module' + (mods.length !== 1 ? 's' : '');

      // Build button
      document.getElementById('buildBtn').disabled = mods.length === 0;

      // Mobile bar
      document.getElementById('mobRam').textContent = totalKb >= 1024
        ? (totalKb / 1024).toFixed(1) + ' MB'
        : totalKb + ' KB';
      document.getElementById('mobCount').textContent = mods.length;
      document.getElementById('mobileBar').style.transform =
        mods.length > 0 ? 'translateY(0)' : 'translateY(100%)';
    }

    /* ── Remove from sidebar ✕ button ── */
    function removeMod(id) {
      selected.delete(id);
      const cb = document.querySelector(`input[value="${id}"]`);
      if (cb) cb.checked = false;
      updateRow(id, false);
      updateSidebar();
    }
```

**Step 2: Verify in browser**

1. Page loads — Atmosphere and Hekate pre-selected in sidebar, selCount = "2 modules"
2. Select sys-clk (1.0 MB = 1024 KB) — RAM bar fills, displays "1.0 MB"
3. Select MissionControl (500 KB) — bar grows, displays correct total
4. ✕ button appears on hover for non-required items, clicking removes them
5. ✕ button invisible for Atmosphere and Hekate
6. At high RAM (select all sysmodules), bar turns yellow then red

**Step 3: Commit**

```bash
git add builder/index.html
git commit -m "feat: implement updateSidebar with RAM math and selected list"
```

---

### Task 10: Add utility functions + search + keyboard + build action

**Files:**
- Modify: `builder/index.html` — add remaining functions to logic script block

**Step 1: Add selectAll, deselectAll, search listener, keyboard shortcut, doBuild**

```js
    /* ── Select / Deselect All ── */
    function selectAll() {
      MODULE_CATALOG.forEach(m => {
        selected.add(m.id);
        const cb = document.querySelector(`input[value="${m.id}"]`);
        if (cb) cb.checked = true;
        updateRow(m.id, true);
      });
      updateSidebar();
    }

    function deselectAll() {
      MODULE_CATALOG.forEach(m => {
        if (m.tags.includes('required')) return;
        selected.delete(m.id);
        const cb = document.querySelector(`input[value="${m.id}"]`);
        if (cb) cb.checked = false;
        updateRow(m.id, false);
      });
      updateSidebar();
    }

    /* ── Search ── */
    document.getElementById('searchInput').addEventListener('input', function () {
      const q = this.value.toLowerCase();
      MODULE_CATALOG.forEach(m => {
        const row = document.querySelector(`label[data-id="${m.id}"]`);
        if (!row) return;
        const match = m.name.toLowerCase().includes(q)
          || m.desc.toLowerCase().includes(q)
          || m.category.toLowerCase().includes(q);
        row.style.display = match ? '' : 'none';
      });
      // Hide category sections with no visible rows
      document.querySelectorAll('[data-cat]').forEach(sec => {
        const visible = sec.querySelectorAll('label:not([style*="display: none"])');
        sec.style.display = visible.length ? '' : 'none';
      });
    });

    /* ── Keyboard: "/" focuses search ── */
    document.addEventListener('keydown', e => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
      }
    });

    /* ── Build action ── */
    document.getElementById('buildBtn').addEventListener('click', doBuild);

    function doBuild() {
      const btn = document.getElementById('buildBtn');
      btn.textContent = 'BUILDING…';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = '✓ PACKAGE READY';
        btn.classList.add('!bg-[#06B6D4]', '!text-[#0a0a0b]');
        setTimeout(() => {
          btn.textContent = 'Build SD Card →';
          btn.classList.remove('!bg-[#06B6D4]', '!text-[#0a0a0b]');
          btn.disabled = false;
        }, 2000);
      }, 1500);
    }
```

**Step 2: Verify in browser**

1. Type "clk" in search — only sys-clk row visible, other categories hidden
2. Clear search — all rows return
3. Press `/` key — search input focuses
4. Click SELECT ALL — all checkboxes checked, sidebar fills up
5. Click CLEAR — non-required modules deselected, Atmosphere+Hekate+sys-patch remain
6. With modules selected, click Build SD Card — button shows BUILDING… then ✓ PACKAGE READY then resets

**Step 3: Commit**

```bash
git add builder/index.html
git commit -m "feat: add search, keyboard shortcut, select all/clear, build action"
```

---

### Task 11: Final polish + verify full page

**Files:**
- Modify: `builder/index.html` — review and fix any visual issues

**Step 1: Visual checklist — open in browser and verify each item**

- [ ] Page title in browser tab: "SwitchHack — SD Card Builder"
- [ ] Site nav present and correct
- [ ] Page header subtitle row renders (cyan mono label + bold title + gray description)
- [ ] Search bar has `/` shortcut hint badge on right
- [ ] Category section headers are mono, small-caps, muted, with horizontal rule
- [ ] Required modules (Atmosphere, Hekate, sys-patch): cyan REQUIRED badge, locked checkbox
- [ ] Recommended modules: muted gray RECOMMENDED badge, unlockable
- [ ] RAM column: `—` for 0 KB, `X KB` for < 1 MB, `X.X MB` for >= 1 MB
- [ ] RAM color: muted (low), yellow (>= 1 MB), red (>= 4 MB)
- [ ] Sidebar RAM bar starts filled for required modules (all 0 KB = 0%)
- [ ] Selecting nx-ovlloader (4096 KB = 4.0 MB) turns RAM bar yellow
- [ ] Selecting multiple sysmodules turns bar red + ⚠ HIGH RAM appears
- [ ] Selected list dot colors match RAM tier
- [ ] Sidebar ✕ button invisible for required modules
- [ ] Build button disabled when selecting only required (0 KB) — NOTE: button should be enabled when `mods.length > 0`, and required mods count. Verify Atmosphere alone enables the button.
- [ ] Mobile: sticky bar hidden initially — inspect element confirms `translateY(100%)`
- [ ] Mobile bar slides up after selecting any module
- [ ] No console errors or warnings

**Step 2: Fix any issues found**

Address each failed checklist item.

**Step 3: Final commit**

```bash
git add builder/index.html
git commit -m "feat: complete SD Card Builder at /builder/"
```

---

## Notes for Implementer

- The build button `disabled` state: required modules ARE added to `selected` set on init, so `mods.length > 0` will be true from page load. The build button should be enabled on load. If this isn't the desired UX, change the condition to `mods.length > MODULE_CATALOG.filter(m => m.tags.includes('required')).length`.
- The `MODULE_CATALOG` file at project root has no file extension — read it with the Read tool using the full path `/Users/lunt3/SwitchHack/MODULE_CATALOG`.
- The local Tailwind bundle (`assets/css/tailwind.min.css`) is pre-compiled. Arbitrary values like `bg-[#06B6D4]` will NOT work unless they were in the build input. Use inline `style=""` attributes for all custom hex colors that aren't already in the bundle. Check `assets/css/tailwind.min.css` for which color utilities are available, or default to `style=` for all custom token colors.
- **Important implication of the above:** The entire color system may need to use `style=""` instead of Tailwind classes. The safest approach is to use inline styles for all `#` hex colors and only use Tailwind for layout utilities (flex, grid, padding, margin, w-full, etc.) which are guaranteed to be in any Tailwind bundle.
