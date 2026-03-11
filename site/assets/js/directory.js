'use strict';

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const GH_API = 'https://api.github.com';
const MONITOR_JSON = 'data/monitor_data.json';

// Category definitions — order controls display order in feed and directory
const CATEGORIES = [
  {
    key: 'core', label: 'Core System',
    color: '#22d3ee',       // cyan-400 (brand — full saturation)
    colorMid: '#06b6d4',    // cyan-500
    colorDark: '#164e63',   // cyan-900
  },
  {
    key: 'files', label: 'File & Save Tools',
    color: '#fbbf24',       // amber-400
    colorMid: '#f59e0b',    // amber-500
    colorDark: '#78350f',   // amber-900
  },
  {
    key: 'overlays', label: 'Overlays & Performance',
    color: '#a78bfa',       // violet-400
    colorMid: '#8b5cf6',    // violet-500
    colorDark: '#4c1d95',   // violet-900
  },
  {
    key: 'system', label: 'System Modules',
    color: '#34d399',       // emerald-400
    colorMid: '#10b981',    // emerald-500
    colorDark: '#064e3b',   // emerald-900
  },
  {
    key: 'apps', label: 'Apps & Utilities',
    color: '#60a5fa',       // blue-400
    colorMid: '#3b82f6',    // blue-500
    colorDark: '#1e3a8a',   // blue-900
  },
  {
    key: 'media', label: 'Streaming & Media',
    color: '#f472b6',       // pink-400
    colorMid: '#ec4899',    // pink-500
    colorDark: '#831843',   // pink-900
  },
  {
    key: 'emulation', label: 'Emulation',
    color: '#fb923c',       // orange-400
    colorMid: '#f97316',    // orange-500
    colorDark: '#7c2d12',   // orange-900
  },
];

