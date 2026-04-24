let filtroAtivo = 'todos';
let expandidas  = new Set([1]); // intimação 1 começa expandida

// ---------- ABAS ----------
document.querySelectorAll('.mon-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.mon-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.mon-pane').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('pane-' + tab.dataset.pane).classList.add('active');
  });
});

// Botão "Importar processos" no topbar abre aba de importar
document.getElementById('btn-importar').addEventListener('click', () => {
  document.querySelectorAll('.mon-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.mon-pane').forEach(p => p.classList.remove('active'));
  document.querySelector('.mon-tab[data-pane="importar"]').classList.add('active');
  document.getElementById('pane-importar').classList.add('active');
});

// ---------- STATS ----------
function renderStats() {
  const novas      = intimacoesData.filter(i => !i.lida).length;
  const total      = monitoramentoData.length;
  const hoje       = monitoramentoData.filter(m => m.ultimaAtualizacao.startsWith('Hoje')).length;
  const semUpdate  = monitoramentoData.filter(m => m.statusSync === 'sem-atualizacao').length;

  document.getElementById('mon-stats').innerHTML = `
    <div class="mon-stat mon-stat--alert">
      <div class="mon-stat__num">${novas}</div>
      <div class="mon-stat__label">Nova${novas !== 1 ? 's' : ''} intimaç${novas !== 1 ? 'ões' : 'ão'}</div>
    </div>
    <div class="mon-stat">
      <div class="mon-stat__num">${total}</div>
      <div class="mon-stat__label">Processos monitorados</div>
    </div>
    <div class="mon-stat">
      <div class="mon-stat__num">${hoje}</div>
      <div class="mon-stat__label">Atualizados hoje</div>
    </div>
    <div class="mon-stat">
      <div class="mon-stat__num">${semUpdate}</div>
      <div class="mon-stat__label">Sem atualização +7 dias</div>
    </div>
  `;
}

// ---------- TABELA MONITORAMENTO ----------
function renderMonitoramento() {
  const lista = filtroAtivo === 'todos'
    ? monitoramentoData
    : monitoramentoData.filter(m => {
        if (filtroAtivo === 'intimacao')      return m.statusSync === 'intimacao';
        if (filtroAtivo === 'sem-atualizacao') return m.statusSync === 'sem-atualizacao';
        return true;
      });

  const tbody = document.getElementById('mon-tbody');

  if (!lista.length) {
    tbody.innerHTML = '<div class="empty-state"><p>Nenhum processo encontrado para este filtro.</p></div>';
    return;
  }

  tbody.innerHTML = lista.map(m => {
    const dotCls = m.tipoAtualizacao === 'alert' ? 'status-dot--alert'
                 : m.tipoAtualizacao === 'old'   ? 'status-dot--warn'
                 : 'status-dot--ok';

    const updateCls = m.tipoAtualizacao === 'alert' ? 'update-warn'
                    : m.tipoAtualizacao === 'old'   ? 'update-old'
                    : 'update-ok';

    const statusHTML = m.statusSync === 'intimacao'
      ? `<span class="intim-badge">
           <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="11" height="11"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg>
           Nova intimação
         </span>`
      : m.statusSync === 'sem-atualizacao'
      ? `<span class="sync-warn">Verificar</span>`
      : `<span class="sync-ok">
           <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
           Atualizado
         </span>`;

    return `
      <div class="mon-row" onclick="window.location.href='processo-detalhe.html?id=${m.processoId}'">
        <div class="proc-identity">
          <div class="status-dot ${dotCls}"></div>
          <div>
            <div class="proc-name">${m.processo}</div>
            <div class="proc-num">${m.numero}</div>
          </div>
        </div>
        <div class="mon-cell">${m.tribunal}</div>
        <div class="${updateCls}">${m.ultimaAtualizacao}</div>
        <div class="mon-cell">${m.andamentos} andamentos</div>
        <div>${statusHTML}</div>
        <div><button class="btn-ver" onclick="event.stopPropagation()">Ver</button></div>
      </div>`;
  }).join('');
}

// ---------- FILTROS ----------
document.querySelectorAll('.mon-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mon-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtroAtivo = btn.dataset.filter;
    renderMonitoramento();
  });
});

// ---------- INTIMAÇÕES ----------
function renderIntimacoes() {
  const lista = document.getElementById('intimacoes-lista');
  lista.innerHTML = `<div class="intim-list">${intimacoesData.map(intim => intimacaoHTML(intim)).join('')}</div>`;

  // Bind botões
  lista.querySelectorAll('.btn-marcar').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      marcarLida(id);
    });
  });

  lista.querySelectorAll('.intim-card-header').forEach(h => {
    h.addEventListener('click', () => toggleIntimacao(h));
  });

  lista.querySelectorAll('.btn-prazo').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      Toast.show('Prazo adicionado à agenda!', 'success');
    });
  });
}

function intimacaoHTML(intim) {
  const isExpandida = expandidas.has(intim.id);
  const cls = intim.lida ? 'intim-card--lida' : 'intim-card--nova';
  const iconCls = intim.lida ? 'intim-icon--lida' : 'intim-icon--nova';
  const badgeHTML = intim.lida
    ? '<span class="badge-lida">Lida</span>'
    : '<span class="badge-nova">Nova</span>';

  return `
    <div class="intim-card ${cls}" id="intim-${intim.id}">
      <div class="intim-card-header">
        <div class="intim-left">
          <div class="intim-icon ${iconCls}">
            <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              ${!intim.lida ? '<path d="M13.73 21a2 2 0 0 1-3.46 0"/>' : ''}
            </svg>
          </div>
          <div>
            <div class="intim-title">${intim.titulo}</div>
            <div class="intim-sub">${intim.sub}</div>
          </div>
        </div>
        <div class="intim-meta">
          <span class="intim-time">${intim.tempo}</span>
          ${badgeHTML}
        </div>
      </div>
      <div class="intim-body" style="display:${isExpandida ? 'block' : 'none'}">
        <div class="intim-text">${intim.texto}</div>
        <div class="intim-actions">
          ${intim.btnPrazo ? `<button class="btn-prazo">${intim.btnPrazo}</button>` : ''}
          <button class="btn-marcar" data-id="${intim.id}">
            ${intim.lida ? 'Reabrir' : 'Marcar como lida'}
          </button>
        </div>
      </div>
    </div>`;
}

