(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const isGuide = page === 'guide.html';
  const isIntel = page === 'intel.html';
  const isMonitor = page === 'hub.html';
  const isHome = page === '' || page === 'index.html';
  const homeHref = isHome ? '#hero' : 'index.html';

  const linkClass = 'text-sm transition-colors';
  const active = linkClass + ' text-white';
  const inactive = linkClass + ' text-gray-400 hover:text-white';

  const navHTML = `
  <style>
    .nav-group:hover .nav-dropdown { display: block !important; }
    .nav-group:hover .nav-chevron { transform: rotate(180deg); }
  </style>
  <nav class="fixed top-0 inset-x-0 z-50 border-b border-white/10" style="background-color: rgba(15,23,42,0.9)">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">

      <!-- Logo -->
      <a href="${homeHref}" class="font-mono font-bold text-xl tracking-tight text-white glitch-hover">
        Switch<span class="text-cyan-400">Hack</span>
      </a>

      <!-- Desktop nav -->
      <div class="hidden md:flex items-center gap-8">

        <!-- Start Here dropdown (hover-based via custom nav-group CSS) -->
        <div class="relative nav-group">
          <a href="${homeHref}" class="${inactive} flex items-center gap-1.5" aria-haspopup="true">
            Start Here
            <svg class="w-3 h-3 transition-transform duration-200 nav-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
            </svg>
          </a>
          <!-- pt-3 acts as an invisible bridge so the mouse doesn't fall off -->
          <div class="absolute left-0 top-full pt-3 hidden nav-dropdown w-52 z-50">
            <div class="bg-slate-800 border border-white/10 rounded-xl py-1.5 shadow-xl shadow-black/50">
              <a href="about.html" class="block px-4 py-2.5 text-sm text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors">About Me</a>
              <a href="404.html" class="block px-4 py-2.5 text-sm text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors">The Showcase</a>
              <a href="prep.html" class="block px-4 py-2.5 text-sm text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors">Prerequisites</a>
              <a href="guide.html" class="block px-4 py-2.5 text-sm text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors">The Manual</a>
            </div>
          </div>
        </div>

        <a href="guide.html" class="${isGuide ? active : inactive}"${isGuide ? ' aria-current="page"' : ''}>Guide</a>
        <a href="intel.html" class="${isIntel ? active : inactive}"${isIntel ? ' aria-current="page"' : ''}>Intel</a>
        <a href="hub.html" class="${isMonitor ? active : inactive}"${isMonitor ? ' aria-current="page"' : ''}>Hub</a>
      </div>

      <!-- Mobile hamburger -->
      <button id="mobile-menu-btn" class="md:hidden p-2 -mr-2 text-gray-400 hover:text-white" aria-label="Menu">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
    </div>

    <!-- Mobile menu panel -->
    <div id="mobile-menu" class="hidden md:hidden border-t border-white/10" style="background-color: rgba(15,23,42,0.95)">
      <div class="px-6 py-4 flex flex-col gap-4">

        <!-- Start Here (mobile click-toggle) -->
        <div>
          <button id="start-here-btn" class="${inactive} flex items-center gap-1.5 w-full" aria-haspopup="true" aria-expanded="false">
            Start Here
            <svg id="start-here-chevron" class="w-3 h-3 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div id="start-here-menu" class="hidden mt-2 ml-1 pl-3 border-l border-white/10 flex flex-col gap-1">
            <a href="about.html" class="block py-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors">About Me</a>
            <a href="404.html" class="block py-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors">The Showcase</a>
            <a href="prep.html" class="block py-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors">Prerequisites</a>
            <a href="guide.html" class="block py-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors">The Manual</a>
          </div>
        </div>

        <a href="guide.html" class="${isGuide ? active : inactive}"${isGuide ? ' aria-current="page"' : ''}>Guide</a>
        <a href="intel.html" class="${isIntel ? active : inactive}"${isIntel ? ' aria-current="page"' : ''}>Intel</a>
        <a href="hub.html" class="${isMonitor ? active : inactive}"${isMonitor ? ' aria-current="page"' : ''}>Hub</a>
      </div>
    </div>
  </nav>`;

  document.getElementById('nav-container').innerHTML = navHTML;

  // Mobile main menu toggle
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  btn.addEventListener('click', () => menu.classList.toggle('hidden'));

  // Mobile "Start Here" submenu toggle
  const startHereBtn = document.getElementById('start-here-btn');
  const startHereMenu = document.getElementById('start-here-menu');
  const startHereChevron = document.getElementById('start-here-chevron');
  startHereBtn.addEventListener('click', () => {
    const isOpen = !startHereMenu.classList.contains('hidden');
    startHereMenu.classList.toggle('hidden');
    startHereChevron.classList.toggle('rotate-180');
    startHereBtn.setAttribute('aria-expanded', String(!isOpen));
  });

  // Close mobile menu when any nav link is tapped
  menu.querySelectorAll('a').forEach(link =>
    link.addEventListener('click', () => menu.classList.add('hidden'))
  );
})();
