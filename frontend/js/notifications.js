// ============================================================
// NS Advocacia — Notificações de prazos urgentes
// ============================================================

const Notifications = (() => {
  const urgentes = [];

  const tipoConfig = {
    prazo:      { cor: '#c0392b', bg: '#fdf0ef' },
    audiencia:  { cor: '#2563a8', bg: '#e8f0fb' },
    financeiro: { cor: '#c07a20', bg: '#fdf6ec' },
  };

  let painelAberto = false;
  let btnSino, badge, painel;

  function init(sinoId) {
    btnSino = document.getElementById(sinoId);
    if (!btnSino) return;

    if (urgentes.length > 0) {
      badge = document.createElement('span');
      badge.style.cssText = `
        position: absolute; top: -4px; right: -4px;
        width: 16px; height: 16px;
        background: #c0392b; color: #fff;
        border-radius: 50%; font-size: 9px; font-weight: 700;
        display: flex; align-items: center; justify-content: center;
        font-family: 'DM Sans', system-ui, sans-serif;
        pointer-events: none;
      `;
      badge.textContent = urgentes.length;
      btnSino.style.position = 'relative';
      btnSino.appendChild(badge);
    }

    painel = document.createElement('div');
    painel.style.cssText = `
      position: fixed;
      top: 64px; right: 20px;
      width: 320px;
      background: #fff;
      border: 0.5px solid rgba(0,0,0,0.1);
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      z-index: 999;
      display: none;
      overflow: hidden;
      font-family: 'DM Sans', system-ui, sans-serif;
    `;

    painel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:0.5px solid rgba(0,0,0,0.08)">
        <span style="font-size:13px;font-weight:500;color:#1c1c1a">Notificações</span>
        <span style="font-size:11px;color:#aaa;font-weight:500">Nenhuma notificação</span>
      </div>
      <div style="padding:24px 16px;text-align:center;color:#aaa;font-size:12.5px;">
        Nenhuma notificação no momento.
      </div>
    `;

    document.body.appendChild(painel);
    btnSino.addEventListener('click', togglePainel);
    document.addEventListener('click', fecharFora);
  }

  function togglePainel(e) {
    e.stopPropagation();
    painelAberto = !painelAberto;
    painel.style.display = painelAberto ? 'block' : 'none';
  }

  function fecharFora(e) {
    if (painelAberto && !painel.contains(e.target) && e.target !== btnSino) {
      painelAberto = false;
      painel.style.display = 'none';
    }
  }

  return { init };
})();
