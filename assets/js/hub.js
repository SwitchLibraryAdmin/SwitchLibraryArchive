'use strict';

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const GH_API = 'https://switchhack-hub.lunt34.workers.dev';
const MONITOR_JSON = 'data/monitor_data.json';

// Category definitions — order controls display order in feed and directory
const CATEGORIES = [
  {
    key: 'core', label: 'Core System',
    color: '#22d3ee',       // cyan-400
    colorMid: '#06b6d4',    // cyan-500
    colorDark: '#164e63',   // cyan-900
  },
  {
    key: 'overlays', label: 'Overlays & Performance',
    color: '#e879f9',       // fuchsia-400
    colorMid: '#d946ef',    // fuchsia-500
    colorDark: '#701a75',   // fuchsia-900
  },
  {
    key: 'system', label: 'System Modules',
    color: '#fbbf24',       // amber-400
    colorMid: '#f59e0b',    // amber-500
    colorDark: '#78350f',   // amber-900
  },
  {
    key: 'files', label: 'File & Save Tools',
    color: '#38bdf8',       // sky-400
    colorMid: '#0ea5e9',    // sky-500
    colorDark: '#0c4a6e',   // sky-900
  },
  {
    key: 'apps', label: 'Apps & Utilities',
    color: '#a78bfa',       // violet-400
    colorMid: '#8b5cf6',    // violet-500
    colorDark: '#4c1d95',   // violet-900
  },
  {
    key: 'media', label: 'Streaming & Media',
    color: '#fb7185',       // rose-400
    colorMid: '#f43f5e',    // rose-500
    colorDark: '#881337',   // rose-900
  },
  {
    key: 'emulation', label: 'Emulation',
    color: '#34d399',       // emerald-400
    colorMid: '#10b981',    // emerald-500
    colorDark: '#064e3b',   // emerald-900
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
    owner: 'olliz0r', repo: 'sys-botbase',
    name: 'sys-botbase', category: 'system',
    desc: 'Remote control sysmodule used for automation bots.',
  },
  {
    owner: 'HookedBehemoth', repo: 'sys-tune',
    name: 'sys-tune', category: 'system',
    desc: 'Background music player. Play audio while using other apps.',
  },

  // File & Save Tools
  {
    owner: 'ITotalJustice', repo: 'sphaira',
    name: 'Sphaira', category: 'files', tags: ['rec'],
    desc: 'Modern homebrew launcher and NSP installer. Recommended for most users.',
  },
  {
    owner: 'rashevskyv', repo: 'dbi',
    name: 'DBI', category: 'files', tags: ['rec'],
    desc: 'Reliable NSP/NSZ installer with USB and MTP support. Battle-tested.',
  },
  {
    owner: 'luketanti', repo: 'CyberFoil',
    name: 'CyberFoil', category: 'files', tags: ['rec'],
    desc: 'Title manager and installer with a clean, modern UI.',
  },
  {
    owner: 'XorTroll', repo: 'Goldleaf',
    name: 'Goldleaf', category: 'files',
    desc: 'Full-featured title manager, ticket editor, and account manager.',
  },
  {
    owner: 'J-D-K', repo: 'JKSV',
    name: 'JKSV', category: 'files', tags: ['rec'],
    desc: 'Save manager. Back up, restore, and transfer game saves.',
  },
  {
    owner: 'DarkMatterCore', repo: 'nxdumptool',
    name: 'nxdumptool', category: 'files',
    desc: 'Dump game cartridges and installed titles to NSP/XCI files.',
  },
  {
    owner: 'mtheall', repo: 'ftpd',
    name: 'ftpd PRO', category: 'files',
    desc: 'FTP server sysmodule. Transfer files wirelessly from your PC.',
  },

  // Homebrew Apps
  {
    owner: 'fortheusers', repo: 'hb-appstore',
    name: 'HB Appstore', category: 'apps', tags: ['rec'],
    desc: 'Browse and install homebrew apps directly on your Switch.',
  },
  {
    owner: 'HamletDuFromage', repo: 'AIO-switch-updater',
    name: 'AIO Switch Updater', category: 'apps',
    desc: 'Update Atmosphere, Hekate, sigpatches, and cheats all in one place.',
  },
  {
    owner: 'exelix11', repo: 'SwitchThemeInjector',
    name: 'NXThemes Installer', category: 'apps',
    desc: 'Install custom home menu themes.',
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
  {
    owner: 'tomvita', repo: 'Breeze-Beta',
    name: 'Breeze', category: 'apps',
    desc: 'Memory editor and cheat creator for advanced users.',
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
  } catch (e) { /* localStorage full or unavailable */ }
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

async function fetchAllReleases() {
  // Fetch all repos in parallel — much faster than sequential
  const results = await Promise.all(
    REPOS.map(async (repo) => {
      const { release, stale, rateLimited } = await fetchLatestRelease(repo.owner, repo.repo);
      return { ...repo, release, stale, rateLimited };
    })
  );
  return results;
}


// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function timeAgo(isoString) {
  const s = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (s < 60)     return 'just now';
  if (s < 3600)   return Math.floor(s / 60) + 'm ago';
  if (s < 86400)  return Math.floor(s / 3600) + 'h ago';
  if (s < 604800) return Math.floor(s / 86400) + 'd ago';
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

  // Get Atmosphere and Hekate from release data
  const atmo  = allRepoData.find(r => r.repo === 'Atmosphere');
  const hekate = allRepoData.find(r => r.repo === 'hekate');

  // Helper to clean up version prefixes for the bold text
  const formatTag = (tag) => {
    if (!tag) return '—';
    return tag.replace(/^v/i, '').replace(/^hekate_ctcaer_/i, '');
  };

  // Helper to force strictly "X ago" format for the tooltips
  const timeAgoStrict = (dateString) => {
    if (!dateString) return 'Could not fetch';
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate)) return 'Could not fetch';
    const diffMs = new Date() - parsedDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Released today';
    if (diffDays < 30) return `Released ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return `Released ${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
  };

  const fw = monitorData?.dashboard_stats?.recommended_firmware || '—';

  // Determine overall status
  const anyRateLimited = allRepoData.some(r => r.rateLimited);
  const anyStale = allRepoData.some(r => r.stale);

  const chips = [
    {
      label: 'FIRMWARE',
      value: fw,
      status: fw === '—' ? 'unknown' : 'stable',
      tip: 'Latest recommended Switch firmware',
    },
    {
      label: 'ATMOSPHERE',
      value: formatTag(atmo?.release?.tag_name),
      status: atmo?.release ? 'stable' : 'unknown',
      stale: atmo?.stale,
      tip: atmo?.release?.published_at ? timeAgoStrict(atmo.release.published_at) : 'Could not fetch',
    },
    {
      label: 'HEKATE',
      value: formatTag(hekate?.release?.tag_name),
      status: hekate?.release ? 'stable' : 'unknown',
      stale: hekate?.stale,
      tip: hekate?.release?.published_at ? timeAgoStrict(hekate.release.published_at) : 'Could not fetch',
    },
  ];

  const colors = {
    stable:  { dot: '#34d399', text: 'text-emerald-400', border: 'border-l-emerald-500', bg: 'bg-emerald-500/[.06]' },
    unknown: { dot: '#64748b', text: 'text-slate-400',   border: 'border-l-slate-600',   bg: 'bg-white/[.05]'       },
    caution: { dot: '#2dd4bf', text: 'text-teal-400',    border: 'border-l-teal-500',    bg: 'bg-teal-500/[.06]'    },
  };

  let html = '';
  chips.forEach(chip => {
    const c = colors[chip.status] || colors.unknown;
    html += `
      <div class="${c.bg} border-l-4 ${c.border} rounded-sm px-3.5 py-2 w-36 h-14 flex flex-col justify-center flex-shrink-0 relative group cursor-default">
        <div class="flex items-center gap-2">
          <span class="text-lg font-bold font-mono text-gray-100 leading-tight tracking-tight">${escHtml(chip.value)}</span>
          <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" style="background:${c.dot}"></span>
          ${chip.stale ? '<span class="text-[9px] font-mono text-teal-400 uppercase">stale</span>' : ''}
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-[.12em]">${chip.label}</span>
        </div>
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 border border-white/10 rounded text-[10px] text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
          ${escHtml(chip.tip)}
        </div>
      </div>`;
  });

  // Overall status chip
  let overallColor = '#34d399', overallLabel = 'Scene OK';
  if (anyRateLimited) { overallColor = '#2dd4bf'; overallLabel = 'Rate Limited'; }
  if (anyStale)       { overallColor = '#2dd4bf'; overallLabel = 'Some Stale';  }

  const lastSync = monitorData?.dashboard_stats?.lastSync;
  html += `
    <div class="ml-auto flex items-center gap-3 pl-4 border-l border-white/10">
      <div class="flex items-center gap-1.5">
        <span class="pulse-dot" style="background:${overallColor}"></span>
        <span class="text-[10px] font-mono uppercase tracking-wide" style="color:${overallColor}">${overallLabel}</span>
      </div>
      ${lastSync ? `<span class="text-[10px] font-mono text-gray-400">synced ${isNaN(new Date(lastSync).getTime()) ? 'recently' : timeAgo(lastSync)}</span>` : ''}
    </div>`;

  bar.innerHTML = html;
}


