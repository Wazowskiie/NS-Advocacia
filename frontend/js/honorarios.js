// ---------- SUMMARY CARDS ----------
function renderCards(lista) {
  const recebido  = lista.filter(h => h.status === 'Pago').reduce((s, h) => s + h.valor, 0);
  const pendente  = lista.filter(h => h.status === 'Pendente').reduce((s, h) => s + h.valor, 0);
  const atraso    = lista.filter(h => h.status === 'Em atraso').reduce((s, h) => s + h.valor, 0);
  const parcelado = lista.filter(h => h.status === 'Parcelado').reduce((s, h) => s + h.valor, 0);
  const nPendente  = lista.filter(h => h.status === 'Pendente').length;
  const nAtraso    = lista.filter(h => h.status === 'Em atraso').length;
  const nParcelado = lista.filter(h => h.status === 'Parcelado').length;

  document.getElementById('summary-cards').innerHTML = `
    <div class="s-card s-card--primary">
      <div class="s-icon"><svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
      <div class="s-num">${formatMoeda(recebido)}</div>
      <div class="s-lbl">Total recebido</div>
    </div>
    <div class="s-card">
      <div class="s-icon"><svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
      <span class="s-badge s-badge--pendente">${nPendente} cobranças</span>
      <div class="s-num">${formatMoeda(pendente)}</div>
      <div class="s-lbl">Pendente</div>
    </div>
    <div class="s-card">
      <div class="s-icon"><svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
      <span class="s-badge s-badge--atraso">${nAtraso} em atraso</span>
      <div class="s-num">${formatMoeda(atraso)}</div>
      <div class="s-lbl">Em atraso</div>
    </div>
    <div class="s-card">
      <div class="s-icon"><svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
      <span class="s-badge s-badge--parcelado">${nParcelado} parcelados</span>
      <div class="s-num">${formatMoeda(parcelado)}</div>
      <div class="s-lbl">Parcelado</div>
    </div>
  `;
}

// ---------- GRÁFICO ----------
function renderGrafico() {
  const { meses, recebido, pendente } = graficoData;
  const maxVal = Math.max(...meses.map((_, i) => recebido[i] + pendente[i]));
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

// ---------- STATUS POR CLIENTE ----------
function renderClientes(lista) {
  const porCliente = {};
  lista.forEach(h => {
    if (!porCliente[h.cliente]) {
      porCliente[h.cliente] = { cor: h.cor, valor: 0, status: h.status };
    }
    porCliente[h.cliente].valor += h.valor;
    // Status mais grave prevalece
    const prioridade = { 'Em atraso': 3, 'Pendente': 2, 'Parcelado': 1, 'Pago': 0 };
    if ((prioridade[h.status] || 0) > (prioridade[porCliente[h.cliente].status] || 0)) {
      porCliente[h.cliente].status = h.status;
    }
  });

  document.getElementById('clients-list').innerHTML = Object.entries(porCliente)
    .map(([nome, info]) => {
      const iniciais = nome.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();
      const s = honorariosStatusMap[info.status];
      return `<div class="client-row">
        <div class="cl-av" style="background:${info.cor}">${iniciais}</div>
        <div class="cl-info">
          <div class="cl-name">${nome}</div>
          <div class="cl-val">${formatMoeda(info.valor)}</div>
        </div>
        <span class="pill ${s.cls}">${info.status}</span>
      </div>`;
    }).join('');
}

// ---------- TABELA ----------
function renderTabela(lista) {
  const tbody = document.getElementById('table-body');
  const count = document.getElementById('table-count');

  if (!lista.length) {
    tbody.innerHTML = '<div class="empty-state">Nenhum lançamento encontrado.</div>';
    count.textContent = '';
    return;
  }

  tbody.innerHTML = lista.map(h => {
    const s = honorariosStatusMap[h.status];
    const podePagar = h.status === 'Pendente' || h.status === 'Em atraso' || h.status === 'Parcelado';
    return `<div class="table-row" data-id="${h.id}">
      <div><div class="t-proc">${h.processo}</div><div class="t-sub">${h.num}</div></div>
      <div class="t-cell">${h.cliente.split(' ').slice(0,2).join(' ')}</div>
      <div><span class="tipo-tag">${h.tipo}</span></div>
      <div class="t-val">${formatMoeda(h.valor)}</div>
      <div class="t-cell">${h.venc}</div>
      <div><span class="pill ${s.cls}">${h.status}</span></div>
      <div style="display:flex;gap:6px;align-items:center">
        <button class="btn-det" onclick="window.location.href='honorario-detalhe.html?id=${h.id}'">Detalhes</button>
        ${podePagar ? `<button class="btn-pagar" data-id="${h.id}" title="Marcar como pago" style="font-size:11px;padding:4px 10px;border-radius:6px;border:0.5px solid #2d7a52;background:#e8f5ee;color:#085041;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap;transition:all 0.12s">✓ Pago</button>` : ''}
      </div>
    </div>`;
  }).join('');

  // Bind botões "Pago"
  tbody.querySelectorAll('.btn-pagar').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      const item = honorariosData.find(h => h.id === id);
      if (!item) return;
      item.status = 'Pago';
      Toast.show(`Honorário de ${item.cliente.split(' ')[0]} marcado como pago!`, 'success');
      aplicarFiltros();
    });
  });

  const n = lista.length;
  count.textContent = `${n} lançamento${n !== 1 ? 's' : ''}`;
}

