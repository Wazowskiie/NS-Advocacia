const params    = new URLSearchParams(window.location.search);
const clienteId = Number(params.get('id')) || 1;

const sMap = {
  'Urgente':      'pill--urgent',
  'Aguardando':   'pill--waiting',
  'Em andamento': 'pill--progress',
};
const sMapH = {
  'Pago':'pill--progress', 'Pendente':'pill--waiting',
  'Em atraso':'pill--urgent', 'Parcelado':'pill--info',
};
const sMapC = {
  'Pago':'pill--progress', 'Pendente':'pill--waiting', 'Reembolsado':'pill--info',
};

function init() {
  const cli = clientesData.find(c => c.id === clienteId);
  if (!cli) {
    document.querySelector('.main').innerHTML = '<div style="padding:48px;text-align:center;color:#9a9a94">Cliente não encontrado.</div>';
    return;
  }

  document.getElementById('breadcrumb-nome').textContent = cli.nome;
  document.title = `NS Advocacia — ${cli.nome}`;

  const av = document.getElementById('hero-avatar');
  av.textContent = cli.iniciais;
  av.style.background = cli.cor;

  document.getElementById('hero-nome').textContent = cli.nome;
  document.getElementById('hero-sub').textContent  = `${cli.email} · ${cli.telefone}`;

  const tipoLabel = cli.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica';
  const tipoCls   = cli.tipo === 'PF' ? 'pill--info' : 'pill--escrit';
  document.getElementById('hero-badges').innerHTML = `
    <span class="pill ${tipoCls}">${tipoLabel}</span>
    ${cli.vip ? '<span class="pill pill--waiting">VIP</span>' : ''}
  `;

  document.getElementById('hero-stats').innerHTML = `
    <div class="h-stat"><div class="h-stat__label">Processos ativos</div><div class="h-stat__value">${cli.processos}</div></div>
    <div class="h-stat"><div class="h-stat__label">Valor em causa</div><div class="h-stat__value">${cli.valor}</div></div>
    <div class="h-stat"><div class="h-stat__label">Responsável</div><div class="h-stat__value">${cli.resp}</div></div>
    <div class="h-stat"><div class="h-stat__label">Cliente desde</div><div class="h-stat__value">${cli.desde}</div></div>
  `;

  renderDados(cli);
  renderProcessos(cli);
  renderFinanceiro(cli);

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('pane-' + tab.dataset.pane).classList.add('active');
    });
  });
}

function renderDados(cli) {
  document.getElementById('pane-dados').innerHTML = `
    <div class="data-grid">
      <div class="data-card">
        <h4>Contato</h4>
        <div class="data-row"><span class="data-row__label">Telefone</span><span class="data-row__value">${cli.telefone}</span></div>
        <div class="data-row"><span class="data-row__label">E-mail</span><span class="data-row__value">${cli.email}</span></div>
        <div class="data-row"><span class="data-row__label">Endereço</span><span class="data-row__value">${cli.endereco}</span></div>
      </div>
      <div class="data-card">
        <h4>Dados cadastrais</h4>
        <div class="data-row"><span class="data-row__label">Tipo</span><span class="data-row__value">${cli.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</span></div>
        <div class="data-row"><span class="data-row__label">Documento</span><span class="data-row__value">${cli.doc}</span></div>
        <div class="data-row"><span class="data-row__label">Responsável</span><span class="data-row__value">${cli.resp}</span></div>
        <div class="data-row"><span class="data-row__label">Cliente desde</span><span class="data-row__value">${cli.desde}</span></div>
        <div class="data-row"><span class="data-row__label">VIP</span><span class="data-row__value">${cli.vip ? 'Sim' : 'Não'}</span></div>
      </div>
    </div>
  `;
}

function renderProcessos(cli) {
  const procs = processosData.filter(p => p.cliente === cli.nome);
  document.getElementById('pane-processos').innerHTML = procs.length
    ? `<div class="related-list">${procs.map(p => `
        <a class="related-item" href="processo-detalhe.html?id=${p.id}">
          <div class="related-info">
            <h5>${p.tipo}</h5>
            <p>${p.numero} · ${p.vara}</p>
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <span class="pill ${sMap[p.status] || 'pill--waiting'}">${p.status}</span>
            <span style="font-size:12px;color:var(--t3)">${p.prazo}</span>
          </div>
        </a>`).join('')}
      </div>`
    : '<div class="empty-state"><p>Nenhum processo vinculado a este cliente.</p></div>';
}

function renderFinanceiro(cli) {
  const hons   = honorariosData.filter(h => h.cliente === cli.nome);
  const custas = custasData.filter(c => c.cliente === cli.nome);
  const totalH = hons.reduce((s, h) => s + h.valor, 0);
  const totalC = custas.reduce((s, c) => s + c.valor, 0);

  const honHTML = hons.length
    ? hons.map(h => `
        <div class="fin-row">
          <div class="fin-info"><h5>${h.processo} — ${h.tipo}</h5><p>Vence ${h.venc}</p></div>
          <div class="fin-right">
            <div class="fin-value">R$ ${h.valor.toLocaleString('pt-BR')}</div>
            <span class="pill ${sMapH[h.status] || 'pill--waiting'}" style="font-size:10.5px">${h.status}</span>
          </div>
        </div>`).join('')
    : '<div class="empty-state"><p>Nenhum honorário registrado.</p></div>';

  const custasHTML = custas.length
    ? custas.map(c => `
        <div class="fin-row">
          <div class="fin-info"><h5>${c.tipo}</h5><p>${c.processo} · ${c.data}</p></div>
          <div class="fin-right">
            <div class="fin-value">R$ ${c.valor.toLocaleString('pt-BR')}</div>
            <span class="pill ${sMapC[c.status] || 'pill--waiting'}" style="font-size:10.5px">${c.status}</span>
          </div>
        </div>`).join('')
    : '<div class="empty-state"><p>Nenhuma custa registrada.</p></div>';

  document.getElementById('pane-financeiro').innerHTML = `
    <div class="fin-section">
      <h4>Honorários</h4>${honHTML}
      ${hons.length ? `<div class="fin-total"><span>Total</span><strong>R$ ${totalH.toLocaleString('pt-BR')}</strong></div>` : ''}
    </div>
    <div class="fin-section">
      <h4>Custas</h4>${custasHTML}
      ${custas.length ? `<div class="fin-total"><span>Total</span><strong>R$ ${totalC.toLocaleString('pt-BR')}</strong></div>` : ''}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', init);