// ============================================================
// NS Advocacia — Render (Dashboard)
// Renderiza a tabela de processos recentes no dashboard
// ============================================================

function renderProcessos(lista) {
  const tbody = document.getElementById("processos-table");
  if (!tbody) return;

  if (!lista || lista.length === 0) {
    tbody.innerHTML = `<div style="padding:24px 20px;text-align:center;color:var(--text-faint);font-size:13px;">Nenhum processo encontrado.</div>`;
    return;
  }

  tbody.innerHTML = lista.map((p) => {
    const s = statusMap[p.status] || statusMap["Em andamento"];
    return `
      <div class="table-row" data-id="${p.id}">
        <div>
          <div class="proc-name">${p.tipo || p.titulo || '—'}</div>
          <div class="proc-num">${p.numero || p.num || '—'}</div>
        </div>
        <div class="client-name">${p.cliente || '—'}</div>
        <div><span class="status-pill ${s.cls}">${s.label}</span></div>
        <div class="prazo-cell ${p.prazoUrgente ? "prazo-cell--urgent" : ""}">${p.prazo || '—'}</div>
        <div><button class="btn-abrir" data-id="${p.id}">Abrir</button></div>
      </div>
    `;
  }).join("");

  tbody.querySelectorAll(".btn-abrir").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      window.location.href = `pages/processo-detalhe.html?id=${id}`;
    });
  });
}
