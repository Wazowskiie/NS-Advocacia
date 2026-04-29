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
    return `<div class="table-row" data-id="${h.id}">
      <div><div class="t-proc">${h.processo}</div><div class="t-sub">${h.num}</div></div>
      <div class="t-cell">${h.cliente.split(' ').slice(0,2).join(' ')}</div>
      <div><span class="tipo-tag">${h.tipo}</span></div>
      <div class="t-val">${formatMoeda(h.valor)}</div>
      <div class="t-cell">${h.venc}</div>
      <div><span class="pill ${s.cls}">${s.label}</span></div>
      <div style="display:flex;gap:6px;align-items:center">
        <button class="btn-det" onclick="window.location.href='honorario-detalhes.html?id=${h.id}'">Detalhes</button>
        ${podePagar ? `<button class="btn-pagar" data-id="${h.id}" style="font-size:11px;padding:4px 10px;border-radius:6px;border:0.5px solid #2d7a52;background:#e8f5ee;color:#085041;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap">✓ Pago</button>` : ''}
      </div>
    </div>`;
  }).join('');

  tbody.querySelectorAll('.btn-pagar').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const id = btn.dataset.id;
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
  });

  count.textContent = `${lista.length} lançamento${lista.length !== 1 ? 's' : ''}`;
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