// ---------- FILTROS ----------
function aplicarFiltros() {
  const status = document.getElementById('f-status').value;
  const lista = honorariosData.filter(h => !status || h.status === status);
  renderCards(lista);
  renderClientes(lista);
  renderTabela(lista);
}

// ---------- MODAL ----------
const overlay   = document.getElementById('modal-overlay');
const btnNovo   = document.getElementById('btn-novo');
const btnClose  = document.getElementById('modal-close');
const btnCancel = document.getElementById('modal-cancel');
const btnSave   = document.getElementById('modal-save');

function abrirModal()  { overlay.classList.add('active'); document.getElementById('f-processo').focus(); }
function fecharModal() { overlay.classList.remove('active'); limparModal(); }

function limparModal() {
  ['f-processo','f-num','f-cliente','f-valor'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('f-tipo').value         = 'Fixo';
  document.getElementById('f-status-modal').value = 'Pendente';
  document.getElementById('f-resp').value          = 'Rafael Silva';
  document.getElementById('f-venc').value          = '';
}

function salvarLancamento() {
  const processo = document.getElementById('f-processo').value.trim();
  const cliente  = document.getElementById('f-cliente').value.trim();
  const valor    = parseFloat(document.getElementById('f-valor').value);

  if (!processo || !cliente || isNaN(valor) || valor <= 0) {
    alert('Preencha processo, cliente e valor.');
    return;
  }

  const vencRaw = document.getElementById('f-venc').value;
  let venc = '—';
  if (vencRaw) {
    const [y, m, d] = vencRaw.split('-');
    venc = `${d}/${m}/${y}`;
  }

  const cores = ['#2d5a3d','#3d5a7a','#7a6a3d','#5a3d6a','#3d6a5a','#6a3d3d'];
  const novoId = honorariosData.length ? Math.max(...honorariosData.map(h => h.id)) + 1 : 1;

  honorariosData.unshift({
    id: novoId,
    processo,
    num: document.getElementById('f-num').value.trim() || '—',
    cliente,
    cor: cores[novoId % cores.length],
    tipo:   document.getElementById('f-tipo').value,
    valor,
    venc,
    status: document.getElementById('f-status-modal').value,
  });

  fecharModal();
  aplicarFiltros();
}

btnNovo.addEventListener('click', abrirModal);
btnClose.addEventListener('click', fecharModal);
btnCancel.addEventListener('click', fecharModal);
btnSave.addEventListener('click', salvarLancamento);
overlay.addEventListener('click', e => { if (e.target === overlay) fecharModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharModal(); });
document.getElementById('f-status').addEventListener('change', aplicarFiltros);
document.getElementById('f-ano').addEventListener('change', () => {
  const ano = document.getElementById('f-ano').value;
  document.getElementById('ano-label').textContent = `Ano de ${ano}`;
  aplicarFiltros();
});

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  renderGrafico();
  aplicarFiltros();
  Notifications.init('btn-notificacoes')
});