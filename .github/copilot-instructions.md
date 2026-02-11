<!-- Copilot / AI agent guidance for SwitchHack (SwitchLibraryArchive) -->
# Copilot instructions — SwitchHack

Purpose: short, actionable guidance so an AI coding agent can be immediately productive in this repo.

**Big picture**
- This is a static documentation website for post-CFW Switch guidance: plain HTML, CSS, and vanilla JS. No bundlers or node tooling.
- Public site files live at the repo root. Private tooling (scrapers) lives in `scrapers/` and is gitignored.

**Project structure**
```
/
├── index.html, guide.html, intel.html, monitor.html, 404.html  ← pages
├── assets/
│   ├── css/styles.css        ← shared stylesheet
│   ├── js/nav.js             ← shared navigation component
│   ├── images/               ← all images and GIFs
│   └── media/                ← video files
├── data/
│   └── monitor_data.json     ← machine-generated dashboard data
├── scripts/
│   └── autoupdate.sh         ← local automation script
├── scrapers/                 ← gitignored, private Python pipeline
├── .github/                  ← CI workflows + copilot instructions
└── CNAME, LICENSE, README.md, robots.txt, sitemap.xml, .nojekyll
```

**Key files & what they do**
- `index.html`, `guide.html`, `intel.html`, `monitor.html`: primary entry points (open in browser to view).
- `assets/js/nav.js`: programmatically injects the nav into any page with `id="nav-container"`. When editing navigation, update this file rather than duplicating HTML.
- `data/monitor_data.json`: source for the monitor/news UI; edits here affect `monitor.html`/data-driven sections.
- `assets/images/`, `assets/media/`: static assets referenced directly by pages — preserve relative paths.
- `.nojekyll` and `CNAME`: repo is set up for GitHub Pages. Treat the branch `main` as the publish branch.
- `scrapers/`: private Python scripts and data for scraping. Gitignored — never committed.

**Developer workflows (what works locally)**
- No build step: clone and open `index.html` in a browser. Example:

  git clone https://github.com/SwitchLibraryAdmin/SwitchLibraryArchive.git
  open index.html

- For quick local HTTP serving (useful for fetch/XHR from `data/monitor_data.json`):

  python3 -m http.server 8000
  # then open http://localhost:8000/index.html

- Do NOT add `package.json` or npm build steps unless you intend to migrate the project — current design intentionally avoids JS build tooling.

**Conventions & patterns to follow**
- Styling uses Tailwind via CDN in the HTML files. Keep CDN links intact unless replacing them intentionally.
- JavaScript is vanilla and minimal. Keep interactions small and self-contained. Example pattern: `assets/js/nav.js` builds an HTML string and attaches event listeners immediately in an IIFE.
- Data format expectations: `data/monitor_data.json` uses ISO timestamps (e.g., `2026-02-10T17:58:00Z`) and arrays for `releases`, `news`, `reddit`. Preserve those shapes when updating.

**Integration & external dependencies**
- Tailwind and Google Fonts are loaded via CDN — changes to styling rarely require running any build tool.
- Hosting: GitHub Pages. Pushing to `main` is the normal deployment flow. `.nojekyll` ensures static files are served.

**Data pipeline — MANDATORY rules**
- `data/monitor_data.json` is the **single source of truth** for everything displayed on `monitor.html`. All links, dates, headlines, and content shown on the monitor page MUST come from this file.
- **NEVER manually add, fabricate, or guess entries in `data/monitor_data.json`.** This file is machine-generated output from the scraper pipeline and must only be edited by that pipeline.
- To change what data appears on the monitor page, edit the **scrapers** that produce the data:
  - `scrapers/gbatemp_scraper.py` — controls what is scraped (GitHub repos, subreddits, GBAtemp forums).
  - `scrapers/intel_processor.py` — controls how raw scraped data is processed, filtered, and shaped into `data/monitor_data.json`.
- The pipeline flow is: `gbatemp_scraper.py → switch_scrape.json → intel_processor.py → data/monitor_data.json`.
- If the user asks for new data sources, more repos, different filtering, or updated content: edit the scraper or processor, NOT the JSON output.
- `monitor.html` only reads from `data/monitor_data.json` — never hardcode data into the HTML/JS.

**What agents should NOT do**
- Do not introduce a build system (npm, webpack, etc.) without a user request — this repo is intentionally static.
- Do not commit anything from `scrapers/` — it is gitignored for a reason.
- **Do not manually write entries into `data/monitor_data.json`** — always update the scrapers/processor instead.

**PR guidance for humans (what an AI should include in PRs)**
- Run a smoke-check: open the updated HTML pages locally and ensure nav and any data-driven sections render.
- In the PR body, explain: files changed, why, and confirm the site still opens without a build.

If anything above is unclear or you want the agent to adopt a different workflow, say so and I'll update these instructions.
