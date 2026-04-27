// ============================================================
// NS Advocacia — Processo Detalhe
// ============================================================
const params = new URLSearchParams(window.location.search);
const processoId = Number(params.get('id'));

const procStatusMap = {
  'ATIVO':        { cls: 'pill--progress', label: 'Em andamento' },
  'ARQUIVADO':    { cls: 'pill--waiting',  label: 'Arquivado'    },
  'ENCERRADO':    { cls: 'pill--waiting',  label: 'Encerrado'    },
  'SUSPENSO':     { cls: 'pill--urgent',   label: 'Suspenso'     },
  'Urgente':      { cls: 'pill--urgent',   label: 'Urgente'      },
  'Aguardando':   { cls: 'pill--waiting',  label: 'Aguardando'   },
  'Em andamento': { cls: 'pill--progress', label: 'Em andamento' },
};

const tipoCor = {
  prazo: '#c0392b', audiencia: '#2563a8', peticao: '#2d7a52',
  decisao: '#c07a20', outro: '#888780',
};

let _proc = null;

async function init() {
  if (!processoId) {
    document.querySelector('.main').innerHTML = '<div style="padding:48px;text-align:center;color:#9a9a94">ID do processo não informado.</div>';
    return;
  }
  try {
    _proc = await Api.get(`/processos/${processoId}`);
  } catch (err) {
    document.querySelector('.main').innerHTML = '<div style="padding:48px;text-align:center;color:#9a9a94">Processo não encontrado.</div>';
    return;
  }
  if (!_proc) { document.querySelector('.main').innerHTML = '<div style="padding:48px;text-align:center;color:#9a9a94">Processo não encontrado.</div>'; return; }

  const p = normalizarProcesso(_proc);
  document.getElementById('breadcrumb-titulo').textContent = p.tipo;
  document.title = `NS Advocacia — ${p.tipo}`;
  document.getElementById('hero-tipo').textContent = p.tipo;
  document.getElementById('hero-num').textContent  = `${p.num} · ${p.vara}`;

  const s = procStatusMap[p.status] || procStatusMap['Em andamento'];
  document.getElementById('hero-badges').innerHTML = `
    <span class="pill ${s.cls}">${s.label}</span>
    ${p.area ? `<span style="font-size:11px;color:var(--t3);padding:3px 0">Área: ${p.area}</span>` : ''}
  `;
  document.getElementById('hero-stats').innerHTML = `
    <div class="h-stat"><div class="h-stat__label">Cliente</div><div class="h-stat__value">${p.cliente}</div></div>
    <div class="h-stat"><div class="h-stat__label">Responsável</div><div class="h-stat__value">${p.resp}</div></div>
    <div class="h-stat"><div class="h-stat__label">Ajuizamento</div><div class="h-stat__value">${p.ajuizamento}</div></div>
    <div class="h-stat"><div class="h-stat__label">Valor da causa</div><div class="h-stat__value">${p.valor}</div></div>
  `;

  renderDados(p);
  await renderHistorico(p);
  renderDocumentos(p);
  await renderFinanceiro(p);
  renderCliente(p);

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(pn => pn.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('pane-' + tab.dataset.pane).classList.add('active');
    });
  });

  const overlay = document.getElementById('modal-overlay');
  document.getElementById('btn-andamento').onclick = () => overlay.classList.add('active');
  document.getElementById('modal-close').onclick   = () => fecharModal();
  document.getElementById('modal-cancel').onclick  = () => fecharModal();
  document.getElementById('modal-save').onclick    = () => salvarAndamento();
  overlay.addEventListener('click', e => { if (e.target === overlay) fecharModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharModal(); });

  document.getElementById('btn-arquivar').onclick = () => {
    Confirm.show('Arquivar processo?', `O processo "${p.tipo}" será movido para o arquivo.`, async () => {
      try {
        await Api.patch(`/processos/${processoId}`, { status: 'ARQUIVADO' });
        Toast.show('Processo arquivado.', 'warning');
        setTimeout(() => window.location.href = 'processos.html', 1200);
      } catch (err) { Toast.show('Erro ao arquivar.', 'error'); }
    }, 'warning');
  };

  if (typeof Notifications !== 'undefined') Notifications.init('btn-notificacoes');
}

function normalizarProcesso(p) {
  return {
    id: p.id, tipo: p.titulo || '—', num: p.numero || '—',
    cliente: p.cliente?.nome || '—', clienteId: p.cliente?.id,
    resp: p.advogados?.[0]?.usuario?.nome || '—', status: p.status,
    area: p.area || '', vara: p.vara || p.tribunal || '—', comarca: p.comarca || '—',
    valor: p.valorCausa ? `R$ ${Number(p.valorCausa).toLocaleString('pt-BR')}` : '—',
    ajuizamento: p.dataDistribuicao ? new Date(p.dataDistribuicao).toLocaleDateString('pt-BR') : '—',
    prazoUrgente: p.status === 'SUSPENSO',
  };
}

