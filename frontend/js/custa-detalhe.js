// ============================================================
// NS Advocacia — Custa Detalhe
// ============================================================
const params = new URLSearchParams(window.location.search);
const custaId = params.get('id');

const sMap = {
  'PENDENTE':    { cls: 'pill--waiting',  label: 'Pendente'    },
  'PAGO':        { cls: 'pill--progress', label: 'Pago'        },
  'CANCELADO':   { cls: 'pill--info',     label: 'Reembolsado' },
  'ATRASADO':    { cls: 'pill--urgent',   label: 'Em atraso'   },
  'Pendente':    { cls: 'pill--waiting',  label: 'Pendente'    },
  'Reembolsado': { cls: 'pill--info',     label: 'Reembolsado' },
  'Pago':        { cls: 'pill--progress', label: 'Pago'        },
};

let _custa = null;

async function init() {
  if (!custaId) {
    document.querySelector('.main').innerHTML = '<div style="padding:48px;text-align:center;color:#9a9a94">ID não informado.</div>';
    return;
  }
  try {
    _custa = await Api.get(`/custas/${custaId}`);
  } catch (err) {
    document.querySelector('.main').innerHTML = '<div style="padding:48px;text-align:center;color:#9a9a94">Custa não encontrada.</div>';
    return;
  }
  if (!_custa) {
    document.querySelector('.main').innerHTML = '<div style="padding:48px;text-align:center;color:#9a9a94">Custa não encontrada.</div>';
    return;
  }

  const c = _custa;
  const titulo = c.categoria || c.tipo || 'Custa';
  const clienteNome = c.cliente?.nome || c.processo?.cliente?.nome || '—';
  const data = c.dataVencimento ? new Date(c.dataVencimento.replace('Z', '')).toLocaleDateString('pt-BR') : '—';
  const s = sMap[c.status] || sMap['PENDENTE'];

  document.getElementById('breadcrumb-titulo').textContent = titulo;
  document.title = `NS Advocacia — ${titulo}`;
  document.getElementById('hero-titulo').textContent = titulo;
  document.getElementById('hero-sub').textContent = `${c.processo?.numero || '—'} · ${clienteNome}`;
  document.getElementById('hero-badges').innerHTML = `<span class="pill ${s.cls}">${s.label}</span>`;
  document.getElementById('hero-stats').innerHTML = `
    <div class="h-stat"><div class="h-stat__label">Valor</div><div class="h-stat__value h-stat__value--green">R$ ${Number(c.valor).toLocaleString('pt-BR')}</div></div>
    <div class="h-stat"><div class="h-stat__label">Data</div><div class="h-stat__value">${data}</div></div>
    <div class="h-stat"><div class="h-stat__label">Cliente</div><div class="h-stat__value">${clienteNome.split(' ').slice(0, 2).join(' ')}</div></div>
    <div class="h-stat"><div class="h-stat__label">Tipo</div><div class="h-stat__value">${titulo}</div></div>`;

  renderDados(c, clienteNome, data, s);
  renderHistorico(c, data);

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('pane-' + tab.dataset.pane).classList.add('active');
    });
  });

  // Botão reembolsar
  const btnReemb = document.getElementById('btn-reembolsar');
  const jaReemb = c.status === 'CANCELADO' || c.status === 'Reembolsado' || c.status === 'PAGO';
  if (jaReemb) {
    btnReemb.disabled = true;
    btnReemb.textContent = 'Já reembolsado';
    btnReemb.style.opacity = '0.5';
  } else {
    btnReemb.onclick = () => confirmarReembolso(c);
  }

  // Botão editar
  const btnEditar = document.getElementById('btn-editar');
  if (btnEditar) btnEditar.onclick = () => abrirModalEdicao(c);

  if (typeof Notifications !== 'undefined') Notifications.init('btn-notificacoes');
}