// Tracked repos — appear in feed (Zone 2) AND directory (Zone 4)
const REPOS = [
  // Core CFW
  {
    owner: 'Atmosphere-NX', repo: 'Atmosphere',
    name: 'Atmosphere', category: 'core', tags: ['rec'],
    desc: 'The standard custom firmware. Required for everything. Start here.',
  },
  {
    owner: 'CTCaer', repo: 'hekate',
    name: 'Hekate', category: 'core', tags: ['rec'],
    desc: 'Bootloader and partition manager. Boots CFW and manages emuMMC.',
  },
  {
    owner: 'impeeza', repo: 'sys-patch',
    name: 'sys-patch', category: 'core', tags: ['rec'],
    desc: 'Patches signature checks on the fly. Replaces sigpatches files.',
  },

  // Overlays
  {
    owner: 'ppkantorski', repo: 'nx-ovlloader',
    name: 'nx-ovlloader', category: 'overlays', tags: ['rec'],
    desc: 'Required base layer for Ultrahand overlay menu.',
  },
  {
    owner: 'ppkantorski', repo: 'Ultrahand-Overlay',
    name: 'Ultrahand Overlay', category: 'overlays', tags: ['rec'],
    desc: 'Modern overlay manager with package support. Replaces Tesla.',
  },
  {
    owner: 'ppkantorski', repo: 'ovl-sysmodules',
    name: 'ovl-sysmodules', category: 'overlays',
    desc: 'Toggle sysmodules on/off from the overlay menu without rebooting.',
  },
  {
    owner: 'masagrator', repo: 'Status-Monitor-Overlay',
    name: 'Status Monitor Overlay', category: 'overlays',
    desc: 'Real-time FPS, RAM, CPU/GPU usage overlay. Essential for monitoring.',
  },
  {
    owner: 'masagrator', repo: 'FPSLocker',
    name: 'FPS Locker', category: 'overlays',
    desc: 'Lock games to 30fps to reduce battery drain and heat.',
  },
  {
    owner: 'proferabg', repo: 'EdiZon-Overlay',
    name: 'EdiZon Overlay', category: 'overlays',
    desc: 'In-game overlay for managing cheats and memory tools via Tesla-style UI.',
  },
  {
    owner: 'retronx-team', repo: 'sys-clk',
    name: 'sys-clk', category: 'overlays',
    desc: 'Overclock/underclock CPU, GPU, and memory per game.',
  },

  // Sysmodules
  {
    owner: 'masagrator', repo: 'SaltyNX',
    name: 'SaltyNX', category: 'system',
    desc: 'Plugin framework that enables per-game cheats and patches.',
  },
  {
    owner: 'ndeadly', repo: 'MissionControl',
    name: 'MissionControl', category: 'system', tags: ['rec'],
    desc: 'Use Bluetooth controllers from other platforms (PS5, Xbox, etc.).',
  },
  {
    owner: 'exelix11', repo: 'SysDVR',
    name: 'SysDVR', category: 'media',
    desc: 'Stream Switch video and audio to your PC over USB or WiFi.',
  },
  {
    owner: 'o0Zz', repo: 'sys-con',
    name: 'sys-con', category: 'system',
    desc: 'Connect controllers via USB — including adapters and legacy pads.',
  },
  {
    owner: 'DefenderOfHyrule', repo: 'ldn_mitm',
    name: 'ldn_mitm', category: 'system',
    desc: 'Enables local-play games to work over LAN/internet with Lanplay.',
  },
  {
    owner: 'masagrator', repo: 'ReverseNX-RT',
    name: 'ReverseNX-RT', category: 'system',
    desc: 'Force handheld or docked rendering mode regardless of physical state.',
  },
  {
    owner: 'HookedBehemoth', repo: 'sys-tune',
    name: 'sys-tune', category: 'media',
    desc: 'Minimalist low-memory sysmodule focused on background music playback while gaming.',
  },
  {
    owner: 'masagrator', repo: 'sys-ticon',
    name: 'sys-ticon', category: 'system',
    desc: 'Home Menu icon/title replacement sysmodule based on rendering pipeline hooks.',
  },
  {
    owner: 'XorTroll', repo: 'uLaunch',
    name: 'uLaunch', category: 'system',
    desc: 'Custom home menu alternative for advanced users and UI customization.',
  },

  // File & Save Tools
  {
    owner: 'ITotalJustice', repo: 'sphaira',
    name: 'Sphaira', category: 'core', tags: ['rec'],
    desc: 'The definitive homebrew menu replacement. Features direct file associations for ROMs and native theme downloading.',
  },
  {
    owner: 'rashevskyv', repo: 'dbi',
    name: 'DBI', category: 'files', tags: ['rec'],
    desc: 'Reliable NSP/NSZ installer with USB and MTP support. Battle-tested.',
  },
  {
    owner: 'luketanti', repo: 'CyberFoil',
    name: 'CyberFoil', category: 'files', tags: ['rec'],
    desc: 'Offline-first title installer and successor to Tinfoil. Features advanced cloud save backup and version control.',
  },
  {
    owner: 'XorTroll', repo: 'Goldleaf',
    name: 'Goldleaf', category: 'files',
    desc: 'Multi-purpose tool essential for deep file browsing, ticket management, and fixing archive bits on SD cards.',
  },
  {
    owner: 'J-D-K', repo: 'JKSV',
    name: 'JKSV', category: 'files', tags: ['rec'],
    desc: 'Save manager. Back up, restore, and transfer game saves.',
  },
  {
    owner: 'BernardoGiordano', repo: 'Checkpoint',
    name: 'Checkpoint', category: 'files',
    desc: 'Open-source save manager for backing up and restoring game saves.',
  },
  {
    owner: 'DarkMatterCore', repo: 'nxdumptool',
    name: 'nxdumptool', category: 'files',
    desc: 'Dump game cartridges and installed titles to NSP/XCI files.',
  },

  // Homebrew Apps
  {
    owner: 'fortheusers', repo: 'hb-appstore',
    name: 'HB Appstore', category: 'apps', tags: ['rec'],
    desc: 'Browse and install homebrew apps directly on your Switch.',
  },
  {
    owner: 'exelix11', repo: 'SwitchThemeInjector',
    name: 'NXThemes Installer', category: 'apps',
    desc: 'Install custom home menu themes.',
  },
  {
    owner: 'suchmememanyskill', repo: 'themezer-nx',
    name: 'themezer-nx', category: 'apps',
    desc: 'Browse and download Themezer themes directly from your Switch.',
  },
  {
    owner: 'tomvita', repo: 'EdiZon-SE',
    name: 'EdiZon-SE', category: 'apps',
    desc: 'In-game cheat manager and RAM editor.',
  },
  {
    owner: 'nadrino', repo: 'SimpleModManager',
    name: 'Simple Mod Manager', category: 'apps',
    desc: 'Enable and manage game mods with profiles and easy toggles.',
  },
  {
    owner: 'CompSciOrBust', repo: 'Amiigo',
    name: 'Amiigo', category: 'apps',
    desc: 'Amiibo manager and emulation companion for Switch homebrew.',
  },
  {
    owner: 'Hartie95', repo: 'fastCFWswitch',
    name: 'fastCFWswitch', category: 'apps',
    desc: 'Quickly reboot between stock and CFW without long boot flows.',
  },
  {
    owner: 'WerWolv', repo: 'Hekate-Toolbox',
    name: 'Hekate Toolbox', category: 'apps',
    desc: 'Utility app for common Hekate-related maintenance and configuration tasks.',
  },
  {
    owner: 'XorTroll', repo: 'emuiibo',
    name: 'Emuiibo', category: 'apps',
    desc: 'Virtual Amiibo emulation. Use any amiibo without the physical figure.',
  },
  {
    owner: 'impeeza', repo: 'linkalho',
    name: 'Linkalho', category: 'apps',
    desc: 'Link Nintendo Account offline without touching Nintendo servers.',
  },
  {
    owner: 'zdm65477730', repo: 'NX-Activity-Log',
    name: 'NX Activity Log', category: 'apps',
    desc: 'Detailed play time tracking beyond what Nintendo exposes.',
  },
  {
    owner: 'averne', repo: 'Fizeau',
    name: 'Fizeau', category: 'apps',
    desc: 'Screen color temperature control. Reduces blue light at night.',
  },

  // Streaming & Media
  {
    owner: 'streetpea', repo: 'chiaki-ng',
    name: 'Chiaki-ng', category: 'media',
    desc: 'Stream PS4/PS5 games to your Switch over your local network.',
  },
  {
    owner: 'XITRIX', repo: 'Moonlight-Switch',
    name: 'Moonlight', category: 'media', tags: ['rec'],
    desc: 'Stream PC games via Sunshine or NVIDIA GameStream to your Switch.',
  },
  {
    owner: 'dragonflylee', repo: 'switchfin',
    name: 'Switchfin', category: 'media',
    desc: 'Jellyfin media client for Switch.',
  },
  {
    owner: 'DefenderOfHyrule', repo: 'TriPlayer',
    name: 'TriPlayer', category: 'media',
    desc: 'Complete music suite with a full library app plus in-game overlay controls.',
  },
  {
    owner: 'ursusworks', repo: 'libnxbox',
    name: 'libnxbox', category: 'media',
    desc: 'Native Xbox Cloud Streaming client built to bypass browser WebRTC limits.',
  },

  // Emulation
  {
    owner: 'libretro', repo: 'RetroArch',
    name: 'RetroArch', category: 'emulation', tags: ['rec'],
    desc: 'Multi-system emulation frontend. Covers most retro consoles.',
  },
  {
    owner: 'mgba-emu', repo: 'mgba',
    name: 'mGBA', category: 'emulation',
    desc: 'Best-in-class GBA emulator. More accurate than RetroArch core.',
  },
  {
    owner: 'RSDuck', repo: 'duckstation',
    name: 'DuckStation', category: 'emulation',
    desc: 'PS1 emulator Switch port. Good performance with enhancement options.',
  },
  {
    owner: 'hrydgard', repo: 'ppsspp',
    name: 'PPSSPP', category: 'emulation',
    url: 'https://buildbot.libretro.com/nightly/nintendo/switch/libnx/latest/',
    desc: 'PSP emulator. Good performance for most titles.',
  },
  {
    owner: 'ArcDelta', repo: 'melonDS',
    name: 'melonDS', category: 'emulation',
    desc: 'DS/DSi emulator Switch port. More accurate than DeSmuME.',
  },
  {
    owner: 'flyinghead', repo: 'flycast',
    name: 'Flycast', category: 'emulation',
    desc: 'Dreamcast, Naomi, and Atomiswave emulator.',
  },
];


