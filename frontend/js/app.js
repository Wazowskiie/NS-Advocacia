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
