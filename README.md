# SwitchHack

SwitchHack is a GitHub Pages site for Nintendo Switch users after CFW setup: guides, scene intelligence, curated tools, and policy/legal boundaries in one place.

**Live site:** https://switchhack.com

---


## Website sections

- **Home** (`/`) — project overview and entry point
- **Guide** (`/guide/`) — post-CFW companion workflows
- **Intel** (`/intel/`) — economics/research page
- **Directory** (`/directory/`) — software directory + live scene dashboard blocks
- **Community** (`/community/`) — community hub and feeds
- **Prep** (`/prep/`) — prerequisites and compatibility checks
- **About** (`/about/`) — creator/project context
- **Legal** (`/legal/`) — terms, policy, and DMCA boundaries
- **404** (`/404/`) — custom not-found page

---

## Tech stack

- HTML5 + vanilla JavaScript
- Tailwind CSS (compiled to `assets/css/tailwind.min.css`)
- Custom CSS in `assets/css/styles.css`
- GitHub Pages hosting
- GitHub Actions CI/CD

---

## Local development

### Quick preview

```bash
open index.html
```

### Local server (recommended for route/data behavior)

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

### Rebuild Tailwind output (if you changed Tailwind input/config)

```bash
npm install
npm run build:css
```

---

## Data pipeline (important)

`data/monitor_data.json` is machine-generated and is the source of truth for monitor/directory/community data-driven blocks.

Pipeline:

1. `scrapers/gbatemp_scraper.py` (or local scraper entrypoint)
2. `scrapers/switch_scrape.json` (raw output)
3. `scrapers/intel_processor.py`
4. `data/monitor_data.json` (site-consumed output)

---

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which:

1. installs dependencies,
2. rebuilds Tailwind CSS,
3. minifies HTML/JS,
4. publishes to GitHub Pages.

`daily_update.yml` validates `data/monitor_data.json` schema when that file changes.

---

## Contributing

PRs are welcome for content quality, bug fixes, UI polish, and documentation.

- Keep changes aligned with the static-site architecture.
- Reuse shared nav/component patterns (avoid duplicated nav markup logic).
- Preserve legal/policy boundaries and data-pipeline rules above.

---

## License

[MIT](LICENSE)