// ─────────────────────────────────────────────
// CACHE UTILITIES
// ─────────────────────────────────────────────

function getCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return data;
  } catch (e) { return null; }
}

function getStaleCache(key) {
  // Returns cache even if expired — used as fallback when fetch fails
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw).data;
  } catch (e) { return null; }
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
    localStorage.setItem('sh_last_gh_sync', new Date().toISOString());
  } catch (e) { /* localStorage full or unavailable */ }
}

function getLastGithubSync() {
  try {
    const direct = localStorage.getItem('sh_last_gh_sync');
    if (direct) return direct;

    let latestTs = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('gh:')) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.ts === 'number' && parsed.ts > latestTs) latestTs = parsed.ts;
    }
    return latestTs ? new Date(latestTs).toISOString() : null;
  } catch (e) {
    return null;
  }
}


// ─────────────────────────────────────────────
// GITHUB API
// ─────────────────────────────────────────────

async function fetchLatestRelease(owner, repo) {
  const key = `gh:${owner}/${repo}`;
  const cached = getCache(key);
  if (cached) return { release: cached, stale: false };

  try {
    const res = await fetch(`${GH_API}/repos/${owner}/${repo}/releases/latest`, {
      headers: { 'Accept': 'application/vnd.github+json' }
    });

    if (res.status === 404) return { release: null, stale: false }; // no releases
    if (res.status === 403) {
      // Rate limited — return stale cache if available
      const stale = getStaleCache(key);
      return stale ? { release: stale, stale: true } : { release: null, stale: true, rateLimited: true };
    }
    if (!res.ok) {
      const stale = getStaleCache(key);
      return stale ? { release: stale, stale: true } : { release: null, stale: false };
    }

    const data = await res.json();
    setCache(key, data);
    return { release: data, stale: false };
  } catch (e) {
    const stale = getStaleCache(key);
    return stale ? { release: stale, stale: true } : { release: null, stale: false };
  }
}

