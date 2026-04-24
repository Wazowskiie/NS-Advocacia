const params = new URLSearchParams(window.location.search);
const honId  = Number(params.get('id')) || 1;

const sMap = {
  'Pago':      { cls: 'pill--progress', label: 'Pago'       },
  'Pendente':  { cls: 'pill--waiting',  label: 'Pendente'   },
  'Em atraso': { cls: 'pill--urgent',   label: 'Em atraso'  },
  'Parcelado': { cls: 'pill--info',     label: 'Parcelado'  },
};

function init() {
  const hon = honorariosData.find(h => h.id === honId);
  if (!hon) {
    document.querySelector('.main').innerHTML = '<div style="padding:48px;text-align:center;color:#9a9a94">Honorário não encontrado.</div>';
    return;
  }

  document.getElementById('breadcrumb-titulo').textContent = hon.processo;
  document.title = `LexDesk — ${hon.processo}`;
  document.getElementById('hero-titulo').textContent = hon.processo;
  document.getElementById('hero-sub').textContent    = `${hon.num} · ${hon.cliente}`;

  const s = sMap[hon.status] || sMap['Pendente'];
  document.getElementById('hero-badges').innerHTML = `
    <span class="pill ${s.cls}">${s.label}</span>
    <span style="font-size:11px;color:var(--t3);padding:3px 0">Tipo: ${hon.tipo}</span>
  `;

  document.getElementById('hero-stats').innerHTML = `
    <div class="h-stat"><div class="h-stat__label">Valor</div><div class="h-stat__value h-stat__value--green">R$ ${hon.valor.toLocaleString('pt-BR')}</div></div>
    <div class="h-stat"><div class="h-stat__label">Vencimento</div><div class="h-stat__value${hon.status === 'Em atraso' ? ' h-stat__value--urgent' : ''}">${hon.venc}</div></div>
    <div class="h-stat"><div class="h-stat__label">Cliente</div><div class="h-stat__value">${hon.cliente.split(' ').slice(0,2).join(' ')}</div></div>
    <div class="h-stat"><div class="h-stat__label">Tipo de cobrança</div><div class="h-stat__value">${hon.tipo}</div></div>
  `;

  renderDados(hon);
  renderHistorico(hon);

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('pane-' + tab.dataset.pane).classList.add('active');
    });
  });

  // Marcar como pago
  const btnPago = document.getElementById('btn-marcar-pago');
  if (hon.status === 'Pago') {
    btnPago.disabled = true;
    btnPago.textContent = 'Já pago';
    btnPago.style.opacity = '0.5';
  } else {
    btnPago.onclick = () => {
      Confirm.show(
        'Marcar como pago?',
        `Confirma o recebimento de R$ ${hon.valor.toLocaleString('pt-BR')} referente a "${hon.processo}"?`,
        () => {
          hon.status = 'Pago';
          Toast.show('Honorário marcado como pago!', 'success');
          init();
        }
      );
    };
  }
}

function renderDados(hon) {
  const cli = clientesData.find(c => c.nome === hon.cliente);
  const proc = processosData.find(p => p.tipo === hon.processo);
  const s = sMap[hon.status] || sMap['Pendente'];

  document.getElementById('pane-dados').innerHTML = `
    <div class="data-grid">
      <div class="data-card">
        <h4>Dados do lançamento</h4>
        <div class="data-row"><span class="data-row__label">Processo</span><span class="data-row__value">${hon.processo}</span></div>
        <div class="data-row"><span class="data-row__label">Número</span><span class="data-row__value">${hon.num}</span></div>
        <div class="data-row"><span class="data-row__label">Tipo de cobrança</span><span class="data-row__value">${hon.tipo}</span></div>
        <div class="data-row"><span class="data-row__label">Valor</span><span class="data-row__value">R$ ${hon.valor.toLocaleString('pt-BR')}</span></div>
        <div class="data-row"><span class="data-row__label">Vencimento</span><span class="data-row__value">${hon.venc}</span></div>
        <div class="data-row"><span class="data-row__label">Status</span><span class="pill ${s.cls}" style="font-size:11px">${s.label}</span></div>
      </div>
      <div class="data-card">
        <h4>Cliente</h4>
        ${cli ? `
          <div class="data-row"><span class="data-row__label">Nome</span><span class="data-row__value">${cli.nome}</span></div>
          <div class="data-row"><span class="data-row__label">Telefone</span><span class="data-row__value">${cli.telefone}</span></div>
          <div class="data-row"><span class="data-row__label">E-mail</span><span class="data-row__value data-row__value--small">${cli.email}</span></div>
          <div class="data-row"><span class="data-row__label">Tipo</span><span class="data-row__value">${cli.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</span></div>
          <div style="margin-top:12px"><a href="cliente-detalhe.html?id=${cli.id}" style="font-size:12.5px;color:var(--ga);cursor:pointer">Ver perfil completo →</a></div>
        ` : '<p style="font-size:12.5px;color:var(--t3);padding:8px 0">Cliente não encontrado.</p>'}
      </div>
    </div>
    ${proc ? `<div style="margin-top:14px"><div class="data-card"><h4>Processo vinculado</h4>
      <div class="data-row"><span class="data-row__label">Tipo</span><span class="data-row__value">${proc.tipo}</span></div>
      <div class="data-row"><span class="data-row__label">Número</span><span class="data-row__value data-row__value--small">${proc.numero}</span></div>
      <div class="data-row"><span class="data-row__label">Vara</span><span class="data-row__value">${proc.vara}</span></div>
      <div style="margin-top:12px"><a href="processo-detalhe.html?id=${proc.id}" style="font-size:12.5px;color:var(--ga);cursor:pointer">Ver processo completo →</a></div>
    </div></div>` : ''}
  `;
}

function renderHistorico(hon) {
  const historico = [
    { evento: 'Lançamento criado', data: hon.venc, obs: `Valor: R$ ${hon.valor.toLocaleString('pt-BR')} — Tipo: ${hon.tipo}` },
    ...(hon.status === 'Pago' ? [{ evento: 'Pagamento recebido', data: 'Hoje', obs: `R$ ${hon.valor.toLocaleString('pt-BR')} confirmado` }] : []),
    ...(hon.status === 'Em atraso' ? [{ evento: 'Vencimento em atraso', data: hon.venc, obs: 'Pagamento não identificado até a data de vencimento.' }] : []),
  ];

  document.getElementById('pane-historico').innerHTML = `
    <div class="timeline">
      ${historico.map((h, i) => `
        <div class="tl-item">
          <div class="tl-spine">
            <div class="tl-dot" style="background:${i === 0 ? '#3d7a52' : i === historico.length - 1 && hon.status === 'Em atraso' ? '#c0392b' : '#2563a8'}"></div>
            <div class="tl-line"></div>
          </div>
          <div class="tl-body">
            <div class="tl-title">${h.evento}</div>
            <div class="tl-desc">${h.obs}</div>
            <div class="tl-meta"><span class="tl-date">${h.data}</span></div>
          </div>
        </div>`).join('')}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', init);