// ============================================================
// LexDesk — Toast de feedback visual
// Uso: Toast.show('Processo salvo!', 'success')
//      Toast.show('Erro ao salvar.', 'error')
//      Toast.show('Honorário atualizado.', 'info')
// ============================================================

const Toast = (() => {
  let container = null;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }
    return container;
  }

  function show(message, type = 'success', duration = 3000) {
    const c = getContainer();

    const colors = {
      success: { bg: '#e8f5ee', border: '#2d7a52', text: '#085041', icon: '✓' },
      error:   { bg: '#fdf0ef', border: '#c0392b', text: '#791f1f', icon: '✕' },
      info:    { bg: '#e8f0fb', border: '#2563a8', text: '#0c447c', icon: 'i' },
      warning: { bg: '#fdf6ec', border: '#c07a20', text: '#633806', icon: '!' },
    };

    const cfg = colors[type] || colors.success;

    const toast = document.createElement('div');
    toast.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      background: ${cfg.bg};
      border: 0.5px solid ${cfg.border};
      border-radius: 10px;
      padding: 12px 16px;
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 13px;
      color: ${cfg.text};
      font-weight: 500;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      pointer-events: all;
      min-width: 220px;
      max-width: 360px;
      transform: translateX(120%);
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s;
      opacity: 0;
    `;

    const icon = document.createElement('span');
    icon.style.cssText = `
      width: 20px; height: 20px;
      border-radius: 50%;
      background: ${cfg.border};
      color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700;
      flex-shrink: 0;
    `;
    icon.textContent = cfg.icon;

    const text = document.createElement('span');
    text.textContent = message;
    text.style.flex = '1';

    const close = document.createElement('button');
    close.textContent = '×';
    close.style.cssText = `
      background: none; border: none; cursor: pointer;
      color: ${cfg.text}; font-size: 16px; opacity: 0.6;
      padding: 0; line-height: 1; pointer-events: all;
      font-family: inherit;
    `;
    close.onclick = () => dismiss(toast);

    toast.appendChild(icon);
    toast.appendChild(text);
    toast.appendChild(close);
    c.appendChild(toast);

    // Animar entrada
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
      });
    });

    // Auto-dismiss
    const timer = setTimeout(() => dismiss(toast), duration);
    toast._timer = timer;

    return toast;
  }

  function dismiss(toast) {
    clearTimeout(toast._timer);
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }

  return { show, dismiss };
})();