// Lê o ID da URL: processo-detalhe.html?id=1
const params = new URLSearchParams(window.location.search);
const processoId = Number(params.get('id')) || 1;

const procStatusMap = {
  'Urgente':      { cls: 'pill--urgent',   label: 'Urgente'      },
  'Aguardando':   { cls: 'pill--waiting',  label: 'Aguardando'   },
  'Em andamento': { cls: 'pill--progress', label: 'Em andamento' },
};

const tipoCor = {
  prazo:     '#c0392b',
  audiencia: '#2563a8',
  peticao:   '#2d7a52',
  decisao:   '#c07a20',
  outro:     '#888780',
};

// Andamentos mockados por processo
const andamentosData = {
  1: [
  ],
};

const documentosData = {
  1: [
    { nome:'Procuração ad judicia', tipo:'PDF', tamanho:'180 KB', data:'10/01/2024' },
    { nome:'Ata de audiência',     tipo:'PDF', tamanho:'98 KB',  data:'15/03/2024' },
  ],
};

function init() {
  const proc = processosData.find(p => p.id === processoId);
  if (!proc) {
    document.querySelector('.main').innerHTML = '<div style="padding:48px;text-align:center;color:#9a9a94">Processo não encontrado.</div>';
    return;
  }

  // Breadcrumb
  document.getElementById('breadcrumb-titulo').textContent = proc.tipo;
  document.title = `NS Advocacia — ${proc.tipo}`;

  // Hero
  document.getElementById('hero-tipo').textContent = proc.tipo;
  document.getElementById('hero-num').textContent  = `${proc.numero} · ${proc.vara}`;

  const s = procStatusMap[proc.status] || procStatusMap['Em andamento'];
  document.getElementById('hero-badges').innerHTML = `
    <span class="pill ${s.cls}">${s.label}</span>
    <span style="font-size:11px;color:var(--t3);padding:3px 0">Fase: ${proc.fase}</span>
  `;

  document.getElementById('hero-stats').innerHTML = `
    <div class="h-stat"><div class="h-stat__label">Cliente</div><div class="h-stat__value">${proc.cliente}</div></div>
    <div class="h-stat"><div class="h-stat__label">Responsável</div><div class="h-stat__value">${proc.resp}</div></div>
    <div class="h-stat"><div class="h-stat__label">Prazo</div><div class="h-stat__value${proc.prazoUrgente ? ' h-stat__value--urgent' : ''}">${proc.prazo}</div></div>
    <div class="h-stat"><div class="h-stat__label">Valor da causa</div><div class="h-stat__value">${proc.valor}</div></div>
  `;

  renderDados(proc);
  renderHistorico(proc);
  renderDocumentos(proc);
  renderFinanceiro(proc);
  renderCliente(proc);

  // Abas
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('pane-' + tab.dataset.pane).classList.add('active');
    });
  });

  // Modal andamento
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('btn-andamento').onclick  = () => overlay.classList.add('active');
  document.getElementById('modal-close').onclick    = () => fecharModal();
  document.getElementById('modal-cancel').onclick   = () => fecharModal();
  document.getElementById('modal-save').onclick     = () => salvarAndamento(proc);
  overlay.addEventListener('click', e => { if (e.target === overlay) fecharModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharModal(); });

  // Arquivar
  document.getElementById('btn-arquivar').onclick = () => {
    Confirm.show(
      'Arquivar processo?',
      `O processo "${proc.tipo}" será movido para o arquivo. Você poderá reativá-lo depois.`,
      () => Toast.show('Processo arquivado.', 'warning'),
      'warning'
    );
  };

  Notifications.init('btn-notificacoes');
}

