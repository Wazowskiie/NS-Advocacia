// ============================================================
// NS Advocacia — Custas
// Integrado com backend via API
// ============================================================

const custasStatusMap = {
  'Pendente':    { cls: 'pill--waiting',  label: 'Pendente'    },
  'Reembolsado': { cls: 'pill--info',     label: 'Reembolsado' },
  'Pago':        { cls: 'pill--progress', label: 'Pago'        },
};

const tipoConfig = {
  'Taxa judiciária':        { cor: '#2d5a3d' },
  'Depósito recursal':      { cor: '#3d5a7a' },
  'Peritos / assistentes':  { cor: '#7a6a3d' },
  'Diligências / oficiais': { cor: '#5a3d6a' },
  'Cópias e certidões':     { cor: '#3d6a5a' },
  'Outras despesas':        { cor: '#888780' },
};

function formatMoeda(v) {
  return `R$ ${(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

let custasData = [];

async function carregarCustas() {
  try {
    const dados = await Api.get('/custas');
    custasData = (dados || []).map(c => ({
      id:       c.id,
      processo: c.processo?.titulo || '—',
      num:      c.processo?.numero || '—',
      cliente:  c.cliente?.nome || c.processo?.cliente?.nome || '—',
      tipo:     c.tipo || 'Outras despesas',
      valor:    Number(c.valor) || 0,
      data:     c.data ? new Date(c.data).toLocaleDateString('pt-BR') : '—',
      pagador:  c.pagador || 'Escritório',
      status:   c.status || 'Pendente',
    }));
  } catch (err) {
    console.error('Erro ao carregar custas:', err);
    custasData = [];
  }
}

function renderCards(lista) {
  const total      = lista.reduce((s, c) => s + c.valor, 0);
  const escritorio = lista.filter(c => c.pagador === 'Escritório').reduce((s, c) => s + c.valor, 0);
  const pendente   = lista.filter(c => c.status === 'Pendente').reduce((s, c) => s + c.valor, 0);
  const reemb      = lista.filter(c => c.status === 'Reembolsado').reduce((s, c) => s + c.valor, 0);

  document.getElementById('summary-cards').innerHTML = `
    <div class="s-card s-card--primary">
      <div class="s-icon"><svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
      <div class="s-num">${formatMoeda(total)}</div><div class="s-lbl">Total em custas</div>
    </div>
    <div class="s-card">
      <div class="s-icon"><svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></div>
      <span class="s-badge s-badge--escrit">adiantado</span>
      <div class="s-num">${formatMoeda(escritorio)}</div><div class="s-lbl">Pelo escritório</div>
    </div>
    <div class="s-card">
      <div class="s-icon"><svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
      <span class="s-badge s-badge--pendente">a receber</span>
      <div class="s-num">${formatMoeda(pendente)}</div><div class="s-lbl">Pendente reembolso</div>
    </div>
    <div class="s-card">
      <div class="s-icon"><svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/></svg></div>
      <span class="s-badge s-badge--reemb">quitado</span>
      <div class="s-num">${formatMoeda(reemb)}</div><div class="s-lbl">Reembolsado</div>
    </div>`;
}

function renderPagador(lista) {
  const total      = lista.reduce((s, c) => s + c.valor, 0) || 1;
  const escritorio = lista.filter(c => c.pagador === 'Escritório').reduce((s, c) => s + c.valor, 0);
  const cliente    = lista.filter(c => c.pagador === 'Cliente').reduce((s, c) => s + c.valor, 0);
  const pendente   = lista.filter(c => c.status === 'Pendente').reduce((s, c) => s + c.valor, 0);
  const reemb      = lista.filter(c => c.status === 'Reembolsado').reduce((s, c) => s + c.valor, 0);
  const pctEscrit  = Math.round((escritorio / total) * 100);
  const pctCliente = Math.round((cliente / total) * 100);
  const pctPend    = escritorio > 0 ? Math.round((pendente / escritorio) * 100) : 0;
  const pctReemb   = escritorio > 0 ? Math.round((reemb / escritorio) * 100) : 0;

  document.getElementById('total-label').textContent = `Total: ${formatMoeda(total)}`;
  document.getElementById('pagador-list').innerHTML = `
    <div class="pagador-row">
      <div class="pagador-label"><span>Escritório adiantou</span><span>${formatMoeda(escritorio)} (${pctEscrit}%)</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${pctEscrit}%;background:#5a3d6a"></div></div>
    </div>
    <div class="pagador-row">
      <div class="pagador-label"><span>Cliente pagou direto</span><span>${formatMoeda(cliente)} (${pctCliente}%)</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${pctCliente}%;background:#3d7a52"></div></div>
    </div>
    <div class="pagador-row">
      <div class="pagador-label"><span>Já reembolsado ao escritório</span><span>${formatMoeda(reemb)}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${pctReemb}%;background:#2563a8"></div></div>
    </div>
    <div class="pagador-row">
      <div class="pagador-label"><span>Pendente de reembolso</span><span>${formatMoeda(pendente)}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${pctPend}%;background:#c07a20"></div></div>
    </div>`;
}

function renderTipos(lista) {
  const total = lista.reduce((s, c) => s + c.valor, 0) || 1;
  const porTipo = {};
  lista.forEach(c => { porTipo[c.tipo] = (porTipo[c.tipo] || 0) + c.valor; });
  const ordenado = Object.entries(porTipo).sort((a, b) => b[1] - a[1]);
  document.getElementById('tipo-list').innerHTML = ordenado.map(([tipo, valor]) => {
    const cfg = tipoConfig[tipo] || { cor: '#888780' };
    const pct = Math.round((valor / total) * 100);
    return `<div class="tipo-row">
      <div class="tipo-info"><div class="tipo-dot" style="background:${cfg.cor}"></div><span class="tipo-nome">${tipo}</span></div>
      <div class="tipo-right"><span class="tipo-val">${formatMoeda(valor)}</span><span class="tipo-pct">${pct}%</span></div>
    </div>`;
  }).join('');
}

function renderTabela(lista) {
  const tbody = document.getElementById('table-body');
  const count = document.getElementById('table-count');
  if (!lista.length) {
    tbody.innerHTML = '<div class="empty-state">Nenhuma custa encontrada para os filtros aplicados.</div>';
    count.textContent = '';
    return;
  }
  tbody.innerHTML = lista.map(c => {
    const s = custasStatusMap[c.status] || custasStatusMap['Pendente'];
    const pgCls = c.pagador === 'Escritório' ? 'pagador-tag--escrit' : 'pagador-tag--cliente';
    const podeReembolsar = c.pagador === 'Escritório' && c.status === 'Pendente';
    return `<div class="table-row" data-id="${c.id}">
      <div><div class="t-proc">${c.processo}</div><div class="t-sub">${c.num}</div></div>
      <div class="t-cell">${c.cliente.split(' ').slice(0,2).join(' ')}</div>
      <div class="t-cell">${c.tipo}</div>
      <div class="t-val">${formatMoeda(c.valor)}</div>
      <div class="t-cell">${c.data}</div>
      <div><span class="pagador-tag ${pgCls}">${c.pagador}</span></div>
      <div><span class="pill ${s.cls}">${s.label}</span></div>
      <div style="display:flex;gap:6px;align-items:center">
        <button class="btn-ver">Ver</button>
        ${podeReembolsar ? `<button class="btn-reembolsar" data-id="${c.id}" style="font-size:11px;padding:4px 8px;border-radius:6px;border:0.5px solid #2563a8;background:#e8f0fb;color:#0c447c;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap">↩ Reemb.</button>` : ''}
      </div>
    </div>`;
  }).join('');

  tbody.querySelectorAll('.btn-reembolsar').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      try {
        await Api.patch(`/custas/${id}`, { status: 'Reembolsado' });
        const item = custasData.find(c => c.id === id);
        if (item) item.status = 'Reembolsado';
        Toast.show('Custa marcada como reembolsada!', 'info');
        aplicarFiltros();
      } catch (err) {
        Toast.show('Erro ao atualizar status.', 'error');
      }
    });
  });

  count.textContent = `${lista.length} lançamento${lista.length !== 1 ? 's' : ''}`;
}

function aplicarFiltros() {
  const q       = document.getElementById('f-busca').value.toLowerCase().trim();
  const tipo    = document.getElementById('f-tipo').value;
  const pagador = document.getElementById('f-pagador').value;
  const status  = document.getElementById('f-status').value;
  const lista = custasData.filter(c => {
    if (q && !c.processo.toLowerCase().includes(q) && !c.cliente.toLowerCase().includes(q)) return false;
    if (tipo    && c.tipo    !== tipo)    return false;
    if (pagador && c.pagador !== pagador) return false;
    if (status  && c.status  !== status)  return false;
    return true;
  });
  renderCards(lista);
  renderPagador(lista);
  renderTipos(lista);
  renderTabela(lista);
}

function limparFiltros() {
  document.getElementById('f-busca').value   = '';
  document.getElementById('f-tipo').value    = '';
  document.getElementById('f-pagador').value = '';
  document.getElementById('f-status').value  = '';
  aplicarFiltros();
}

const overlay   = document.getElementById('modal-overlay');
const btnNovo   = document.getElementById('btn-novo');
const btnClose  = document.getElementById('modal-close');
const btnCancel = document.getElementById('modal-cancel');
const btnSave   = document.getElementById('modal-save');

function abrirModal()  { overlay.classList.add('active'); document.getElementById('f-processo').focus(); }
function fecharModal() { overlay.classList.remove('active'); limparModal(); }

function limparModal() {
  ['f-processo','f-num','f-cliente','f-valor','f-data','f-obs'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('f-tipo-modal').value    = 'Taxa judiciária';
  document.getElementById('f-pagador-modal').value = 'Escritório';
  document.getElementById('f-status-modal').value  = 'Pendente';
}

async function salvarCusta() {
  const processo = document.getElementById('f-processo').value.trim();
  const cliente  = document.getElementById('f-cliente').value.trim();
  const valor    = parseFloat(document.getElementById('f-valor').value);
  if (!processo || !cliente || isNaN(valor) || valor <= 0) {
    Toast.show('Preencha processo, cliente e valor.', 'error');
    return;
  }
  btnSave.disabled = true;
  btnSave.textContent = 'Salvando...';
  try {
    const dataRaw = document.getElementById('f-data').value;
    await Api.post('/custas', {
      tipo:           document.getElementById('f-tipo-modal').value,
      valor,
      pagador:        document.getElementById('f-pagador-modal').value,
      status:         document.getElementById('f-status-modal').value,
      data:           dataRaw || undefined,
      descricao:      document.getElementById('f-obs').value.trim() || undefined,
      processoTitulo: processo,
      clienteNome:    cliente,
    });
    Toast.show('Custa registrada com sucesso!', 'success');
    fecharModal();
    await carregarCustas();
    aplicarFiltros();
  } catch (err) {
    Toast.show(err.message || 'Erro ao salvar custa.', 'error');
  } finally {
    btnSave.disabled = false;
    btnSave.textContent = 'Salvar';
  }
}

btnNovo.addEventListener('click', abrirModal);
btnClose.addEventListener('click', fecharModal);
btnCancel.addEventListener('click', fecharModal);
btnSave.addEventListener('click', salvarCusta);
overlay.addEventListener('click', e => { if (e.target === overlay) fecharModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharModal(); });
document.getElementById('f-busca').addEventListener('input', aplicarFiltros);
document.getElementById('f-tipo').addEventListener('change', aplicarFiltros);
document.getElementById('f-pagador').addEventListener('change', aplicarFiltros);
document.getElementById('f-status').addEventListener('change', aplicarFiltros);
document.getElementById('btn-limpar').addEventListener('click', limparFiltros);
document.getElementById('f-ano').addEventListener('change', () => {
  document.getElementById('ano-label').textContent = `Ano de ${document.getElementById('f-ano').value}`;
  aplicarFiltros();
});

document.addEventListener('DOMContentLoaded', async () => {
  await carregarCustas();
  aplicarFiltros();
  if (typeof Notifications !== 'undefined') Notifications.init('btn-notificacoes');
});