async function fetchRepoUpdatedAt(owner, repo) {
  const key = `ghmeta:${owner}/${repo}`;
  const cached = getCache(key);
  if (cached?.pushed_at) return cached.pushed_at;

  try {
    const res = await fetch(`${GH_API}/repos/${owner}/${repo}`, {
      headers: { 'Accept': 'application/vnd.github+json' }
    });
    if (!res.ok) {
      const stale = getStaleCache(key);
      return stale?.pushed_at || null;
    }
    const data = await res.json();
    const meta = { pushed_at: data?.pushed_at || null };
    setCache(key, meta);
    return meta.pushed_at;
  } catch (e) {
    const stale = getStaleCache(key);
    return stale?.pushed_at || null;
  }
}

const CATEGORY_SEARCH_HINTS = {
  core: ['cfw', 'custom firmware', 'boot', 'bootloader', 'firmware', 'sigpatches'],
  overlays: ['overlay', 'fps', 'performance', 'tesla', 'ultrahand', 'monitor'],
  system: ['sysmodule', 'controller', 'stream', 'module', 'home menu'],
  files: ['installer', 'file manager', 'save', 'backup', 'dump', 'transfer'],
  apps: ['homebrew', 'tool', 'utility', 'theme', 'mods', 'cheats'],
  media: ['streaming', 'cloud', 'media', 'remote play', 'video'],
  emulation: ['emulator', 'retro', 'rom', 'arcade', 'psp', 'ps1', 'dreamcast'],
};

