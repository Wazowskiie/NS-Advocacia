// ============================================================
// NS Advocacia — Auth
// Gerencia login, logout e proteção de rotas
// ============================================================

const Auth = (() => {

  const TOKEN_KEY   = 'ns_token';
  const USUARIO_KEY = 'ns_usuario';

  function salvarSessao(token, usuario) {
    localStorage.setItem(TOKEN_KEY,   token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    window.location.href = 'login.html';

  }

  function getUsuario() {
    const u = localStorage.getItem(USUARIO_KEY);
    return u ? JSON.parse(u) : null;
  }

  function estaLogado() {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  // Chame no topo de cada página protegida
  function exigirLogin() {
    if (!estaLogado()) {
      window.location.href = 'login.html';

    }
  }

  async function login(email, senha) {
    const dados = await Api.post('/auth/login', { email, senha });
    if (dados) {
      salvarSessao(dados.token, dados.usuario);
    }
    return dados;
  }

  return { login, logout, getUsuario, estaLogado, exigirLogin };
})();
