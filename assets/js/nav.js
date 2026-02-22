(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const isHome = page === '' || page === 'index.html';
  const isGuide = page === 'guide.html';
  const isIntel = page === 'intel.html';
  const isMonitor = page === 'hub.html';
  const isAbout = page === 'about.html';
  const isLegal = page === 'legal.html';

  const homeHref = isHome ? '#hero' : 'index.html';
  const communityHref = isHome ? '#community' : 'index.html#community';
  const ctaText = isGuide ? 'Start Reading' : 'Get Started';
  const ctaHref = isGuide ? '#prerequisites' : 'guide.html';

  const linkClass = 'text-sm transition-colors';
  const active = linkClass + ' text-white';
  const inactive = linkClass + ' text-gray-400 hover:text-white';

  const navHTML = `
  <nav class="fixed top-0 inset-x-0 z-50 bg-slate-900/90 border-b border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
      <a href="${homeHref}" class="font-mono font-bold text-xl tracking-tight text-white glitch-hover">
        Switch<span class="text-cyan-400">Hack</span>
      </a>
      <div class="hidden md:flex items-center gap-8">
        <a href="${homeHref}" class="${isHome ? active : inactive}"${isHome ? ' aria-current="page"' : ''}>Home</a>
        <a href="guide.html" class="${isGuide ? active : inactive}"${isGuide ? ' aria-current="page"' : ''}>Guide</a>
        <a href="${communityHref}" class="${inactive}">Community</a>
        <a href="intel.html" class="${isIntel ? active : inactive}"${isIntel ? ' aria-current="page"' : ''}>Intel</a>
        <a href="hub.html" class="${isMonitor ? active : inactive}"${isMonitor ? ' aria-current="page"' : ''}>Hub</a>
        <a href="about.html" class="${isAbout ? active : inactive}"${isAbout ? ' aria-current="page"' : ''}>About</a>
        <a href="legal.html" class="${isLegal ? active : inactive}"${isLegal ? ' aria-current="page"' : ''}>Legal</a>
      </div>
      <button id="mobile-menu-btn" class="md:hidden p-2 -mr-2 text-gray-400 hover:text-white" aria-label="Menu">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
    </div>
    <div id="mobile-menu" class="hidden md:hidden border-t border-white/10 bg-slate-900/95">
      <div class="px-6 py-4 flex flex-col gap-4">
        <a href="${homeHref}" class="${isHome ? active : inactive}"${isHome ? ' aria-current="page"' : ''}>Home</a>
        <a href="guide.html" class="${isGuide ? active : inactive}"${isGuide ? ' aria-current="page"' : ''}>Guide</a>
        <a href="${communityHref}" class="${inactive}">Community</a>
        <a href="intel.html" class="${isIntel ? active : inactive}"${isIntel ? ' aria-current="page"' : ''}>Intel</a>
        <a href="hub.html" class="${isMonitor ? active : inactive}"${isMonitor ? ' aria-current="page"' : ''}>Hub</a>
        <a href="about.html" class="${isAbout ? active : inactive}"${isAbout ? ' aria-current="page"' : ''}>About</a>
        <a href="legal.html" class="${isLegal ? active : inactive}"${isLegal ? ' aria-current="page"' : ''}>Legal</a>
      </div>
    </div>
  </nav>`;

  document.getElementById('nav-container').innerHTML = navHTML;

  // Mobile menu toggle
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  btn.addEventListener('click', () => menu.classList.toggle('hidden'));
  menu.querySelectorAll('a').forEach(link =>
    link.addEventListener('click', () => menu.classList.add('hidden'))
  );
})();
