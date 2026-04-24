// ============================================================
// NS Advocacia — Modal de confirmação reutilizável
// Uso: Confirm.show('Tem certeza?', 'Descrição', () => acao())
// ============================================================

const Confirm = (() => {
  function show(titulo, descricao, onConfirm, tipo = 'danger') {
    // Remove modal anterior se existir
    const anterior = document.getElementById('confirm-overlay');
    if (anterior) anterior.remove();

    const cores = {
      danger:  { btn: '#c0392b', hover: '#991f1a', label: 'Excluir' },
      warning: { btn: '#c07a20', hover: '#9a5c10', label: 'Confirmar' },
    };
    const cfg = cores[tipo] || cores.danger;

    const overlay = document.createElement('div');
    overlay.id = 'confirm-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.35);
      display: flex; align-items: center; justify-content: center;
      z-index: 2000;
      font-family: 'DM Sans', system-ui, sans-serif;
    `;

    overlay.innerHTML = `
      <div style="
        background: #fff;
        border-radius: 16px;
        width: 400px; max-width: 90vw;
        padding: 28px 28px 24px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        animation: confirmIn 0.18s ease;
      ">
        <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:20px">
          <div style="width:38px;height:38px;border-radius:10px;background:#fdf0ef;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <svg width="18" height="18" fill="none" stroke="#c0392b" stroke-width="2" viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <div style="font-size:15px;font-weight:500;color:#1c1c1a;margin-bottom:5px">${titulo}</div>
            <div style="font-size:13px;color:#6b6b67;line-height:1.5">${descricao}</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button id="confirm-cancel" style="
            padding:9px 20px;border-radius:8px;
            border:0.5px solid rgba(0,0,0,0.14);
            background:transparent;color:#6b6b67;
            font-size:13px;font-weight:500;cursor:pointer;
            font-family:'DM Sans',system-ui,sans-serif;
            transition:background 0.12s;
          ">Cancelar</button>
          <button id="confirm-ok" style="
            padding:9px 20px;border-radius:8px;
            border:none;background:${cfg.btn};color:#fff;
            font-size:13px;font-weight:500;cursor:pointer;
            font-family:'DM Sans',system-ui,sans-serif;
            transition:background 0.12s;
          ">${cfg.label}</button>
        </div>
      </div>
      <style>
        @keyframes confirmIn {
          from { transform: scale(0.95) translateY(8px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }
      </style>
    `;

    document.body.appendChild(overlay);

    document.getElementById('confirm-cancel').onclick = () => overlay.remove();
    document.getElementById('confirm-ok').onclick = () => {
      overlay.remove();
      onConfirm();
    };
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.remove();
    });
  }

  return { show };
})();