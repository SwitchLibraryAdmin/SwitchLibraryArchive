# SwitchHack

**The most in-depth, noob-friendly post-CFW companion guide for the Nintendo Switch.**

SwitchHack picks up where the initial hack left off. Once you've installed Atmosphere CFW on your Switch, this guide walks you through everything else — theming, emulation, homebrew apps, game library management, online play, and more.

> Open-source & free forever. No ads, no paywalls, no affiliate links.

---

## What This Is

SwitchHack is a static website (HTML/CSS/JS) designed to be hosted on GitHub Pages. It serves as a comprehensive reference for Nintendo Switch owners who have already installed custom firmware and want to get the most out of their modded console.

**This is NOT a jailbreak/CFW installation guide.** For that, see [switch.homebrew.guide](https://switch.homebrew.guide). SwitchHack covers everything *after* the hack.

---

## Pages

### Homepage (`new_index.html`)
The landing page. Introduces the project, highlights key features, and links to the guide, economics page, and community Discord.

### Post-CFW Companion Guide (`new_guide.html`)
The core of the project. A single-page guide organized into 5 zones:

| Zone | Topic | What's Covered |
|------|-------|----------------|
| **01** | Customization & Theming | Custom avatars, profile icons, game icons, Tinfoil/CyberFoil themes, activity log themes |
| **02** | Advanced Emulation | RetroArch setup, emulator cores, ROM management |
| **03** | Essential Homebrew Apps | NRO homebrew apps, SD card root utilities |
| **04** | Game Library Management | Buying from Nintendo eShop, DBI Installer (USB install), CyberFoil + Ownfoil (network shop) |
| **05** | Community Play & Extras | Online play, fake user accounts, community resources |

Features a sticky command bar with hover dropdowns, a Mission Briefing navigation grid, and a neon timeline layout.

### Economics of Digital Access (`economics.html`)
A data-driven page presenting research and industry perspectives on digital access and piracy. Sections include:

- **The EU Displacement Study** — The suppressed 2017 EU Commission study (30,000 consumers, 6 countries) that found game piracy had zero negative impact on sales
- **Pirate Demographics** — Data dashboard with CSS conic-gradient pie charts challenging common stereotypes
- **The Gatekeeper Bypass** — Sourced quotes from Adobe, HBO (Jeff Bewkes), and Ed Sheeran on piracy as a distribution channel
- **A Developer's Perspective** — Lachhh's (Just Shapes & Beats) in-game piracy screen with embedded video

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | [Tailwind CSS](https://tailwindcss.com) via CDN |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) (body) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (code/mono) via Google Fonts |
| JavaScript | Vanilla JS (mobile menu, scroll spy, no frameworks) |
| Hosting | GitHub Pages (static, no build step) |
| Design System | Glassmorphism on `bg-slate-900`, neon accents (cyan/emerald/purple/pink), pixelated GIF art |

No build tools, no npm, no bundler. Open any `.html` file in a browser and it works.

---

## Project Structure

```
SwitchHack/
├── new_index.html          # Homepage
├── new_guide.html          # Post-CFW Companion Guide
├── economics.html          # Economics of Digital Access
├── images/                 # GIFs, pixel art, screenshots
├── files/                  # Video files (JS&B piracy screen)
├── fonts/                  # SF Pro Display, SF Pro Text (local)
├── Themes/                 # Theme assets
├── .nojekyll               # Bypasses Jekyll processing on GitHub Pages
├── LICENSE                 # MIT License
│
│   Legacy pages (original site, preserved):
├── index.html              # Original homepage
├── Guide.html              # Original guide
├── Piracy.html             # Original piracy page
├── FAQ.html                # FAQ
├── Community-Resources.html
├── Contribute.html
├── *.css                   # Legacy stylesheets (nicepage)
└── nicepage.js             # Legacy JS
```

---

## Design

The site uses a **"Cyberpunk Apple"** aesthetic:

- **Dark glass cards** — `bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl`
- **Neon accent system** — Color-coded per zone (emerald, cyan, purple, pink)
- **Terminal blocks** — macOS-style window chrome (red/yellow/green dots) for code snippets
- **Pixel art GIFs** — `image-rendering: pixelated` for retro visuals
- **Glitch text effects** — CSS `clip-path` animations on headings
- **Responsive** — Mobile-first, works on all screen sizes

---

## Running Locally

```bash
# Clone the repo
git clone https://github.com/SwitchLibraryAdmin/SwitchLibraryArchive.git
cd SwitchLibraryArchive

# Open in your browser
open new_index.html
```

No server required. Everything is static HTML with CDN dependencies (Tailwind, Google Fonts).

---

## Contributing

Contributions are welcome. If you find outdated info, broken links, or want to add content:

1. Fork the repo
2. Make your changes
3. Submit a pull request

Please keep the existing design system and tone consistent.

---

## Community

Join the Discord for help, discussion, and updates:

[![Discord](https://img.shields.io/discord/000000?label=Discord&logo=discord&logoColor=white&color=5865F2)](https://discord.gg/C29hYvh)

**[discord.gg/C29hYvh](https://discord.gg/C29hYvh)**

---

## Disclaimer

This project is for **educational and informational purposes only**. It does not host, distribute, or link to any copyrighted material. The economics page presents publicly available research and sourced quotes for academic discussion. Users are responsible for complying with the laws of their jurisdiction.

---

## License

[MIT License](LICENSE)