// ---------- DADOS ----------
function renderDados(proc) {
  document.getElementById('pane-dados').innerHTML = `
    <div class="data-grid">
      <div class="data-card">
        <h4>Informações processuais</h4>
        <div class="data-row"><span class="data-row__label">Número</span><span class="data-row__value data-row__value--small">${proc.numero}</span></div>
        <div class="data-row"><span class="data-row__label">Ajuizamento</span><span class="data-row__value">${proc.ajuizamento}</span></div>
        <div class="data-row"><span class="data-row__label">Vara / Tribunal</span><span class="data-row__value">${proc.vara}</span></div>
        <div class="data-row"><span class="data-row__label">Fase atual</span><span class="data-row__value">${proc.fase}</span></div>
        <div class="data-row"><span class="data-row__label">Próximo prazo</span><span class="data-row__value${proc.prazoUrgente ? ' data-row__value--urgent' : ''}">${proc.prazo}</span></div>
      </div>
      <div class="data-card">
        <h4>Partes e responsável</h4>
        <div class="data-row"><span class="data-row__label">Cliente</span><span class="data-row__value">${proc.cliente}</span></div>
        <div class="data-row"><span class="data-row__label">Responsável</span><span class="data-row__value">${proc.resp}</span></div>
        <div class="data-row"><span class="data-row__label">Valor da causa</span><span class="data-row__value">${proc.valor}</span></div>
        <div class="data-row"><span class="data-row__label">Status</span><span class="data-row__value">${proc.status}</span></div>
      </div>
    </div>
  `;
}

// ---------- HISTÓRICO ----------
function renderHistorico(proc) {
  const ands = andamentosData[proc.id] || [];
  const itens = ands.map(a => `
    <div class="tl-item">
      <div class="tl-spine">
        <div class="tl-dot" style="background:${tipoCor[a.tipo] || '#888780'}"></div>
        <div class="tl-line"></div>
      </div>
      <div class="tl-body">
        <div class="tl-title">${a.titulo}</div>
        <div class="tl-desc">${a.desc}</div>
        <div class="tl-meta">
          <span class="tl-date">${a.data}</span>
          <span class="tl-resp">${a.resp}</span>
        </div>
      </div>
    </div>
  `).join('');

  document.getElementById('pane-historico').innerHTML = `
    <div class="timeline">${itens || '<div class="empty-state"><p>Nenhum andamento registrado ainda.</p></div>'}</div>
    <div class="tl-add" id="tl-add-btn">
      <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
      <span>Adicionar andamento</span>
    </div>
  `;

  document.getElementById('tl-add-btn').onclick = () => {
    document.getElementById('modal-overlay').classList.add('active');
  };
}

// ---------- DOCUMENTOS ----------
function renderDocumentos(proc) {
  const docs = documentosData[proc.id] || [];
  const cards = docs.map(d => `
    <div class="doc-card">
      <div class="doc-icon">
        <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      </div>
      <div class="doc-name">${d.nome}</div>
      <div class="doc-meta">${d.tipo} · ${d.tamanho} · ${d.data}</div>
    </div>
  `).join('');

  document.getElementById('pane-documentos').innerHTML = `
    <div class="doc-grid">
      ${cards}
      <div class="doc-card doc-card--add">
        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        <span>Adicionar documento</span>
      </div>
    </div>
  `;
}

// ---------- FINANCEIRO ----------
function renderFinanceiro(proc) {
  const hons  = honorariosData.filter(h => h.processo === proc.tipo);
  const custas = custasData.filter(c => c.processo === proc.tipo);

  const sMapH = { 'Pago':'pill--progress', 'Pendente':'pill--waiting', 'Em atraso':'pill--urgent', 'Parcelado':'pill--info' };
  const sMapC = { 'Pago':'pill--progress', 'Pendente':'pill--waiting', 'Reembolsado':'pill--info' };

  const totalHon   = hons.reduce((s, h) => s + h.valor, 0);
  const totalCusto = custas.reduce((s, c) => s + c.valor, 0);

  const honHTML = hons.length ? hons.map(h => `
    <div class="fin-row">
      <div class="fin-info"><h5>${h.processo} — ${h.tipo}</h5><p>${h.resp} · Vence ${h.venc}</p></div>
      <div class="fin-right">
        <div class="fin-value">R$ ${h.valor.toLocaleString('pt-BR')}</div>
        <span class="pill ${sMapH[h.status] || 'pill--waiting'}" style="font-size:10.5px">${h.status}</span>
      </div>
    </div>`).join('') : '<div class="empty-state"><p>Nenhum honorário vinculado.</p></div>';

  const custasHTML = custas.length ? custas.map(c => `
    <div class="fin-row">
      <div class="fin-info"><h5>${c.tipo}</h5><p>${c.pagador} · ${c.data}</p></div>
      <div class="fin-right">
        <div class="fin-value">R$ ${c.valor.toLocaleString('pt-BR')}</div>
        <span class="pill ${sMapC[c.status] || 'pill--waiting'}" style="font-size:10.5px">${c.status}</span>
      </div>
    </div>`).join('') : '<div class="empty-state"><p>Nenhuma custa registrada.</p></div>';

  document.getElementById('pane-financeiro').innerHTML = `
    <div class="fin-section">
      <h4>Honorários</h4>
      ${honHTML}
      ${hons.length ? `<div class="fin-total"><span>Total honorários</span><strong>R$ ${totalHon.toLocaleString('pt-BR')}</strong></div>` : ''}
    </div>
    <div class="fin-section">
      <h4>Custas processuais</h4>
      ${custasHTML}
      ${custas.length ? `<div class="fin-total"><span>Total custas</span><strong>R$ ${totalCusto.toLocaleString('pt-BR')}</strong></div>` : ''}
    </div>
  `;
}

