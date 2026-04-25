// ============================================================
// NS Advocacia — API Client
// Centraliza todas as chamadas ao backend
// ============================================================

const API_URL = 'https://nsjuridico.com/api'; // ← troque pelo IP da sua VPS

const Api = (() => {

  function getToken() {
    return localStorage.getItem('ns_token');
  }

  async function request(method, path, body = null) {
    const token = getToken();

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(body && { body: JSON.stringify(body) }),
    };

    const res = await fetch(`${API_URL}${path}`, options);

    // Token expirado — redireciona pro login
    if (res.status === 401) {
      if (!path.includes('/auth/login')) {
        Auth.logout();
      }
      return null;
    }

if (!res.ok) {
  const err = await res.json().catch(() => ({}));
  throw new Error(err.error || 'Erro na requisição');
}

return res.json();
  }

  return {
    get:    (path)         => request('GET',    path),
    post:   (path, body)   => request('POST',   path, body),
    put:    (path, body)   => request('PUT',    path, body),
    patch:  (path, body)   => request('PATCH',  path, body),
    delete: (path)         => request('DELETE', path),
  };
})();