function confirmarReembolso(c) {
  const existing = document.getElementById('confirm-reemb-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'confirm-reemb-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;z-index:2000';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:28px 28px 20px;width:360px;max-width:90vw;box-shadow:0 8px 32px rgba(0,0,0,0.18)">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <div style="width:36px;height:36px;border-radius:50%;background:#e8f0fb;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg width="16" height="16" fill="none" stroke="#2563a8" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <div style="font-size:14px;font-weight:500;color:#1c1c1a">Marcar como reembolsado?</div>
          <div style="font-size:12px;color:#9a9a94;margin-top:2px">Confirma o reembolso de R$ ${Number(c.valor).toLocaleString('pt-BR')}?</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px">
        <button id="confirm-reemb-cancel" style="padding:8px 18px;border-radius:8px;border:0.5px solid rgba(0,0,0,0.14);background:transparent;color:#6b6b67;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif">Cancelar</button>
        <button id="confirm-reemb-ok" style="padding:8px 18px;border-radius:8px;border:none;background:#1a3a2a;color:#fff;font-size:13px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif">Confirmar</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  document.getElementById('confirm-reemb-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.getElementById('confirm-reemb-ok').addEventListener('click', async () => {
    overlay.remove();
    try {
      await Api.patch(`/custas/${custaId}`, { status: 'CANCELADO' });
      Toast.show('Custa marcada como reembolsada!', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      Toast.show('Erro ao atualizar status.', 'error');
    }
  });
}

function abrirModalEdicao(c) {
  const existing = document.getElementById('modal-edicao-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'modal-edicao-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;z-index:2000';

  const statusOpts = [
    { val: 'PENDENTE', label: 'Pendente' },
    { val: 'PAGO', label: 'Pago' },
    { val: 'CANCELADO', label: 'Reembolsado' },
    { val: 'ATRASADO', label: 'Em atraso' },
  ].map(o => `<option value="${o.val}" ${c.status === o.val ? 'selected' : ''}>${o.label}</option>`).join('');

  const vencValue = c.dataVencimento
    ? new Date(c.dataVencimento.replace('Z', '')).toISOString().split('T')[0]
    : '';

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:480px;max-width:90vw;box-shadow:0 8px 32px rgba(0,0,0,0.18)">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px 16px;border-bottom:0.5px solid rgba(0,0,0,0.08)">
        <h3 style="font-size:15px;font-weight:500;color:#1c1c1a">Editar Custa</h3>
        <button id="modal-edicao-close" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:6px;color:#6b6b67;cursor:pointer;background:none;border:none">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div style="padding:20px 24px;display:flex;flex-direction:column;gap:14px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div style="display:flex;flex-direction:column;gap:5px">
            <label style="font-size:11.5px;font-weight:500;color:#6b6b67">Valor (R$)</label>
            <input id="edit-valor" type="number" value="${c.valor}" min="0" step="0.01"
              style="padding:8px 12px;border:0.5px solid rgba(0,0,0,0.14);border-radius:8px;font-size:13px;color:#1c1c1a;font-family:'DM Sans',sans-serif" />
          </div>
          <div style="display:flex;flex-direction:column;gap:5px">
            <label style="font-size:11.5px;font-weight:500;color:#6b6b67">Status</label>
            <select id="edit-status"
              style="padding:8px 12px;border:0.5px solid rgba(0,0,0,0.14);border-radius:8px;font-size:13px;color:#1c1c1a;font-family:'DM Sans',sans-serif">
              ${statusOpts}
            </select>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:5px">
          <label style="font-size:11.5px;font-weight:500;color:#6b6b67">Data</label>
          <input id="edit-data" type="date" value="${vencValue}"
            style="padding:8px 12px;border:0.5px solid rgba(0,0,0,0.14);border-radius:8px;font-size:13px;color:#1c1c1a;font-family:'DM Sans',sans-serif" />
        </div>
      </div>
      <div style="display:flex;gap:10px;padding:16px 24px;border-top:0.5px solid rgba(0,0,0,0.08);justify-content:flex-end">
        <button id="modal-edicao-cancel" style="padding:8px 18px;border-radius:8px;border:0.5px solid rgba(0,0,0,0.14);background:transparent;color:#6b6b67;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif">Cancelar</button>
        <button id="modal-edicao-save" style="padding:8px 24px;border-radius:8px;border:none;background:#1a3a2a;color:#fff;font-size:13px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif">Salvar</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  const fechar = () => overlay.remove();
  document.getElementById('modal-edicao-close').addEventListener('click', fechar);
  document.getElementById('modal-edicao-cancel').addEventListener('click', fechar);
  overlay.addEventListener('click', e => { if (e.target === overlay) fechar(); });

  document.getElementById('modal-edicao-save').addEventListener('click', async () => {
    const valor  = parseFloat(document.getElementById('edit-valor').value);
    const status = document.getElementById('edit-status').value;
    const data   = document.getElementById('edit-data').value;

    if (isNaN(valor) || valor <= 0) {
      Toast.show('Informe um valor válido.', 'error');
      return;
    }

    const btn = document.getElementById('modal-edicao-save');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
      await Api.patch(`/custas/${custaId}`, {
        valor,
        status,
        dataVencimento: data || undefined,
      });
      Toast.show('Custa atualizada!', 'success');
      fechar();
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      Toast.show('Erro ao salvar alterações.', 'error');
      btn.disabled = false;
      btn.textContent = 'Salvar';
    }
  });
}

function renderDados(c, clienteNome, data, s) {
  const proc = c.processo;
  const cli  = c.cliente || proc?.cliente;
  document.getElementById('pane-dados').innerHTML = `<div class="data-grid">
    <div class="data-card"><h4>Dados da custa</h4>
      <div class="data-row"><span class="data-row__label">Tipo</span><span class="data-row__value">${c.categoria || '—'}</span></div>
      <div class="data-row"><span class="data-row__label">Valor</span><span class="data-row__value">R$ ${Number(c.valor).toLocaleString('pt-BR')}</span></div>
      <div class="data-row"><span class="data-row__label">Data</span><span class="data-row__value">${data}</span></div>
      <div class="data-row"><span class="data-row__label">Status</span><span class="pill ${s.cls}" style="font-size:11px">${s.label}</span></div>
      <div class="data-row"><span class="data-row__label">Descrição</span><span class="data-row__value">${c.descricao || '—'}</span></div>
    </div>
    <div class="data-card"><h4>Cliente</h4>
      ${cli ? `
        <div class="data-row"><span class="data-row__label">Nome</span><span class="data-row__value">${cli.nome}</span></div>
        <div class="data-row"><span class="data-row__label">Telefone</span><span class="data-row__value">${cli.telefone || '—'}</span></div>
        <div class="data-row"><span class="data-row__label">E-mail</span><span class="data-row__value">${cli.email || '—'}</span></div>
        <div style="margin-top:12px"><a href="cliente-detalhe.html?id=${cli.id}" style="font-size:12.5px;color:var(--ga);cursor:pointer">Ver perfil completo →</a></div>`
      : '<p style="font-size:12.5px;color:var(--t3);padding:8px 0">Cliente não encontrado.</p>'}
    </div></div>
    ${proc ? `<div style="margin-top:14px"><div class="data-card"><h4>Processo vinculado</h4>
      <div class="data-row"><span class="data-row__label">Título</span><span class="data-row__value">${proc.titulo}</span></div>
      <div class="data-row"><span class="data-row__label">Número</span><span class="data-row__value">${proc.numero || '—'}</span></div>
      <div class="data-row"><span class="data-row__label">Vara</span><span class="data-row__value">${proc.vara || proc.tribunal || '—'}</span></div>
      <div style="margin-top:12px"><a href="processo-detalhe.html?id=${proc.id}" style="font-size:12.5px;color:var(--ga);cursor:pointer">Ver processo completo →</a></div>
    </div></div>` : ''}`;
}

function renderHistorico(c, data) {
  const historico = [
    { evento: 'Custa registrada', data, obs: `Valor: R$ ${Number(c.valor).toLocaleString('pt-BR')} — Tipo: ${c.categoria || '—'}` },
    ...(c.status === 'PAGO' || c.status === 'Pago' ? [{ evento: 'Pagamento registrado', data: 'Registrado', obs: `R$ ${Number(c.valor).toLocaleString('pt-BR')} confirmado` }] : []),
    ...(c.status === 'CANCELADO' || c.status === 'Reembolsado' ? [{ evento: 'Reembolso realizado', data: 'Registrado', obs: 'Valor reembolsado ao escritório.' }] : []),
    ...(c.status === 'ATRASADO' ? [{ evento: 'Vencimento em atraso', data, obs: 'Pagamento não identificado até a data.' }] : []),
  ];
  document.getElementById('pane-historico').innerHTML = `<div class="timeline">
    ${historico.map((item, i) => `<div class="tl-item"><div class="tl-spine">
      <div class="tl-dot" style="background:${i === 0 ? '#3d7a52' : i === historico.length - 1 && c.status === 'ATRASADO' ? '#c0392b' : '#2563a8'}"></div>
      <div class="tl-line"></div></div>
      <div class="tl-body"><div class="tl-title">${item.evento}</div><div class="tl-desc">${item.obs}</div>
      <div class="tl-meta"><span class="tl-date">${item.data}</span></div></div></div>`).join('')}
  </div>`;
}

document.addEventListener('DOMContentLoaded', init);