function toggleIntimacao(header) {
  const card  = header.closest('.intim-card');
  const body  = card.querySelector('.intim-body');
  const id    = Number(card.id.replace('intim-', ''));
  const aberta = body.style.display !== 'none';
  body.style.display = aberta ? 'none' : 'block';
  if (aberta) expandidas.delete(id); else expandidas.add(id);
}

function marcarLida(id) {
  const intim = intimacoesData.find(i => i.id === id);
  if (!intim) return;
  intim.lida = !intim.lida;

  const novas = intimacoesData.filter(i => !i.lida).length;
  const badge = document.getElementById('tab-badge');
  if (badge) badge.textContent = novas;
  const badgeSidebar = document.getElementById('badge-intimacoes');
  if (badgeSidebar) badgeSidebar.textContent = novas;

  renderIntimacoes();
  renderStats();
  Toast.show(intim.lida ? 'Intimação marcada como lida.' : 'Intimação reaberta.', 'info');
}

// ---------- SINCRONIZAR ----------
document.getElementById('btn-sync').addEventListener('click', function() {
  const btn = this;
  btn.innerHTML = 'Sincronizando...';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = `
      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
        <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
      Sincronizar`;
    btn.disabled = false;
    document.querySelector('.topbar__sub').textContent = 'Última sincronização: agora';
    Toast.show('Sincronização concluída!', 'success');
  }, 2000);
});

// ---------- IMPORTAR ----------
const placeholders = {
  oab: 'SP 123.456',
  cpf: '000.000.000-00 ou 00.000.000/0001-00',
  cnj: '0000000-00.0000.0000.0.00.0000',
};

document.getElementById('import-type').addEventListener('change', function() {
  document.getElementById('import-input').placeholder = placeholders[this.value];
  document.getElementById('import-input').value = '';
  document.getElementById('import-resultado').innerHTML = '';
});

document.getElementById('btn-buscar').addEventListener('click', buscarProcessos);
document.getElementById('import-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') buscarProcessos();
});

function buscarProcessos() {
  const tipo  = document.getElementById('import-type').value;
  const valor = document.getElementById('import-input').value.trim();
  const res   = document.getElementById('import-resultado');

  if (!valor) {
    Toast.show('Digite um valor para buscar.', 'error');
    return;
  }

  res.innerHTML = `
    <div class="import-results">
      <div class="loading-wrap">
        <div class="spinner"></div>
        <p>Consultando tribunais...</p>
      </div>
    </div>`;

  setTimeout(() => {
    const lista = buscaSimulada[tipo] || buscaSimulada.oab;
    renderResultados(lista, tipo, valor);
  }, 1800);
}

function renderResultados(lista, tipo, valor) {
  const res = document.getElementById('import-resultado');
  const checados = lista.filter(p => p.checked).length;

  res.innerHTML = `
    <div class="import-results">
      <div class="ir-header">
        <h4>Processos encontrados</h4>
        <span>${lista.length} processos · ${tipo.toUpperCase()} ${valor}</span>
      </div>
      ${lista.map((p, i) => `
        <div class="ir-row">
          <div class="ir-check${p.checked ? ' checked' : ''}" data-index="${i}" onclick="toggleCheck(this, ${i})"></div>
          <div class="ir-info">
            <div class="ir-num">${p.num}</div>
            <div class="ir-tipo">${p.tipo}</div>
          </div>
          <div class="ir-meta">
            <span class="ir-tribunal">${p.tribunal}</span>
            <span class="pill ${p.statusCls}">${p.status}</span>
          </div>
        </div>`).join('')}
      <div class="ir-footer">
        <span id="sel-count">${checados} de ${lista.length} selecionados</span>
        <button class="btn btn--primary btn--sm" onclick="importar()">Importar selecionados</button>
      </div>
    </div>`;
}

function toggleCheck(el, index) {
  el.classList.toggle('checked');
  const total = document.querySelectorAll('.ir-check').length;
  const sel   = document.querySelectorAll('.ir-check.checked').length;
  const span  = document.getElementById('sel-count');
  if (span) span.textContent = `${sel} de ${total} selecionados`;
}

function importar() {
  const sel = document.querySelectorAll('.ir-check.checked').length;
  if (!sel) { Toast.show('Selecione ao menos um processo.', 'error'); return; }

  document.getElementById('import-resultado').innerHTML = `
    <div class="import-success">
      <div class="import-success__icon">✓</div>
      <div class="import-success__title">${sel} processo${sel > 1 ? 's' : ''} importado${sel > 1 ? 's' : ''} com sucesso!</div>
      <div class="import-success__sub">O monitoramento automático foi ativado. Você será notificado sobre novas intimações e andamentos.</div>
    </div>`;

  Toast.show(`${sel} processo${sel > 1 ? 's' : ''} importado${sel > 1 ? 's' : ''}!`, 'success');
}

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  renderStats();
  renderMonitoramento();
  renderIntimacoes();
  Notifications.init('btn-notificacoes');
});