// ============================================================
// NS Advocacia — Store
// Busca dados reais do backend e atualiza a UI
// ============================================================

const Store = (() => {

  // Cache local para evitar múltiplas requisições
  let _cache = {
    processos: null,
    clientes:  null,
    agenda:    null,
    dashboard: null,
  };

  async function carregarDashboard() {
    try {
      const dados = await Api.get('/dashboard');
      if (!dados) return;

      _cache.dashboard  = dados;
      _cache.processos  = dados.metricas.processosAtivos;
      _cache.clientes   = dados.metricas.totalClientes;
      _cache.agenda     = dados.metricas.prazosProximos;

      _atualizarUI(dados);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    }
  }

  function get(key) {
    return _cache[key] ?? 0;
  }

  function _atualizarUI(dados) {
    const m = dados.metricas;

    // Badge da sidebar — processos
    const badgeSidebar = document.querySelector('.nav-item[data-page="processos"] .badge');
    if (badgeSidebar) badgeSidebar.textContent = m.processosAtivos;

    // Badge da sidebar — agenda (prazos)
    const badgeAgenda = document.querySelector('.nav-item[data-page="agenda"] .badge');
    if (badgeAgenda) badgeAgenda.textContent = m.prazosProximos;

    // Stat cards do dashboard
    const statNums = document.querySelectorAll('.stat-num');
    if (statNums[0]) statNums[0].textContent = m.processosAtivos;
    if (statNums[1]) statNums[1].textContent = m.prazosProximos;
    if (statNums[2]) statNums[2].textContent = m.totalClientes;
    if (statNums[3]) {
      const valor = m.receitaMes >= 1000
        ? `R$ ${(m.receitaMes / 1000).toFixed(0)}k`
        : `R$ ${m.receitaMes.toFixed(0)}`;
      statNums[3].textContent = valor;
    }

    // Nome do usuário na topbar e sidebar
    const usuario = Auth.getUsuario();
    if (usuario) {
      const greeting = document.querySelector('.topbar__greeting em');
      if (greeting) greeting.textContent = usuario.nome.split(' ')[0];

      const sidebarNome = document.querySelector('.sidebar-user__name');
      if (sidebarNome) sidebarNome.textContent = usuario.nome;

      const sidebarCargo = document.querySelector('.sidebar-user__role');
      if (sidebarCargo) sidebarCargo.textContent = _formatarCargo(usuario.cargo);

      const avatar = document.querySelector('.sidebar-footer .avatar');
      if (avatar) avatar.textContent = _iniciais(usuario.nome);
    }
  }

  function _formatarCargo(cargo) {
    const map = {
      ADMIN:      'Administrador',
      ADVOGADO:   'Advogado(a)',
      ESTAGIARIO: 'Estagiário(a)',
      SECRETARIO: 'Secretário(a)',
    };
    return map[cargo] || cargo;
  }

  function _iniciais(nome) {
    return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  return { get, carregarDashboard };
})();