function renderDados(p) {
  document.getElementById('pane-dados').innerHTML = `
    <div class="data-grid">
      <div class="data-card">
        <h4>Informações processuais</h4>
        <div class="data-row"><span class="data-row__label">Número</span><span class="data-row__value data-row__value--small">${p.num}</span></div>
        <div class="data-row"><span class="data-row__label">Ajuizamento</span><span class="data-row__value">${p.ajuizamento}</span></div>
        <div class="data-row"><span class="data-row__label">Vara / Tribunal</span><span class="data-row__value">${p.vara}</span></div>
        <div class="data-row"><span class="data-row__label">Comarca</span><span class="data-row__value">${p.comarca}</span></div>
        <div class="data-row"><span class="data-row__label">Área</span><span class="data-row__value">${p.area || '—'}</span></div>
      </div>
      <div class="data-card">
        <h4>Partes e responsável</h4>
        <div class="data-row"><span class="data-row__label">Cliente</span><span class="data-row__value">${p.cliente}</span></div>
        <div class="data-row"><span class="data-row__label">Responsável</span><span class="data-row__value">${p.resp}</span></div>
        <div class="data-row"><span class="data-row__label">Valor da causa</span><span class="data-row__value">${p.valor}</span></div>
        <div class="data-row"><span class="data-row__label">Status</span>
          <span class="pill ${(procStatusMap[p.status]||procStatusMap['Em andamento']).cls}" style="font-size:11px">
            ${(procStatusMap[p.status]||procStatusMap['Em andamento']).label}
          </span>
        </div>
      </div>
    </div>`;
}

async function renderHistorico(p) {
  let andamentos = [];
  try { andamentos = await Api.get(`/processos/${p.id}/andamentos`) || []; } catch(e) {}
  const itens = andamentos.map(a => {
    const tipo = a.tipo?.toLowerCase() || 'outro';
    const data = a.data ? new Date(a.data).toLocaleDateString('pt-BR') : '—';
    return `<div class="tl-item"><div class="tl-spine"><div class="tl-dot" style="background:${tipoCor[tipo]||'#888780'}"></div><div class="tl-line"></div></div>
      <div class="tl-body"><div class="tl-title">${a.titulo}</div><div class="tl-desc">${a.descricao||'—'}</div>
      <div class="tl-meta"><span class="tl-date">${data}</span><span class="tl-resp">${a.usuario?.nome||'—'}</span></div></div></div>`;
  }).join('');
  document.getElementById('pane-historico').innerHTML = `
    <div class="timeline">${itens||'<div class="empty-state"><p>Nenhum andamento registrado ainda.</p></div>'}</div>
    <div class="tl-add" id="tl-add-btn">
      <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
      <span>Adicionar andamento</span>
    </div>`;
  document.getElementById('tl-add-btn').onclick = () => document.getElementById('modal-overlay').classList.add('active');
}

function renderDocumentos(p) {
  document.getElementById('pane-documentos').innerHTML = `
    <div class="doc-grid">
      <div class="doc-card doc-card--add">
        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        <span>Adicionar documento</span>
      </div>
    </div>`;
}

