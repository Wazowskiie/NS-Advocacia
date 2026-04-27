// ============================================================
// NS Advocacia — App (Dashboard)
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {

  // 1. Protege a rota
  Auth.exigirLogin();

  // 2. Preenche sidebar com dados do usuário logado
  const usuario = Auth.getUsuario();
  if (usuario) {
    const iniciais = usuario.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const elAvatar   = document.getElementById('sidebar-avatar');
    const elNome     = document.getElementById('sidebar-nome');
    const elCargo    = document.getElementById('sidebar-cargo');
    const elGreeting = document.querySelector('.topbar__greeting em');
    if (elAvatar)   elAvatar.textContent   = iniciais;
    if (elNome)     elNome.textContent     = usuario.nome;
    if (elCargo)    elCargo.textContent    = _formatarCargo(usuario.cargo);
    if (elGreeting) elGreeting.textContent = usuario.nome.split(' ')[0];
  }

  // 3. Carrega métricas do dashboard
  await Store.carregarDashboard();

  // 4. Carrega processos recentes
  const lista = await carregarProcessos({ status: 'ATIVO' });
  renderProcessos(lista.slice(0, 5));

  // 5. Busca local nos processos carregados
  document.getElementById('search-input').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      renderProcessos(processos.slice(0, 5));
      return;
    }
    const filtered = processos.filter(p =>
      (p.tipo  || '').toLowerCase().includes(q) ||
      (p.cliente || '').toLowerCase().includes(q) ||
      (p.numero || '').toLowerCase().includes(q)
    );
    renderProcessos(filtered);
  });

  // 6. Notificações
  if (typeof Notifications !== 'undefined') {
    Notifications.init('btn-notificacoes');
  }

  // 7. Botão de logout
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.addEventListener('click', Auth.logout);

  // 8. Carrega agenda do dia
  _carregarAgendaHoje();

  // 9. Carrega equipe
  _carregarEquipe();
});

async function _carregarAgendaHoje() {
  const container = document.getElementById('dashboard-agenda-list');
  if (!container) return;
  try {
    const hoje = new Date().toISOString().split('T')[0];
    const eventos = await Api.get(`/eventos?inicio=${hoje}&fim=${hoje}`);
    if (!eventos || !eventos.length) {
      container.innerHTML = '<p style="color:#aaa;text-align:center;padding:16px;">Nenhum evento hoje.</p>';
      return;
    }
    container.innerHTML = eventos.map(ev => {
      const ini = new Date(ev.dataInicio);
      const hora = `${ini.getHours()}h${ini.getMinutes().toString().padStart(2,'0')}`;
      return `
        <div class="agenda-item">
          <div class="agenda-hora">${hora}</div>
          <div class="agenda-info">
            <div class="agenda-titulo">${ev.titulo}</div>
            ${ev.descricao ? `<div class="agenda-sub">${ev.descricao}</div>` : ''}
          </div>
        </div>`;
    }).join('');
  } catch (e) {
    container.innerHTML = '<p style="color:#aaa;text-align:center;padding:16px;">Nenhum evento hoje.</p>';
  }
}

async function _carregarEquipe() {
  const container = document.getElementById('equipe-list');
  if (!container) return;
  try {
    const membros = await Api.get('/usuarios');
    if (!membros || !membros.length) {
      container.innerHTML = '<p style="color:#aaa;text-align:center;padding:16px;">Nenhum membro cadastrado.</p>';
      return;
    }
    container.innerHTML = membros.map(m => {
      const iniciais = m.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      return `
        <div class="equipe-item">
          <div class="avatar avatar--sm">${iniciais}</div>
          <div class="equipe-info">
            <div class="equipe-nome">${m.nome}</div>
            <div class="equipe-cargo">${_formatarCargo(m.cargo)}</div>
          </div>
        </div>`;
    }).join('');
  } catch (e) {
    container.innerHTML = '<p style="color:#aaa;text-align:center;padding:16px;">Carregando equipe...</p>';
  }
}

function _formatarCargo(cargo) {
  const map = {
    ADMIN:      'Administrador',
    ADVOGADO:   'Advogado(a)',
    ESTAGIARIO: 'Estagiário(a)',
    SECRETARIO: 'Secretário(a)',
  };
  return map[cargo] || cargo || 'Advogado';
}
