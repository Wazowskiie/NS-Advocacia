// ============================================================
// NS Advocacia — Honorários
// Integrado com backend via API
// ============================================================

const honorariosStatusMap = {
  'PENDENTE':  { cls: 'pill--waiting',  label: 'Pendente'  },
  'PAGO':      { cls: 'pill--progress', label: 'Pago'      },
  'ATRASADO':  { cls: 'pill--urgent',   label: 'Em atraso' },
  'CANCELADO': { cls: 'pill--waiting',  label: 'Cancelado' },
  // Compatibilidade
  'Pago':      { cls: 'pill--progress', label: 'Pago'      },
  'Pendente':  { cls: 'pill--waiting',  label: 'Pendente'  },
  'Em atraso': { cls: 'pill--urgent',   label: 'Em atraso' },
  'Parcelado': { cls: 'pill--info',     label: 'Parcelado' },
};

const _cores = ['#2d5a3d','#3d5a7a','#7a6a3d','#5a3d6a','#3d6a5a','#6a3d3d'];

function formatMoeda(v) {
  return `R$ ${(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

let honorariosData = [];

async function carregarHonorarios() {
  try {
    const dados = await Api.get('/financeiro?tipo=RECEITA');
    honorariosData = (dados || []).map((h, i) => ({
      id:       h.id,
      processo: h.processo?.titulo || '—',
      num:      h.processo?.numero || '—',
      cliente:  h.cliente?.nome || h.processo?.cliente?.nome || '—',
      cor:      _cores[i % _cores.length],
      tipo:     h.categoria || h.tipo || 'Fixo',
      valor:    Number(h.valor) || 0,
      venc:     h.dataVencimento ? new Date(h.dataVencimento).toLocaleDateString('pt-BR') : '—',
      status:   h.status || 'PENDENTE',
    }));
  } catch (err) {
    console.error('Erro ao carregar honorários:', err);
    honorariosData = [];
  }
}

function renderCards(lista) {
  const recebido  = lista.filter(h => h.status === 'PAGO' || h.status === 'Pago').reduce((s, h) => s + h.valor, 0);
  const pendente  = lista.filter(h => h.status === 'PENDENTE' || h.status === 'Pendente').reduce((s, h) => s + h.valor, 0);
  const atraso    = lista.filter(h => h.status === 'ATRASADO' || h.status === 'Em atraso').reduce((s, h) => s + h.valor, 0);
  const parcelado = lista.filter(h => h.status === 'Parcelado').reduce((s, h) => s + h.valor, 0);
  const nPendente  = lista.filter(h => h.status === 'PENDENTE' || h.status === 'Pendente').length;
  const nAtraso    = lista.filter(h => h.status === 'ATRASADO' || h.status === 'Em atraso').length;
  const nParcelado = lista.filter(h => h.status === 'Parcelado').length;

  document.getElementById('summary-cards').innerHTML = `
    <div class="s-card s-card--primary">
      <div class="s-icon"><svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
      <div class="s-num">${formatMoeda(recebido)}</div><div class="s-lbl">Total recebido</div>
    </div>
    <div class="s-card">
      <div class="s-icon"><svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
      <span class="s-badge s-badge--pendente">${nPendente} cobranças</span>
      <div class="s-num">${formatMoeda(pendente)}</div><div class="s-lbl">Pendente</div>
    </div>
    <div class="s-card">
      <div class="s-icon"><svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg></div>
      <span class="s-badge s-badge--atraso">${nAtraso} em atraso</span>
      <div class="s-num">${formatMoeda(atraso)}</div><div class="s-lbl">Em atraso</div>
    </div>
    <div class="s-card">
      <div class="s-icon"><svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/></svg></div>
      <span class="s-badge s-badge--parcelado">${nParcelado} parcelados</span>
      <div class="s-num">${formatMoeda(parcelado)}</div><div class="s-lbl">Parcelado</div>
    </div>`;
}

function renderGrafico(lista) {
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const recebido = new Array(12).fill(0);
  const pendente = new Array(12).fill(0);
  lista.forEach(h => {
    if (!h.venc || h.venc === '—') return;
    const partes = h.venc.split('/');
    if (partes.length < 2) return;
    const mes = parseInt(partes[1]) - 1;
    if (mes < 0 || mes > 11) return;
    if (h.status === 'PAGO' || h.status === 'Pago') recebido[mes] += h.valor;
    else pendente[mes] += h.valor;
  });
  const maxVal = Math.max(...meses.map((_, i) => recebido[i] + pendente[i]), 1);
  const CHART_H = 120;
  document.getElementById('chart-area').innerHTML = meses.map((m, i) => {
    const rH = Math.round((recebido[i] / maxVal) * CHART_H);
    const pH = Math.round((pendente[i] / maxVal) * CHART_H);
    return `<div class="bar-group">
      <div class="bar-wrap">
        <div class="bar bar--recebido" style="height:${rH}px" title="Recebido: ${formatMoeda(recebido[i])}"></div>
        <div class="bar bar--pendente" style="height:${pH}px" title="Pendente: ${formatMoeda(pendente[i])}"></div>
      </div>
      <div class="bar-lbl">${m}</div>
    </div>`;
  }).join('');
}

function renderClientes(lista) {
  const porCliente = {};
  lista.forEach(h => {
    if (!porCliente[h.cliente]) porCliente[h.cliente] = { cor: h.cor, valor: 0, status: h.status };
    porCliente[h.cliente].valor += h.valor;
    const prioridade = { 'ATRASADO': 3, 'Em atraso': 3, 'PENDENTE': 2, 'Pendente': 2, 'Parcelado': 1, 'PAGO': 0, 'Pago': 0 };
    if ((prioridade[h.status] || 0) > (prioridade[porCliente[h.cliente].status] || 0)) {
      porCliente[h.cliente].status = h.status;
    }
  });
  document.getElementById('clients-list').innerHTML = Object.entries(porCliente).map(([nome, info]) => {
    const iniciais = nome.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();
    const s = honorariosStatusMap[info.status] || honorariosStatusMap['Pendente'];
    return `<div class="client-row">
      <div class="cl-av" style="background:${info.cor}">${iniciais}</div>
      <div class="cl-info"><div class="cl-name">${nome}</div><div class="cl-val">${formatMoeda(info.valor)}</div></div>
      <span class="pill ${s.cls}">${s.label}</span>
    </div>`;
  }).join('') || '<p style="padding:16px;color:#aaa;font-size:13px">Nenhum dado disponível.</p>';
}

function renderTabela(lista) {
  const tbody = document.getElementById('table-body');
  const count = document.getElementById('table-count');
  if (!lista.length) {
    tbody.innerHTML = '<div class="empty-state">Nenhum lançamento encontrado.</div>';
    count.textContent = '';
    return;
  }
  tbody.innerHTML = lista.map(h => {
    const s = honorariosStatusMap[h.status] || honorariosStatusMap['Pendente'];
    const podePagar = h.status !== 'PAGO' && h.status !== 'Pago';
    return `<div class="table-row">
      <div><div class="t-proc">${h.processo}</div><div class="t-sub">${h.num}</div></div>
      <div class="t-cell">${h.cliente.split(' ').slice(0,2).join(' ')}</div>
      <div><span class="tipo-tag">${h.tipo}</span></div>
      <div class="t-val">${formatMoeda(h.valor)}</div>
      <div class="t-cell">${h.venc}</div>
      <div><span class="pill ${s.cls}">${s.label}</span></div>
      <div style="display:flex;gap:6px;align-items:center">
        <button class="btn-det btn-editar" data-id="${h.id}">Editar</button>
        ${podePagar ? `<button class="btn-pagar" data-id="${h.id}" data-valor="${h.valor}" style="font-size:11px;padding:4px 10px;border-radius:6px;border:0.5px solid #2d7a52;background:#e8f5ee;color:#085041;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap">✓ Pago</button>` : ''}
      </div>
    </div>`;
  }).join('');

  // FIX: lê o id pelo dataset do botão, não do data-id da row
  tbody.querySelectorAll('.btn-pagar').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id    = btn.dataset.id;
      const valor = Number(btn.dataset.valor);
      confirmarPagamento(id, valor);
    });
  });

  tbody.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const item = honorariosData.find(h => h.id === id);
      if (item) abrirModalEdicao(item);
    });
  });

  count.textContent = `${lista.length} lançamento${lista.length !== 1 ? 's' : ''}`;
}

// ---------- CONFIRMAÇÃO DE PAGAMENTO ----------
function confirmarPagamento(id, valor) {
  // Cria overlay de confirmação próprio
  const existing = document.getElementById('confirm-pagar-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'confirm-pagar-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;z-index:2000';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:28px 28px 20px;width:360px;max-width:90vw;box-shadow:0 8px 32px rgba(0,0,0,0.18)">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <div style="width:36px;height:36px;border-radius:50%;background:#e8f5ee;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg width="16" height="16" fill="none" stroke="#2d7a52" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <div style="font-size:14px;font-weight:500;color:#1c1c1a">Marcar como pago?</div>
          <div style="font-size:12px;color:#9a9a94;margin-top:2px">Confirma o recebimento de ${formatMoeda(valor)}?</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px">
        <button id="confirm-pagar-cancel" style="padding:8px 18px;border-radius:8px;border:0.5px solid rgba(0,0,0,0.14);background:transparent;color:#6b6b67;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif">Cancelar</button>
        <button id="confirm-pagar-ok" style="padding:8px 18px;border-radius:8px;border:none;background:#1a3a2a;color:#fff;font-size:13px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif">Confirmar</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  document.getElementById('confirm-pagar-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  document.getElementById('confirm-pagar-ok').addEventListener('click', async () => {
    overlay.remove();
    try {
      await Api.patch(`/financeiro/${id}`, { status: 'PAGO' });
      const item = honorariosData.find(h => h.id === id);
      if (item) item.status = 'PAGO';
      Toast.show('Honorário marcado como pago!', 'success');
      aplicarFiltros();
    } catch (err) {
      Toast.show('Erro ao atualizar status.', 'error');
    }
  });
}

// ---------- MODAL EDIÇÃO ----------
function abrirModalEdicao(item) {
  const existing = document.getElementById('modal-edicao-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'modal-edicao-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;z-index:2000';

  const statusOpts = ['PENDENTE','PAGO','ATRASADO','Parcelado'].map(s =>
    `<option value="${s}" ${item.status === s ? 'selected' : ''}>${honorariosStatusMap[s]?.label || s}</option>`
  ).join('');

  const tipoOpts = ['Fixo','% causa','Por hora','RECEITA'].map(t =>
    `<option value="${t}" ${item.tipo === t ? 'selected' : ''}>${t}</option>`
  ).join('');

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:480px;max-width:90vw;box-shadow:0 8px 32px rgba(0,0,0,0.18)">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px 16px;border-bottom:0.5px solid rgba(0,0,0,0.08)">
        <h3 style="font-size:15px;font-weight:500;color:#1c1c1a">Editar Lançamento</h3>
        <button id="modal-edicao-close" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:6px;color:#6b6b67;cursor:pointer;background:none;border:none">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div style="padding:20px 24px;display:flex;flex-direction:column;gap:14px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div style="display:flex;flex-direction:column;gap:5px">
            <label style="font-size:11.5px;font-weight:500;color:#6b6b67">Valor (R$)</label>
            <input id="edit-valor" type="number" value="${item.valor}" min="0" step="0.01"
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
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div style="display:flex;flex-direction:column;gap:5px">
            <label style="font-size:11.5px;font-weight:500;color:#6b6b67">Tipo</label>
            <select id="edit-tipo"
              style="padding:8px 12px;border:0.5px solid rgba(0,0,0,0.14);border-radius:8px;font-size:13px;color:#1c1c1a;font-family:'DM Sans',sans-serif">
              ${tipoOpts}
            </select>
          </div>
          <div style="display:flex;flex-direction:column;gap:5px">
            <label style="font-size:11.5px;font-weight:500;color:#6b6b67">Vencimento</label>
            <input id="edit-venc" type="date"
              value="${item.venc !== '—' ? item.venc.split('/').reverse().join('-') : ''}"
              style="padding:8px 12px;border:0.5px solid rgba(0,0,0,0.14);border-radius:8px;font-size:13px;color:#1c1c1a;font-family:'DM Sans',sans-serif" />
          </div>
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
    const tipo   = document.getElementById('edit-tipo').value;
    const venc   = document.getElementById('edit-venc').value;

    if (isNaN(valor) || valor <= 0) {
      Toast.show('Informe um valor válido.', 'error');
      return;
    }

    const btn = document.getElementById('modal-edicao-save');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
      await Api.patch(`/financeiro/${item.id}`, {
        valor,
        status,
        categoria: tipo,
        dataVencimento: venc || undefined,
      });

      // Atualiza localmente
      const local = honorariosData.find(h => h.id === item.id);
      if (local) {
        local.valor  = valor;
        local.status = status;
        local.tipo   = tipo;
        local.venc   = venc ? new Date(venc + 'T12:00:00').toLocaleDateString('pt-BR') : '—';
      }

      Toast.show('Lançamento atualizado!', 'success');
      fechar();
      aplicarFiltros();
    } catch (err) {
      Toast.show('Erro ao salvar alterações.', 'error');
      btn.disabled = false;
      btn.textContent = 'Salvar';
    }
  });
}

function aplicarFiltros() {
  const status = document.getElementById('f-status').value;
  const lista = honorariosData.filter(h => !status || h.status === status);
  renderCards(lista);
  renderClientes(lista);
  renderGrafico(lista);
  renderTabela(lista);
}

const overlay   = document.getElementById('modal-overlay');
const btnNovo   = document.getElementById('btn-novo');
const btnClose  = document.getElementById('modal-close');
const btnCancel = document.getElementById('modal-cancel');
const btnSave   = document.getElementById('modal-save');

function abrirModal()  { overlay.classList.add('active'); document.getElementById('f-processo').focus(); }
function fecharModal() { overlay.classList.remove('active'); limparModal(); }

function limparModal() {
  ['f-processo','f-num','f-cliente','f-valor','f-venc'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('f-tipo').value         = 'Fixo';
  document.getElementById('f-status-modal').value = 'PENDENTE';
}

async function salvarLancamento() {
  const processo = document.getElementById('f-processo').value.trim();
  const cliente  = document.getElementById('f-cliente').value.trim();
  const valor    = parseFloat(document.getElementById('f-valor').value);
  const resp     = document.getElementById('f-resp-modal')?.value;

  if (!processo || !cliente || isNaN(valor) || valor <= 0) {
    Toast.show('Preencha processo, cliente e valor.', 'error');
    return;
  }
  btnSave.disabled = true;
  btnSave.textContent = 'Salvando...';
  try {
    await Api.post('/financeiro', {
      tipo:           'RECEITA',
      categoria:      document.getElementById('f-tipo').value,
      descricao:      `${processo} — ${cliente}`,
      valor,
      status:         document.getElementById('f-status-modal').value,
      dataVencimento: document.getElementById('f-venc').value || undefined,
      processoTitulo: processo,
      clienteNome:    cliente,
    });
    Toast.show('Lançamento salvo com sucesso!', 'success');
    fecharModal();
    await carregarHonorarios();
    aplicarFiltros();
  } catch (err) {
    Toast.show(err.message || 'Erro ao salvar lançamento.', 'error');
  } finally {
    btnSave.disabled = false;
    btnSave.textContent = 'Salvar';
  }
}

btnNovo.addEventListener('click', abrirModal);
btnClose.addEventListener('click', fecharModal);
btnCancel.addEventListener('click', fecharModal);
btnSave.addEventListener('click', salvarLancamento);
overlay.addEventListener('click', e => { if (e.target === overlay) fecharModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharModal(); });
document.getElementById('f-status').addEventListener('change', aplicarFiltros);
document.getElementById('f-ano').addEventListener('change', () => {
  document.getElementById('ano-label').textContent = `Ano de ${document.getElementById('f-ano').value}`;
  aplicarFiltros();
});

document.addEventListener('DOMContentLoaded', async () => {
  Auth.exigirLogin();

  const usuario = Auth.getUsuario();
  if (usuario) {
    const elNome  = document.getElementById('sidebar-nome');
    const elCargo = document.getElementById('sidebar-cargo');
    const elAv    = document.getElementById('sidebar-avatar');
    if (elNome)  elNome.textContent  = usuario.nome;
    if (elCargo) elCargo.textContent = usuario.cargo;
    if (elAv)    elAv.textContent    = usuario.nome.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

    const selectResp = document.getElementById('f-resp-modal');
    if (selectResp) {
      selectResp.innerHTML = `<option value="${usuario.id}">${usuario.nome}</option>`;
    }
  }

  await carregarHonorarios();
  aplicarFiltros();
  if (typeof Notifications !== 'undefined') Notifications.init('btn-notificacoes');
});