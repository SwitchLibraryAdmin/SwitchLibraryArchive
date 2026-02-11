<!-- Copilot / AI agent guidance for SwitchHack (SwitchLibraryArchive) -->
# Copilot instructions — SwitchHack

Purpose: short, actionable guidance so an AI coding agent can be immediately productive in this repo.

**Big picture**
- This is a static documentation website for post-CFW Switch guidance: plain HTML, CSS, and vanilla JS. No bundlers or node tooling.
- Public site files live at the repo root. Private tooling (scrapers) lives in `scrapers/` and is gitignored.

**Key files & what they do**
- `index.html`, `guide.html`, `intel.html`, `monitor.html`: primary entry points (open in browser to view).
- `nav.js`: programmatically injects the nav into any page with `id="nav-container"`. When editing navigation, update this file rather than duplicating HTML.
- `monitor_data.json`: source for the monitor/news UI; edits here affect `monitor.html`/data-driven sections.
- `images/`, `files/`: static assets referenced directly by pages — preserve relative paths.
- `.nojekyll` and `CNAME`: repo is set up for GitHub Pages. Treat the branch `main` as the publish branch.
- `scrapers/`: private Python scripts and data for scraping. Gitignored — never committed.

**Developer workflows (what works locally)**
- No build step: clone and open `index.html` in a browser. Example:

  git clone https://github.com/SwitchLibraryAdmin/SwitchLibraryArchive.git
  open index.html

- For quick local HTTP serving (useful for fetch/XHR from `monitor_data.json`):

  python3 -m http.server 8000
  # then open http://localhost:8000/index.html

- Do NOT add `package.json` or npm build steps unless you intend to migrate the project — current design intentionally avoids JS build tooling.

**Conventions & patterns to follow**
- Styling uses Tailwind via CDN in the HTML files. Keep CDN links intact unless replacing them intentionally.
- JavaScript is vanilla and minimal. Keep interactions small and self-contained. Example pattern: `nav.js` builds an HTML string and attaches event listeners immediately in an IIFE.
- Data format expectations: `monitor_data.json` uses ISO timestamps (e.g., `2026-02-10T17:58:00Z`) and arrays for `releases`, `news`, `reddit`. Preserve those shapes when updating.

**Integration & external dependencies**
- Tailwind and Google Fonts are loaded via CDN — changes to styling rarely require running any build tool.
- Hosting: GitHub Pages. Pushing to `main` is the normal deployment flow. `.nojekyll` ensures static files are served.

**What agents should NOT do**
- Do not introduce a build system (npm, webpack, etc.) without a user request — this repo is intentionally static.
- Do not commit anything from `scrapers/` — it is gitignored for a reason.

**PR guidance for humans (what an AI should include in PRs)**
- Run a smoke-check: open the updated HTML pages locally and ensure nav and any data-driven sections render.
- In the PR body, explain: files changed, why, and confirm the site still opens without a build.

If anything above is unclear or you want the agent to adopt a different workflow, say so and I'll update these instructions.