// ---------- CLIENTE ----------
function renderCliente(proc) {
  const cliente = clientesData.find(c => c.nome === proc.cliente);
  if (!cliente) {
    document.getElementById('pane-cliente').innerHTML = '<div class="empty-state"><p>Cliente não encontrado.</p></div>';
    return;
  }

  const outrosProcs = processosData.filter(p => p.cliente === proc.cliente && p.id !== proc.id);
  const sMap = { 'Urgente':'pill--urgent', 'Aguardando':'pill--waiting', 'Em andamento':'pill--progress' };

  document.getElementById('pane-cliente').innerHTML = `
    <div class="person-card">
      <div class="person-avatar" style="background:${cliente.cor}">${cliente.iniciais}</div>
      <div>
        <div class="person-name">${cliente.nome}</div>
        <div class="person-sub">${cliente.telefone} · ${cliente.email}<br>${cliente.endereco}</div>
        <a class="person-link" href="cliente-detalhe.html?id=${cliente.id}">Ver perfil completo →</a>
      </div>
    </div>
    <div class="data-grid">
      <div class="data-card">
        <h4>Dados cadastrais</h4>
        <div class="data-row"><span class="data-row__label">Tipo</span><span class="data-row__value">${cliente.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</span></div>
        <div class="data-row"><span class="data-row__label">Documento</span><span class="data-row__value">${cliente.doc}</span></div>
        <div class="data-row"><span class="data-row__label">Responsável</span><span class="data-row__value">${cliente.resp}</span></div>
        <div class="data-row"><span class="data-row__label">Cliente desde</span><span class="data-row__value">${cliente.desde}</span></div>
      </div>
      <div class="data-card">
        <h4>Outros processos (${outrosProcs.length})</h4>
        ${outrosProcs.length ? outrosProcs.map(p => `
          <div class="data-row">
            <span class="data-row__label">${p.tipo}</span>
            <span class="pill ${sMap[p.status] || 'pill--waiting'}" style="font-size:10px;padding:1px 7px">${p.status}</span>
          </div>`).join('') : '<div style="padding:12px 0;font-size:12.5px;color:var(--t3)">Nenhum outro processo.</div>'}
      </div>
    </div>
  `;
}

// ---------- MODAL ----------
function fecharModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  ['f-titulo','f-desc','f-data'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('f-tipo-and').value = 'prazo';
}

function salvarAndamento(proc) {
  const titulo = document.getElementById('f-titulo').value.trim();
  const desc   = document.getElementById('f-desc').value.trim();
  const data   = document.getElementById('f-data').value;
  const resp   = document.getElementById('f-resp').value;
  const tipo   = document.getElementById('f-tipo-and').value;

  if (!titulo) { Toast.show('Preencha o título do andamento.', 'error'); return; }

  let dataFmt = 'Hoje';
  if (data) {
    const [y, m, d] = data.split('-');
    dataFmt = `${d}/${m}/${y}`;
  }

  if (!andamentosData[proc.id]) andamentosData[proc.id] = [];
  andamentosData[proc.id].unshift({
    id: Date.now(),
    titulo,
    desc: desc || '—',
    data: dataFmt,
    resp,
    tipo,
  });

  fecharModal();
  renderHistorico(proc);
  Toast.show('Andamento registrado com sucesso!', 'success');

  // Muda aba para histórico
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelector('.tab[data-pane="historico"]').classList.add('active');
  document.getElementById('pane-historico').classList.add('active');
}

document.addEventListener('DOMContentLoaded', init);