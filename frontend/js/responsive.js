// ============================================================
// NS Advocacia — Responsivo
// Injeta barra inferior mobile e botão hamburguer no tablet
// ============================================================

const ResponsiveNav = (() => {

  const PAGES = {
    'index.html':              'dashboard',
    '':                        'dashboard',
    'processos.html':          'processos',
    'clientes.html':           'clientes',
    'agenda.html':             'agenda',
    'honorarios.html':         'honorarios',
    'custas.html':             'custas',
    'processo-detalhe.html':   'processos',
    'cliente-detalhe.html':    'clientes',
    'honorario-detalhe.html':  'honorarios',
  };

  const NAV_ITEMS = [
    {
      id: 'dashboard',
      label: 'Início',
      href: (isRoot) => isRoot ? 'index.html' : '../index.html',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
    },
    {
      id: 'processos',
      label: 'Processos',
      href: (isRoot) => isRoot ? 'pages/processos.html' : 'processos.html',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    },
    {
      id: 'clientes',
      label: 'Clientes',
      href: (isRoot) => isRoot ? 'pages/clientes.html' : 'clientes.html',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
    },
    {
      id: 'agenda',
      label: 'Agenda',
      href: (isRoot) => isRoot ? 'pages/agenda.html' : 'agenda.html',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    },
    {
      id: 'mais',
      label: 'Mais',
      href: null,
      icon: `<svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`,
    },
  ];

  const MAIS_ITEMS = [
    { id: 'honorarios', label: 'Honorários', href: (isRoot) => isRoot ? 'pages/honorarios.html' : 'honorarios.html' },
    { id: 'custas',     label: 'Custas',     href: (isRoot) => isRoot ? 'pages/custas.html'     : 'custas.html'     },
  ];

  function getPageId() {
    const path = window.location.pathname;
    const file = path.split('/').pop() || '';
    return PAGES[file] || 'dashboard';
  }

  function isRootPage() {
    const path = window.location.pathname;
    const file = path.split('/').pop() || '';
    return file === 'index.html' || file === '';
  }

  function init() {
    const isRoot   = isRootPage();
    const pageId   = getPageId();

    injectBottomNav(isRoot, pageId);
    injectHamburger(isRoot, pageId);
    injectSidebarOverlay();
  }

  // ---------- BARRA INFERIOR ----------
  function injectBottomNav(isRoot, pageId) {
    const nav = document.createElement('nav');
    nav.className = 'bottom-nav';
    nav.setAttribute('aria-label', 'Navegação principal');

    const items = document.createElement('div');
    items.className = 'bottom-nav__items';

    NAV_ITEMS.forEach(item => {
      const btn = document.createElement('a');
      btn.className = 'bottom-nav__item' + (item.id === pageId || (item.id === 'mais' && ['honorarios','custas'].includes(pageId)) ? ' active' : '');
      btn.href = item.href ? item.href(isRoot) : '#';
      btn.innerHTML = item.icon + `<span>${item.label}</span>`;

      if (item.id === 'mais') {
        btn.addEventListener('click', e => {
          e.preventDefault();
          toggleMaisMenu(isRoot, btn);
        });
      }

      items.appendChild(btn);
    });

    nav.appendChild(items);
    document.body.appendChild(nav);
  }

  // ---------- MENU "MAIS" ----------
  let maisMenu = null;

  function toggleMaisMenu(isRoot, anchor) {
    if (maisMenu) {
      maisMenu.remove();
      maisMenu = null;
      return;
    }

    maisMenu = document.createElement('div');
    maisMenu.style.cssText = `
      position: fixed;
      bottom: 68px;
      right: 12px;
      background: #fff;
      border: 0.5px solid rgba(0,0,0,0.1);
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      z-index: 600;
      overflow: hidden;
      font-family: 'DM Sans', system-ui, sans-serif;
      min-width: 160px;
      animation: maisIn 0.18s ease;
    `;

    const style = document.createElement('style');
    style.textContent = `@keyframes maisIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`;
    maisMenu.appendChild(style);

    MAIS_ITEMS.forEach(item => {
      const link = document.createElement('a');
      link.href = item.href(isRoot);
      link.style.cssText = `
        display: flex; align-items: center; gap: 10px;
        padding: 13px 16px;
        font-size: 14px; color: #1c1c1a;
        border-bottom: 0.5px solid rgba(0,0,0,0.06);
        text-decoration: none; transition: background 0.1s;
      `;
      link.textContent = item.label;
      link.onmouseover = () => link.style.background = '#f5f2ed';
      link.onmouseout  = () => link.style.background = 'transparent';
      maisMenu.appendChild(link);
    });

    document.body.appendChild(maisMenu);

    setTimeout(() => {
      document.addEventListener('click', fecharMais);
    }, 10);
  }

  function fecharMais(e) {
    if (maisMenu && !maisMenu.contains(e.target)) {
      maisMenu.remove();
      maisMenu = null;
      document.removeEventListener('click', fecharMais);
    }
  }

  // ---------- HAMBURGUER (TABLET) ----------
  function injectHamburger(isRoot, pageId) {
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;

    const hamBtn = document.createElement('button');
    hamBtn.className = 'ham-btn';
    hamBtn.setAttribute('aria-label', 'Abrir menu');
    hamBtn.innerHTML = `
      <span class="ham-line"></span>
      <span class="ham-line"></span>
      <span class="ham-line"></span>
    `;

    hamBtn.addEventListener('click', () => toggleSidebar());
    topbar.insertBefore(hamBtn, topbar.firstChild);
  }

  // ---------- SIDEBAR OVERLAY ----------
  function injectSidebarOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebar-overlay';
    overlay.addEventListener('click', () => closeSidebar());
    document.body.appendChild(overlay);
  }

  function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar) return;

    const isOpen = sidebar.classList.contains('open');
    if (isOpen) {
      closeSidebar();
    } else {
      sidebar.classList.add('open');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar) return;
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Fecha sidebar ao pressionar Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSidebar();
  });

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => ResponsiveNav.init());