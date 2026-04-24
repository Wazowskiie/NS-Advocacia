// ============================================================
// NS Advocacia — App (Dashboard)
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {

  // 1. Protege a rota — redireciona pro login se não estiver logado
  Auth.exigirLogin();

  // 2. Carrega métricas do dashboard (atualiza cards e badges)
  await Store.carregarDashboard();

  // 3. Carrega e renderiza processos recentes
  const lista = await carregarProcessos({ status: 'ATIVO' });
  renderProcessos(lista.slice(0, 5)); // mostra só os 5 mais recentes

  // 4. Busca local nos processos carregados
  document.getElementById('search-input').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) { renderProcessos(processos.slice(0, 5)); return; }
    const filtered = processos.filter(
      (p) =>
        p.tipo.toLowerCase().includes(q) ||
        p.cliente.toLowerCase().includes(q) ||
        p.numero.toLowerCase().includes(q)
    );
    renderProcessos(filtered);
  });

  // 5. Notificações
  Notifications.init('btn-notificacoes');

  // 6. Botão de logout (se existir na página)
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.addEventListener('click', Auth.logout);
});

// Preenche sidebar com dados do usuário logado
const usuario = Auth.getUsuario();
if (usuario) {
  const iniciais = usuario.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const el = document.getElementById('sidebar-avatar');
  const elNome = document.getElementById('sidebar-nome');
  const elCargo = document.getElementById('sidebar-cargo');
  const elGreeting = document.querySelector('.topbar__greeting em');
  if (el) el.textContent = iniciais;
  if (elNome) elNome.textContent = usuario.nome;
  if (elCargo) elCargo.textContent = usuario.cargo || 'Advogado';
  if (elGreeting) elGreeting.textContent = usuario.nome.split(' ')[0];
}