function buildRepoKeywords(repo) {
  const out = new Set((repo.tags || []).map(String));
  const hints = CATEGORY_SEARCH_HINTS[repo.category] || [];
  hints.forEach(h => out.add(h));

  const text = `${repo.name || ''} ${repo.repo || ''} ${repo.owner || ''} ${repo.desc || ''}`.toLowerCase();
  const tokens = text.match(/[a-z0-9]+(?:-[a-z0-9]+)*/g) || [];
  tokens.forEach((t) => { if (t.length > 2) out.add(t); });

  return Array.from(out);
}

async function fetchAllReleases() {
  // Fetch all repos in parallel — much faster than sequential
  const results = await Promise.all(
    REPOS.map(async (repo) => {
      const { release, stale, rateLimited } = await fetchLatestRelease(repo.owner, repo.repo);
      const repoUpdatedAt = release ? null : await fetchRepoUpdatedAt(repo.owner, repo.repo);
      return { ...repo, keywords: buildRepoKeywords(repo), release, repoUpdatedAt, stale, rateLimited };
    })
  );
  return results;
}


// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function timeAgo(isoString) {
  const s = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (s < 60)      return 'just now';
  if (s < 3600)    return Math.floor(s / 60) + 'm ago';
  if (s < 86400)   return Math.floor(s / 3600) + 'h ago';
  if (s < 604800)  return Math.floor(s / 86400) + 'd ago';
  if (s < 2592000) return Math.floor(s / 604800) + 'w ago';
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isRecent(isoString, days = 90) {
  return (Date.now() - new Date(isoString).getTime()) < (days * 86400 * 1000);
}

function isNew(isoString) {
  const lastVisit = localStorage.getItem('sh_last_visit');
  if (!lastVisit) return isRecent(isoString, 1);
  return new Date(isoString).getTime() > new Date(lastVisit).getTime();
}

function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function truncate(str, maxLen) {
  if (!str || str.length <= maxLen) return str || '';
  return str.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
}

function stripMarkdown(str) {
  // Remove raw HTML tags first, then strip markdown syntax
  return (str || '')
    .replace(/<[^>]*>/g, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/\r?\n/g, ' ')
    .trim();
}

function hasTag(item, tag) {
  return Array.isArray(item.tags) && item.tags.includes(tag);
}

function getVersionLabel(release) {
  if (!release) return null;
  const tag = release.tag_name || '';
  const name = release.name || '';
  const isDate = (s) =>
    /^\d{4}[-/]\d{2}[-/]\d{2}$/.test(s) ||
    /^\d{2}\/\d{2}\/\d{4}$/.test(s);
  if (tag && !isDate(tag)) return tag;
  if (name && !isDate(name)) return name;
  return null;
}

// Record current visit time after storing last visit
function recordVisit() {
  const last = localStorage.getItem('sh_last_visit');
  localStorage.setItem('sh_last_visit', new Date().toISOString());
  return last;
}


// ─────────────────────────────────────────────
// ZONE 1: STATUS BAR
// ─────────────────────────────────────────────

