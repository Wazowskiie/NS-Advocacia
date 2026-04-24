// ============================================================
// LexDesk — Notificações de prazos urgentes
// Lê os processos do localStorage ou usa dados mock
// ============================================================

const Notifications = (() => {
  // Processos urgentes — em produção viria do store/API
  const urgentes = [
    { id: 1, titulo: 'Prazo: Ação Trabalhista',    sub: 'Maria Fernanda Costa',  tempo: 'Hoje, 18h',  tipo: 'prazo'     },
    { id: 2, titulo: 'Audiência — TRT 2ª Região',  sub: 'Maria Fernanda Costa',  tempo: 'Hoje, 9h',   tipo: 'audiencia' },
    { id: 3, titulo: 'Honorário em atraso',         sub: 'Farmácia Bela Saúde',   tempo: 'Desde 05/03', tipo: 'financeiro'},
    { id: 4, titulo: 'Prazo: Rescisão Contratual', sub: 'Farmácia Bela Saúde',   tempo: 'Hoje, 12h',  tipo: 'prazo'     },
  ];

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

    // Badge
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

    // Painel dropdown
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
        <span style="font-size:11px;color:#c0392b;font-weight:500">${urgentes.length} urgentes</span>
      </div>
      <div style="max-height:360px;overflow-y:auto">
        ${urgentes.map(n => notifHTML(n)).join('')}
      </div>
      <div style="padding:10px 16px;border-top:0.5px solid rgba(0,0,0,0.08);text-align:center">
        <span style="font-size:11.5px;color:#3d7a52;cursor:pointer;font-weight:500">Ver todas as notificações</span>
      </div>
    `;

    document.body.appendChild(painel);

    btnSino.addEventListener('click', togglePainel);
    document.addEventListener('click', fecharFora);
  }

  function notifHTML(n) {
    const cfg = tipoConfig[n.tipo] || tipoConfig.prazo;
    return `
      <div style="display:flex;align-items:flex-start;gap:10px;padding:12px 16px;border-bottom:0.5px solid rgba(0,0,0,0.06);cursor:pointer;transition:background 0.1s" onmouseover="this.style.background='#f5f2ed'" onmouseout="this.style.background='transparent'">
        <div style="width:34px;height:34px;border-radius:8px;background:${cfg.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0">
          ${iconeSVG(n.tipo, cfg.cor)}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:12.5px;font-weight:500;color:#1c1c1a;line-height:1.3">${n.titulo}</div>
          <div style="font-size:11px;color:#9a9a94;margin-top:2px">${n.sub}</div>
          <div style="font-size:10.5px;color:${cfg.cor};font-weight:500;margin-top:3px">${n.tempo}</div>
        </div>
      </div>
    `;
  }

  function iconeSVG(tipo, cor) {
    const svgs = {
      prazo:      `<svg width="15" height="15" fill="none" stroke="${cor}" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      audiencia:  `<svg width="15" height="15" fill="none" stroke="${cor}" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      financeiro: `<svg width="15" height="15" fill="none" stroke="${cor}" stroke-width="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    };
    return svgs[tipo] || svgs.prazo;
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