// ─────────────────────────────────────────────
// RESOURCE DIRECTORY FILTERS
// ─────────────────────────────────────────────

function initFeedFilters(repoData) {
  const bar = document.getElementById('directory-filter-bar');
  if (!bar) return;

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;

    bar.querySelectorAll('[data-cat]').forEach(b => {
      if (b.dataset.cat === 'rec') {
        b.style.background = 'rgba(59,130,246,.15)';
        b.style.color = '#60a5fa';
        b.style.borderColor = 'rgba(59,130,246,.4)';
      } else {
        b.style.background = 'transparent';
        b.style.color = 'rgba(100,116,139,1)';
        b.style.borderColor = 'rgba(255,255,255,.10)';
      }
    });
    if (btn.dataset.cat === 'rec') {
      btn.style.background = 'rgba(59,130,246,.35)';
      btn.style.color = '#93bbfd';
      btn.style.borderColor = 'rgba(59,130,246,.6)';
    } else {
      btn.style.background = 'rgba(255,255,255,.1)';
      btn.style.color = 'rgba(255,255,255,.9)';
      btn.style.borderColor = 'rgba(255,255,255,.15)';
    }

    renderCoreReposDirectory(repoData, btn.dataset.cat);
  });

  // Style the default active button
  const allBtn = bar.querySelector('[data-cat="all"]');
  if (allBtn) {
    allBtn.style.background = 'rgba(255,255,255,.08)';
    allBtn.style.color = 'rgba(255,255,255,.9)';
    allBtn.style.borderColor = 'rgba(255,255,255,.15)';
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
      <div class="w-full flex justify-center items-center py-4">
        <svg class="text-gray-600 w-full h-auto max-w-sm" viewBox="0 0 200 100">
          
          <g stroke="currentColor" fill="none" stroke-width="0.3" stroke-dasharray="100 100" pathLength="100" marker-start="url(#circuit-circle-marker)" opacity="0">
            <path stroke-dasharray="100 100" pathLength="100" d="M 10 20 h 79.5 q 5 0 5 5 v 30" />
            <path stroke-dasharray="100 100" pathLength="100" d="M 180 10 h -69.7 q -5 0 -5 5 v 30" />
            <path d="M 130 20 v 21.8 q 0 5 -5 5 h -10" />
            <path d="M 170 80 v -21.8 q 0 -5 -5 -5 h -50" />
            <path stroke-dasharray="100 100" pathLength="100" d="M 135 65 h 15 q 5 0 5 5 v 10 q 0 5 -5 5 h -39.8 q -5 0 -5 -5 v -20" />
            <path d="M 94.8 95 v -36" />
            <path d="M 88 88 v -15 q 0 -5 -5 -5 h -10 q -5 0 -5 -5 v -5 q 0 -5 5 -5 h 14" />
            <path d="M 30 30 h 25 q 5 0 5 5 v 6.5 q 0 5 5 5 h 20" />
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1s" repeatCount="indefinite" calcMode="spline" keySplines="0.25,0.1,0.5,1" keyTimes="0; 1" />
          </g>
      
          <g mask="url(#circuit-mask-1)">
            <circle cx="0" cy="0" r="8" fill="url(#circuit-blue-grad)">
              <animateMotion dur="5s" repeatCount="indefinite" begin="1s">
                <mpath href="#circuit-path-1" />
              </animateMotion>
            </circle>
          </g>
          <g mask="url(#circuit-mask-2)">
            <circle cx="0" cy="0" r="8" fill="url(#circuit-yellow-grad)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="6s">
                <mpath href="#circuit-path-2" />
              </animateMotion>
            </circle>
          </g>
          <g mask="url(#circuit-mask-3)">
            <circle cx="0" cy="0" r="8" fill="url(#circuit-pinkish-grad)">
              <animateMotion dur="6s" repeatCount="indefinite" begin="4s">
                <mpath href="#circuit-path-3" />
              </animateMotion>
            </circle>
          </g>
          <g mask="url(#circuit-mask-4)">
            <circle cx="0" cy="0" r="8" fill="url(#circuit-white-grad)">
              <animateMotion dur="3s" repeatCount="indefinite" begin="3s">
                <mpath href="#circuit-path-4" />
              </animateMotion>
            </circle>
          </g>
          <g mask="url(#circuit-mask-5)">
            <circle cx="0" cy="0" r="8" fill="url(#circuit-green-grad)">
              <animateMotion dur="4s" repeatCount="indefinite" begin="9s">
                <mpath href="#circuit-path-5" />
              </animateMotion>
            </circle>
          </g>
          <g mask="url(#circuit-mask-6)">
            <circle cx="0" cy="0" r="8" fill="url(#circuit-orange-grad)">
              <animateMotion dur="7s" repeatCount="indefinite" begin="3s">
                <mpath href="#circuit-path-6" />
              </animateMotion>
            </circle>
          </g>
          <g mask="url(#circuit-mask-7)">
            <circle cx="0" cy="0" r="8" fill="url(#circuit-cyan-grad)">
              <animateMotion dur="4s" repeatCount="indefinite" begin="4s">
                <mpath href="#circuit-path-7" />
              </animateMotion>
            </circle>
          </g>
          <g mask="url(#circuit-mask-8)">
            <circle cx="0" cy="0" r="8" fill="url(#circuit-rose-grad)">
              <animateMotion dur="3s" repeatCount="indefinite" begin="3s">
                <mpath href="#circuit-path-8" />
              </animateMotion>
            </circle>
          </g>
      
          <g filter="url(#circuit-light-shadow)">
            <rect x="76" y="38" width="12" height="24" rx="4" fill="#00c3e3" />
            <circle cx="82" cy="44" r="2" fill="#222" /> <circle cx="82" cy="52" r="1.2" fill="#222" /> <circle cx="80" cy="50" r="1.2" fill="#222" />
            <circle cx="84" cy="50" r="1.2" fill="#222" />
            <circle cx="82" cy="48" r="1.2" fill="#222" />
            
            <rect x="112" y="38" width="12" height="24" rx="4" fill="#f5343f" />
            <circle cx="118" cy="54" r="2" fill="#222" /> <circle cx="118" cy="46" r="1.2" fill="#222" /> <circle cx="116" cy="44" r="1.2" fill="#222" />
            <circle cx="120" cy="44" r="1.2" fill="#222" />
            <circle cx="118" cy="42" r="1.2" fill="#222" />
      
            <rect x="85" y="36" width="30" height="28" rx="2" fill="#181818" />
            <rect x="87" y="38" width="26" height="24" rx="1" fill="#050505" />
      
            <text x="100" y="52" font-size="5" fill="url(#circuit-text-gradient)" font-weight="bold" letter-spacing="0.1em" text-anchor="middle">
              NX
            </text>
          </g>
      
          <defs>
            <path id="circuit-path-1" d="M 10 20 h 79.5 q 5 0 5 5 v 30" />
            <path id="circuit-path-2" d="M 180 10 h -69.7 q -5 0 -5 5 v 30" />
            <path id="circuit-path-3" d="M 130 20 v 21.8 q 0 5 -5 5 h -10" />
            <path id="circuit-path-4" d="M 170 80 v -21.8 q 0 -5 -5 -5 h -50" />
            <path id="circuit-path-5" d="M 135 65 h 15 q 5 0 5 5 v 10 q 0 5 -5 5 h -39.8 q -5 0 -5 -5 v -20" />
            <path id="circuit-path-6" d="M 94.8 95 v -36" />
            <path id="circuit-path-7" d="M 88 88 v -15 q 0 -5 -5 -5 h -10 q -5 0 -5 -5 v -5 q 0 -5 5 -5 h 14" />
            <path id="circuit-path-8" d="M 30 30 h 25 q 5 0 5 5 v 6.5 q 0 5 5 5 h 20" />

            <mask id="circuit-mask-1" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse"><path d="M 10 20 h 79.5 q 5 0 5 5 v 24" stroke-width="0.5" stroke="white" /></mask>
            <mask id="circuit-mask-2" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse"><path d="M 180 10 h -69.7 q -5 0 -5 5 v 24" stroke-width="0.5" stroke="white" /></mask>
            <mask id="circuit-mask-3" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse"><path d="M 130 20 v 21.8 q 0 5 -5 5 h -10" stroke-width="0.5" stroke="white" /></mask>
            <mask id="circuit-mask-4" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse"><path d="M 170 80 v -21.8 q 0 -5 -5 -5 h -50" stroke-width="0.5" stroke="white" /></mask>
            <mask id="circuit-mask-5" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse"><path d="M 135 65 h 15 q 5 0 5 5 v 10 q 0 5 -5 5 h -39.8 q -5 0 -5 -5 v -20" stroke-width="0.5" stroke="white" /></mask>
            <mask id="circuit-mask-6" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse"><path d="M 94.8 95 v -36" stroke-width="0.5" stroke="white" /></mask>
            <mask id="circuit-mask-7" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse"><path d="M 88 88 v -15 q 0 -5 -5 -5 h -10 q -5 0 -5 -5 v -5 q 0 -5 5 -5 h 14" stroke-width="0.5" stroke="white" /></mask>
            <mask id="circuit-mask-8" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse"><path d="M 30 30 h 25 q 5 0 5 5 v 6.5 q 0 5 5 5 h 20" stroke-width="0.5" stroke="white" /></mask>
      
            <radialGradient id="circuit-blue-grad" cx="50%" cy="50%" r="50%" fx="100%" fy="50%">
              <stop offset="0%" stop-color="#00E8ED" stop-opacity="1" />
              <stop offset="50%" stop-color="#0088FF" stop-opacity="0.8" />
              <stop offset="100%" stop-color="#0088FF" stop-opacity="0" />
            </radialGradient>
            
            <radialGradient id="circuit-yellow-grad" cx="50%" cy="50%" r="50%" fx="100%" fy="50%">
              <stop offset="0%" stop-color="#FFD800" stop-opacity="1" />
              <stop offset="100%" stop-color="#FFD800" stop-opacity="0" />
            </radialGradient>
            
            <radialGradient id="circuit-pinkish-grad" cx="50%" cy="50%" r="50%" fx="100%" fy="50%">
              <stop offset="0%" stop-color="#830CD1" stop-opacity="1" />
              <stop offset="50%" stop-color="#FF008B" stop-opacity="0.8" />
              <stop offset="100%" stop-color="#FF008B" stop-opacity="0" />
            </radialGradient>
            
            <radialGradient id="circuit-white-grad" cx="50%" cy="50%" r="50%" fx="100%" fy="50%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
            </radialGradient>
            
            <radialGradient id="circuit-green-grad" cx="50%" cy="50%" r="50%" fx="100%" fy="50%">
              <stop offset="0%" stop-color="#22c55e" stop-opacity="1" />
              <stop offset="100%" stop-color="#22c55e" stop-opacity="0" />
            </radialGradient>
            
            <radialGradient id="circuit-orange-grad" cx="50%" cy="50%" r="50%" fx="100%" fy="50%">
              <stop offset="0%" stop-color="#f97316" stop-opacity="1" />
              <stop offset="100%" stop-color="#f97316" stop-opacity="0" />
            </radialGradient>
            
            <radialGradient id="circuit-cyan-grad" cx="50%" cy="50%" r="50%" fx="100%" fy="50%">
              <stop offset="0%" stop-color="#06b6d4" stop-opacity="1" />
              <stop offset="100%" stop-color="#06b6d4" stop-opacity="0" />
            </radialGradient>
            
            <radialGradient id="circuit-rose-grad" cx="50%" cy="50%" r="50%" fx="100%" fy="50%">
              <stop offset="0%" stop-color="#f43f5e" stop-opacity="1" />
              <stop offset="100%" stop-color="#f43f5e" stop-opacity="0" />
            </radialGradient>
      
            <linearGradient id="circuit-text-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#666">
                <animate attributeName="offset" values="-2; -1; 0" dur="5s" repeatCount="indefinite" calcMode="spline" keyTimes="0; 0.5; 1" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
              </stop>
              <stop offset="25%" stop-color="white">
                <animate attributeName="offset" values="-1; 0; 1" dur="5s" repeatCount="indefinite" calcMode="spline" keyTimes="0; 0.5; 1" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
              </stop>
              <stop offset="50%" stop-color="#666">
                <animate attributeName="offset" values="0; 1; 2;" dur="5s" repeatCount="indefinite" calcMode="spline" keyTimes="0; 0.5; 1" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
              </stop>
            </linearGradient>
      
            <filter id="circuit-light-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="1.5" dy="1.5" stdDeviation="2" flood-color="black" flood-opacity="0.3" />
            </filter>
      
            <marker id="circuit-circle-marker" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="18" markerHeight="18">
              <circle cx="5" cy="5" r="2" fill="black" stroke="#333" stroke-width="0.5">
                <animate attributeName="r" values="0; 3; 2" dur="0.5s" />
              </circle>
            </marker>
          </defs>
        </svg>
      </div>
      <div class="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-2">Scene Chatter</div>
      <div class="space-y-1.5">`;

    scoredPosts.forEach(p => {
      const url = p.url || p.link || '#';
      const title = p.title || p.headline || 'Untitled';
      const upvotes = p.upvotes || p.ups || 0;
      const source = p.subreddit || p.source || 'GBAtemp';
      html += `
        <a href="${escHtml(url)}" target="_blank" rel="noopener"
           class="block rounded-md p-3 transition-all hover:bg-white/[.07] group" style="background:rgba(255,255,255,.025)">
          <div class="text-[12.5px] leading-snug font-medium text-gray-100 group-hover:text-white transition-colors mb-1.5 line-clamp-2">${escHtml(title)}</div>
          <div class="flex items-center gap-2 flex-wrap">
            ${upvotes ? `<span class="inline-flex items-center gap-1 px-1.5 py-px rounded text-[10px] font-semibold" style="color:#60a5fa;background:rgba(59,130,246,.12)"><svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 12 12"><path d="M6 1L1 7h3.5v4h3V7H11z"/></svg>${upvotes}</span>` : ''}
            <span class="text-[10px] font-mono text-gray-400">${escHtml(source)}</span>
            <span class="text-[10px] font-mono text-gray-400">${timeAgo(p.timestamp)}</span>
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

function renderCoreReposDirectory(repoData, filter = 'all') {
  const container = document.getElementById('dir-repos');
  if (!container) return;

  let html = '';
  let firstGroup = true;
  CATEGORIES.forEach(cat => {
    if (filter !== 'all' && filter !== 'rec' && cat.key !== filter) return;
    let items = repoData.filter(r => r.category === cat.key);
    if (filter === 'rec') items = items.filter(r => hasTag(r, 'rec'));
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
      <div class="flex items-center gap-2 mb-2">
        <span class="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style="background:${cat.color}"></span>
        <span class="text-sm font-bold uppercase tracking-wider" style="color:${cat.color};opacity:.7">${cat.label}</span>
        <div class="flex-1 h-px bg-white/[.06]"></div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">`;

    items.forEach(r => {
      const updatedAt = r.release?.published_at || null;
      const ghUrl = r.url || `https://github.com/${r.owner}/${r.repo}`;
      const repoLabel = (r.name || r.repo || '').trim();
      const repoLetter = repoLabel ? repoLabel[0].toUpperCase() : '?';
      const logoUrl = r.owner ? `https://github.com/${encodeURIComponent(r.owner)}.png?size=64` : '';
      
      const recBadge = hasTag(r, 'rec')
        ? '<span class="text-[9px] px-1.5 py-px rounded font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm flex-shrink-0">REC</span>'
        : '';

      const avatarHtml = logoUrl 
        ? `<img src="${logoUrl}" alt="${escHtml(r.name)} logo" class="w-full h-full object-contain p-1" loading="lazy">`
        : `<span class="text-[14px] font-bold text-gray-100">${escHtml(repoLetter)}</span>`;

      const dateHtml = updatedAt
        ? `<span class="text-[10px] font-mono text-gray-300">${timeAgo(updatedAt)}</span>`
        : '';

      html += `
        <a href="${ghUrl}" target="_blank" rel="noopener"
           class="group glass relative overflow-hidden rounded-md p-3 transition-all border border-white/10 hover:border-white/20 flex items-start gap-3 min-h-[85px]"
           style="border-left:2px solid ${cat.colorMid}66">

          <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></div>

          <div class="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 text-sm overflow-hidden z-10" style="background:${cat.colorDark}4D;border:1px solid ${cat.colorMid}80">
            ${avatarHtml}
          </div>

          <div class="flex-1 min-w-0 z-10">
            <div class="flex items-center gap-2 mb-1 min-w-0">
              <span class="text-[13px] font-medium text-gray-100 group-hover:text-white transition-colors truncate">${escHtml(r.name)}</span>
              ${recBadge}
            </div>
            <p class="text-[11px] text-gray-400 leading-relaxed pr-2 pb-5">${escHtml(r.desc)}</p>
          </div>

          <div class="absolute flex items-center gap-2 z-10 pointer-events-none" style="top:8px;right:12px">
            ${dateHtml}
            <svg class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-gray-500 group-hover:text-cyan-400 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </div>
        </a>`;
    });

    html += `</div></div>`;
  });

  container.innerHTML = html;
}


// ─────────────────────────────────────────────
// SKELETON / LOADING STATES
// ─────────────────────────────────────────────

function showStatusBarSkeleton() {
  const bar = document.getElementById('status-bar-inner');
  if (!bar) return;
  bar.innerHTML = `
    <div class="h-14 w-32 skel rounded-sm flex-shrink-0"></div>
    <div class="h-14 w-32 skel rounded-sm flex-shrink-0"></div>
    <div class="h-14 w-32 skel rounded-sm flex-shrink-0"></div>`;
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