function renderStatusBar(allRepoData, monitorData) {
  const bar = document.getElementById('status-bar-inner');
  if (!bar) return;

  const lastSync = getLastGithubSync();
  const parsedLastSync = lastSync ? new Date(lastSync) : null;
  const hasValidLastSync = !!parsedLastSync && !isNaN(parsedLastSync.getTime());
  const isSyncFresh = hasValidLastSync && (Date.now() - parsedLastSync.getTime() <= CACHE_TTL_MS);

  const dotColor = isSyncFresh ? '#34d399' : '#64748b';
  const textClass = isSyncFresh ? 'text-emerald-400' : 'text-slate-400';
  const syncText = (() => {
    if (!isSyncFresh) return 'Refresh Page';
    if (!hasValidLastSync) return `synced ${String(lastSync || 'unknown')}`;
    return `synced ${parsedLastSync.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  })();

  const html = `
    <div class="inline-flex items-center whitespace-nowrap" style="margin-left:auto;gap:8px">
      <span class="w-2 h-2 rounded-full" style="background:${dotColor}"></span>
      <span class="text-[11px] font-mono font-bold uppercase tracking-[.1em] ${textClass}">${escHtml(syncText)}</span>
    </div>`;

  bar.innerHTML = html;
}


// ─────────────────────────────────────────────
// RESOURCE DIRECTORY FILTERS
// ─────────────────────────────────────────────

function initFeedFilters(repoData) {
  const bar = document.getElementById('directory-filter-bar');
  const searchInput = document.getElementById('directory-repo-search');
  if (!bar) return;

  let activeFilter = 'all';
  let searchQuery = '';

  const rerenderDirectory = () => {
    renderCoreReposDirectory(repoData, activeFilter, searchQuery);
  };

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;

    bar.querySelectorAll('[data-cat]').forEach(b => {
      b.style.background = 'transparent';
      b.style.color = 'rgba(148,163,184,1)';
    });
    btn.style.background = 'rgba(255,255,255,.15)';
    btn.style.color = '#ffffff';

    activeFilter = btn.dataset.cat;
    rerenderDirectory();
  });

  // Style the default active button
  const allBtn = bar.querySelector('[data-cat="all"]');
  if (allBtn) {
    allBtn.style.background = 'rgba(255,255,255,.15)';
    allBtn.style.color = '#ffffff';
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      rerenderDirectory();
    });
  }
}


// ─────────────────────────────────────────────
// ZONE 3: SCENE PULSE
// ─────────────────────────────────────────────

function renderScenePulse(monitorData) {
  const zone = document.getElementById('scene-pulse');
  if (!zone) return;

  if (!monitorData) {
    zone.innerHTML = `<div class="text-[11px] text-gray-400 font-mono text-center py-6">Monitor offline</div>`;
    return;
  }

  let html = '';

  // ── Alerts section (only if data exists)
  const alerts = monitorData.alerts || [];
  if (alerts.length) {
    html += `<div class="mb-4">
      <div class="text-[10px] font-mono text-teal-400 uppercase tracking-wider mb-2">⚠ Alerts</div>
      <div class="space-y-2">`;
    alerts.forEach(a => {
      html += `<div class="px-3 py-2.5 rounded-md bg-teal-500/[.08] border border-teal-500/20 text-[12px] text-teal-300 leading-snug">${escHtml(a.message || a)}</div>`;
    });
    html += `</div></div>`;
  }

  // ── Scene chatter (Reddit/GBAtemp posts)
  const posts = monitorData.reddit || monitorData.articles || [];
  const scorePosts = (days) => posts
    .filter(p => p.timestamp && isRecent(p.timestamp, days))
    .map(p => ({
      ...p,
      score: (p.upvotes || p.ups || 0) + ((p.comments || p.num_comments || 0) * 2),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  let scoredPosts = scorePosts(7);
  if (scoredPosts.length < 3) {
    scoredPosts = scorePosts(14);
  }
  if (!scoredPosts.length && posts.length) {
    scoredPosts = posts
      .filter(p => p.timestamp)
      .map(p => ({
        ...p,
        score: (p.upvotes || p.ups || 0) + ((p.comments || p.num_comments || 0) * 2),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  if (scoredPosts.length) {
    html += `<div>
      <div class="text-[11px] font-mono font-semibold uppercase tracking-widest mb-3 pb-2" style="letter-spacing:.15em;color:rgba(255,255,255,.58);border-bottom:1px solid rgba(255,255,255,.08)">Scene Chatter</div>
      <div class="grid grid-cols-1 gap-2">`;

    scoredPosts.forEach(p => {
      const url = p.url || p.link || '#';
      const title = p.title || p.headline || 'Untitled';
      const upvotes = p.upvotes || p.ups || 0;
      const source = p.subreddit || p.source || 'GBAtemp';
      html += `
        <a href="${escHtml(url)}" target="_blank" rel="noopener"
           class="group content-card rounded-xl px-4 py-3.5 flex items-start gap-3 h-full min-h-[70px]">
          <div class="flex-1 min-w-0">
            <div class="text-[13px] font-semibold leading-snug mb-2 line-clamp-2" style="color:#eeeeee">${escHtml(title)}</div>
            <div class="flex items-center gap-2 flex-wrap">
              ${upvotes ? `<span class="inline-flex items-center gap-1 text-[9px] font-mono" style="color:rgba(255,255,255,.7)"><svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 12 12"><path d="M6 1L1 7h3.5v4h3V7H11z"/></svg>${upvotes}</span>` : ''}
              <span class="text-[9px] font-mono" style="color:rgba(255,255,255,.7)">${escHtml(source)}</span>
              <span class="text-[9px] font-mono" style="color:rgba(255,255,255,.7)">${timeAgo(p.timestamp)}</span>
            </div>
          </div>
        </a>`;
    });

    html += `</div></div>`;
  }

  if (!html) {
    html = `<div class="text-[11px] text-gray-400 font-mono text-center py-6">Nothing notable this week</div>`;
  }

  zone.innerHTML = html;
}


// ─────────────────────────────────────────────
// ZONE 4: RESOURCE DIRECTORY
// ─────────────────────────────────────────────

function renderDirectory(repoData) {
  renderCoreReposDirectory(repoData);
}

function renderCoreReposDirectory(repoData, filter = 'all', query = '') {
  const container = document.getElementById('dir-repos');
  if (!container) return;

  let html = '';
  const normalizedQuery = (query || '').trim().toLowerCase();
  let firstGroup = true;
  CATEGORIES.forEach(cat => {
    if (filter !== 'all' && filter !== 'rec' && cat.key !== filter) return;
    let items = repoData.filter(r => r.category === cat.key);
    if (filter === 'rec') items = items.filter(r => hasTag(r, 'rec'));
    if (normalizedQuery) {
      items = items.filter((r) => {
        const searchText = `${r.name || ''} ${r.repo || ''} ${r.owner || ''} ${r.desc || ''} ${(r.keywords || []).join(' ')}`.toLowerCase();
        return searchText.includes(normalizedQuery);
      });
    }
    if (!items.length) return;
    items.sort((a, b) => {
      const aRec = hasTag(a, 'rec') ? 0 : 1;
      const bRec = hasTag(b, 'rec') ? 0 : 1;
      if (aRec !== bRec) return aRec - bRec;
      return (a.name || '').localeCompare(b.name || '');
    });
    const groupSpacing = firstGroup ? '' : ' mt-8';
    firstGroup = false;

    html += `<div class="mb-6${groupSpacing}">
      <div class="flex items-center gap-3 mb-4">
        <span style="width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${cat.color};box-shadow:0 0 6px ${cat.color}99"></span>
        <span class="text-[11px] font-mono font-semibold uppercase tracking-widest" style="letter-spacing:.15em;color:rgba(255,255,255,.58)">${cat.label}</span>
        <div class="flex-1 h-px" style="background:linear-gradient(to right,${cat.color} 0%,rgba(255,255,255,.05) 10%,rgba(255,255,255,.05) 100%)"></div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" style="gap:16px">`;

    items.forEach(r => {
      const updatedAt = r.release?.published_at || r.repoUpdatedAt || null;
      const ghUrl = r.url || `https://github.com/${r.owner}/${r.repo}`;
      const repoLabel = (r.name || r.repo || '').trim();
      const repoLetter = repoLabel ? repoLabel[0].toUpperCase() : '?';
      const logoUrl = r.owner ? `https://avatars.githubusercontent.com/${encodeURIComponent(r.owner)}?size=64` : '';

      const recPill = hasTag(r, 'rec')
        ? '<span class="rec-pill" style="position:absolute;top:18px;right:18px">REC</span>'
        : '';

      const avatarContent = logoUrl
        ? `<img src="${logoUrl}" alt="${escHtml(r.name)} logo" style="width:100%;height:100%;object-fit:cover" decoding="async" referrerpolicy="no-referrer">`
        : `<span style="font-size:18px;font-weight:700;color:rgba(255,255,255,.7)">${escHtml(repoLetter)}</span>`;

      const avatarImg = r.owner
        ? `<img src="https://avatars.githubusercontent.com/${encodeURIComponent(r.owner)}?size=32" style="width:14px;height:14px;border-radius:50%;object-fit:cover;flex-shrink:0;opacity:.8" decoding="async" referrerpolicy="no-referrer">`
        : '';
      const ownerText = r.owner
        ? `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:rgba(255,255,255,.72);font-family:ui-monospace,monospace">${avatarImg}${escHtml(r.owner)}</span>`
        : '';
      const clockIcon = `<svg style="width:11px;height:11px;flex-shrink:0;opacity:.7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
      const dateText = updatedAt
        ? `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:rgba(255,255,255,.72);font-family:ui-monospace,monospace">${clockIcon}${timeAgo(updatedAt)}</span>`
        : '';
      const dotSep = ownerText && dateText
        ? '<span style="width:1px;height:10px;background:rgba(255,255,255,.18);flex-shrink:0;border-radius:1px;margin:0 2px"></span>'
        : '';

      html += `
        <a href="${ghUrl}" target="_blank" rel="noopener" class="dir-card">
          ${recPill}
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;padding-right:${hasTag(r, 'rec') ? '44px' : '0'}">
            <div style="width:48px;height:48px;border-radius:14px;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)">
              ${avatarContent}
            </div>
            <span style="font-size:15px;font-weight:800;color:#ffffff;line-height:1.25;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;text-shadow:0 0 20px rgba(255,255,255,.2)">${escHtml(r.name)}</span>
          </div>
          <p style="font-size:12px;color:rgba(255,255,255,.7);line-height:1.55;flex:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin:0;padding:0">${escHtml(r.desc)}</p>
          <div style="display:flex;align-items:center;gap:8px;margin-top:10px;flex-shrink:0">
            ${ownerText}${dotSep}${dateText}
          </div>
        </a>`;
    });

    html += `</div></div>`;
  });

  if (!html) {
    container.innerHTML = `<div class="rounded-xl border border-white/[.08] bg-white/[.03] px-4 py-6 text-center text-sm text-slate-400">That repository is dead, missing, or currently the subject of federal litigation.<br>For more information see <a href="/legal/" class="text-cyan-400 hover:text-cyan-300 underline">here</a>.</div>`;
    return;
  }
  container.innerHTML = html;
}


// ─────────────────────────────────────────────
// SKELETON / LOADING STATES
// ─────────────────────────────────────────────

function showStatusBarSkeleton() {
  const bar = document.getElementById('status-bar-inner');
  if (!bar) return;
  bar.innerHTML = `
    <div class="h-4 w-44 skel rounded-sm" style="margin-left:auto"></div>`;
}


// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────

async function init() {
  recordVisit();
  showStatusBarSkeleton();

  // Fetch monitor data and GitHub releases in parallel
  const [monitorData, allRepoData] = await Promise.all([
    fetch(MONITOR_JSON).then(r => r.ok ? r.json() : null).catch(() => null),
    fetchAllReleases(),
  ]);

  // Render all zones
  renderStatusBar(allRepoData, monitorData);
  renderCoreReposDirectory(allRepoData, 'all');
  initFeedFilters(allRepoData);
  renderScenePulse(monitorData);
}

document.addEventListener('DOMContentLoaded', init);