async function renderFinanceiro(p) {
  let honorarios = [], custas = [];
  try { honorarios = await Api.get(`/honorarios?processoId=${p.id}`) || []; } catch(e) {}
  try { custas = await Api.get(`/custas?processoId=${p.id}`) || []; } catch(e) {}
  const sMapH = {'Pago':'pill--progress','Pendente':'pill--waiting','Em atraso':'pill--urgent','Parcelado':'pill--info'};
  const sMapC = {'Pago':'pill--progress','Pendente':'pill--waiting','Reembolsado':'pill--info'};
  const totalHon = honorarios.reduce((s,h) => s+(Number(h.valor)||0), 0);
  const totalCusto = custas.reduce((s,c) => s+(Number(c.valor)||0), 0);
  const honHTML = honorarios.length ? honorarios.map(h => `<div class="fin-row">
    <div class="fin-info"><h5>${h.tipo||'Honorário'}</h5><p>Vence ${h.dataVencimento?new Date(h.dataVencimento).toLocaleDateString('pt-BR'):'—'}</p></div>
    <div class="fin-right"><div class="fin-value">R$ ${Number(h.valor).toLocaleString('pt-BR')}</div>
    <span class="pill ${sMapH[h.status]||'pill--waiting'}" style="font-size:10.5px">${h.status||'—'}</span></div></div>`).join('')
    : '<div class="empty-state"><p>Nenhum honorário vinculado.</p></div>';
  const custasHTML = custas.length ? custas.map(c => `<div class="fin-row">
    <div class="fin-info"><h5>${c.tipo||'Custa'}</h5><p>${c.descricao||'—'}</p></div>
    <div class="fin-right"><div class="fin-value">R$ ${Number(c.valor).toLocaleString('pt-BR')}</div>
    <span class="pill ${sMapC[c.status]||'pill--waiting'}" style="font-size:10.5px">${c.status||'—'}</span></div></div>`).join('')
    : '<div class="empty-state"><p>Nenhuma custa registrada.</p></div>';
  document.getElementById('pane-financeiro').innerHTML = `
    <div class="fin-section"><h4>Honorários</h4>${honHTML}
    ${honorarios.length?`<div class="fin-total"><span>Total honorários</span><strong>R$ ${totalHon.toLocaleString('pt-BR')}</strong></div>`:''}</div>
    <div class="fin-section"><h4>Custas processuais</h4>${custasHTML}
    ${custas.length?`<div class="fin-total"><span>Total custas</span><strong>R$ ${totalCusto.toLocaleString('pt-BR')}</strong></div>`:''}</div>`;
}

function renderCliente(p) {
  if (!p.clienteId) { document.getElementById('pane-cliente').innerHTML = '<div class="empty-state"><p>Cliente não vinculado.</p></div>'; return; }
  const c = _proc.cliente;
  if (!c) { document.getElementById('pane-cliente').innerHTML = '<div class="empty-state"><p>Dados do cliente não disponíveis.</p></div>'; return; }
  const iniciais = c.nome.split(' ').filter(Boolean).map(n=>n[0]).slice(0,2).join('').toUpperCase();
  const cores = ["#2d5a3d","#3d5a7a","#7a6a3d","#5a3d6a","#3d6a5a"];
  const cor = cores[c.id % cores.length];
  document.getElementById('pane-cliente').innerHTML = `
    <div class="person-card">
      <div class="person-avatar" style="background:${cor}">${iniciais}</div>
      <div><div class="person-name">${c.nome}</div>
      <div class="person-sub">${c.telefone?c.telefone+' · ':''}${c.email||''}${c.endereco?'<br>'+c.endereco:''}</div>
      <a class="person-link" href="cliente-detalhe.html?id=${c.id}">Ver perfil completo →</a></div>
    </div>
    <div class="data-grid"><div class="data-card"><h4>Dados cadastrais</h4>
      <div class="data-row"><span class="data-row__label">Tipo</span><span class="data-row__value">${c.tipo==='PESSOA_JURIDICA'?'Pessoa Jurídica':'Pessoa Física'}</span></div>
      <div class="data-row"><span class="data-row__label">Documento</span><span class="data-row__value">${c.cpfCnpj||'—'}</span></div>
      <div class="data-row"><span class="data-row__label">E-mail</span><span class="data-row__value">${c.email||'—'}</span></div>
      <div class="data-row"><span class="data-row__label">Telefone</span><span class="data-row__value">${c.telefone||'—'}</span></div>
    </div></div>`;
}

function fecharModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  ['f-titulo','f-desc','f-data'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
  const t = document.getElementById('f-tipo-and'); if(t) t.value='prazo';
}

async function salvarAndamento() {
  const titulo = document.getElementById('f-titulo').value.trim();
  const desc   = document.getElementById('f-desc').value.trim();
  const data   = document.getElementById('f-data').value;
  const tipo   = document.getElementById('f-tipo-and').value;
  if (!titulo) { Toast.show('Preencha o título do andamento.', 'error'); return; }
  const btnSave = document.getElementById('modal-save');
  btnSave.disabled = true; btnSave.textContent = 'Salvando...';
  try {
    await Api.post(`/processos/${processoId}/andamentos`, { titulo, descricao: desc||undefined, data: data||undefined, tipo: tipo.toUpperCase() });
    fecharModal();
    Toast.show('Andamento registrado com sucesso!', 'success');
    if (_proc) await renderHistorico(normalizarProcesso(_proc));
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
    document.querySelector('.tab[data-pane="historico"]').classList.add('active');
    document.getElementById('pane-historico').classList.add('active');
  } catch(err) { Toast.show('Erro ao salvar andamento.', 'error'); }
  finally { btnSave.disabled=false; btnSave.textContent='Salvar andamento'; }
}

document.addEventListener('DOMContentLoaded', init);
