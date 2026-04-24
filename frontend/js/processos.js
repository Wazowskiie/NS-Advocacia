let selectedId = null;
let sortCol = null;
let sortDir = 1;

// ---------- RENDER TABELA ----------
function renderTabela(lista) {
  const tbody = document.getElementById("proc-tbody");
  const count = document.getElementById("proc-count");

  if (!lista.length) {
    tbody.innerHTML = `
      <div class="empty-state">
        <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <p>Nenhum processo encontrado para os filtros aplicados.</p>
      </div>`;
    count.textContent = "0 processos encontrados";
    return;
  }

  tbody.innerHTML = `<div class="proc-tbody-scroll">${lista.map(p => rowHTML(p)).join("")}</div>`;

  // Bind cliques nas linhas
  tbody.querySelectorAll(".proc-row").forEach(row => {
    row.addEventListener("click", () => abrirPainel(Number(row.dataset.id)));
  });

  // Bind botões "Ver"
  tbody.querySelectorAll(".btn-ver").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      abrirPainel(Number(btn.dataset.id));
    });
  });

  tbody.querySelectorAll('.btn-excluir').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const id = Number(btn.dataset.id);
    const proc = processosData.find(p => p.id === id);
    if (!proc) return;
    Confirm.show(
      'Excluir processo?',
      `O processo "${proc.tipo}" de ${proc.cliente} será removido permanentemente.`,
      () => {
        const idx = processosData.findIndex(p => p.id === id);
        if (idx > -1) processosData.splice(idx, 1);
        Store.decrement('processos');
        Toast.show('Processo excluído.', 'warning');
        aplicarFiltros();
      }
    );
  });
});

  const n = lista.length;
  count.textContent = `${n} processo${n !== 1 ? "s" : ""} encontrado${n !== 1 ? "s" : ""}`;
}

function rowHTML(p) {
  const s = statusMap[p.status];
  const numCurto = p.num.length > 18 ? p.num.substring(0, 18) + "…" : p.num;
  return `
    <div class="proc-row${selectedId === p.id ? " selected" : ""}" data-id="${p.id}">
      <div>
        <div class="proc-num-main">${numCurto}</div>
      </div>
      <div class="proc-cell">${p.tipo}</div>
      <div class="proc-cell">${p.cliente}</div>
      <div class="proc-cell">${p.resp.split(" ")[0]}</div>
      <div><span class="status-pill ${s.cls}">${s.label}</span></div>
      <div class="proc-prazo${p.prazoUrgente ? " proc-prazo--urgent" : ""}">${p.prazo}</div>
      <div class="proc-vara">${p.vara}</div>
      <button class="btn-ver" onclick="window.location.href='processo-detalhe.html?id=${p.id}'">Abrir</button>
    </div>`;
}

// ---------- PAINEL LATERAL ----------
function abrirPainel(id) {
  selectedId = id;
  const p = processosData.find(x => x.id === id);
  const s = statusMap[p.status];

  document.getElementById("sp-empty").style.display = "none";

  const det = document.getElementById("sp-detail");
  det.innerHTML = `
    <div class="sp-header">
      <h3>${p.tipo}</h3>
      <p class="sp-cliente">${p.cliente}</p>
      <div class="sp-pill">
        <span class="status-pill ${s.cls}">${s.label}</span>
      </div>
    </div>

    <div class="sp-section">
      <h4>Dados do Processo</h4>
      <div class="sp-row">
        <span class="sp-label">Número</span>
        <span class="sp-value sp-value--num">${p.num}</span>
      </div>
      <div class="sp-row">
        <span class="sp-label">Ajuizamento</span>
        <span class="sp-value">${p.ajuizamento}</span>
      </div>
      <div class="sp-row">
        <span class="sp-label">Vara / Tribunal</span>
        <span class="sp-value">${p.vara}</span>
      </div>
      <div class="sp-row">
        <span class="sp-label">Fase</span>
        <span class="sp-value">${p.fase}</span>
      </div>
    </div>

    <div class="sp-section">
      <h4>Responsável & Financeiro</h4>
      <div class="sp-row">
        <span class="sp-label">Responsável</span>
        <span class="sp-value">${p.resp}</span>
      </div>
      <div class="sp-row">
        <span class="sp-label">Prazo</span>
        <span class="sp-value${p.prazoUrgente ? " sp-value--urgent" : ""}">${p.prazo}</span>
      </div>
      <div class="sp-row">
        <span class="sp-label">Valor da Causa</span>
        <span class="sp-value">${p.valor}</span>
      </div>
    </div>

    <div class="sp-actions">
      <button class="btn btn--primary">Abrir processo completo</button>
      <button class="btn btn--secondary">Adicionar andamento</button>
    </div>
  `;

  // Atualiza seleção visual na tabela
  aplicarFiltros();
}

// ---------- FILTROS ----------
function aplicarFiltros() {
  const q     = document.getElementById("f-busca").value.toLowerCase().trim();
  const st    = document.getElementById("f-status").value;
  const resp  = document.getElementById("f-responsavel").value;
  const prazo = document.getElementById("f-prazo").value;

  let lista = processosData.filter(p => {
    if (q && !p.num.toLowerCase().includes(q) &&
            !p.tipo.toLowerCase().includes(q) &&
            !p.cliente.toLowerCase().includes(q)) return false;
    if (st && p.status !== st) return false;
    if (resp && p.resp !== resp) return false;
    if (prazo === "hoje" && !p.prazoUrgente) return false;
    return true;
  });

  if (sortCol) {
    lista = [...lista].sort((a, b) => {
      const av = (a[sortCol] || "").toString().toLowerCase();
      const bv = (b[sortCol] || "").toString().toLowerCase();
      return av < bv ? -sortDir : av > bv ? sortDir : 0;
    });
  }

  renderTabela(lista);
  document.getElementById("total-label").textContent =
    `${lista.length} processo${lista.length !== 1 ? "s" : ""} ${q || st || resp || prazo ? "encontrados" : "ativos"}`;
}

function limparFiltros() {
  document.getElementById("f-busca").value = "";
  document.getElementById("f-status").value = "";
  document.getElementById("f-responsavel").value = "";
  document.getElementById("f-prazo").value = "";
  aplicarFiltros();
}

// ---------- ORDENAÇÃO ----------
document.querySelectorAll(".proc-table-head span[data-col]").forEach(th => {
  th.addEventListener("click", () => {
    const col = th.dataset.col;
    const colMap = { num: "num", tipo: "tipo", cliente: "cliente", resp: "resp", status: "status", prazo: "prazo", vara: "vara" };
    if (sortCol === colMap[col]) {
      sortDir *= -1;
    } else {
      sortCol = colMap[col];
      sortDir = 1;
    }
    document.querySelectorAll(".proc-table-head span").forEach(s => s.classList.remove("sorted"));
    th.classList.add("sorted");
    aplicarFiltros();
  });
});

// ---------- MODAL NOVO PROCESSO ----------
const overlay   = document.getElementById("modal-overlay");
const btnNovo   = document.getElementById("btn-novo");
const btnClose  = document.getElementById("modal-close");
const btnCancel = document.getElementById("modal-cancel");
const btnSave   = document.getElementById("modal-save");

function abrirModal()  { overlay.classList.add("active"); document.getElementById("f-tipo").focus(); }
function fecharModal() { overlay.classList.remove("active"); limparModal(); }

function limparModal() {
  ["f-tipo","f-numero","f-cliente","f-vara","f-valor","f-prazo-modal"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("f-status-modal").value = "Em andamento";
  document.getElementById("f-resp-modal").value = "Rafael Silva";
}

function salvarProcesso() {
  const tipo   = document.getElementById("f-tipo").value.trim();
  const num    = document.getElementById("f-numero").value.trim();
  const cliente = document.getElementById("f-cliente").value.trim();
  const resp   = document.getElementById("f-resp-modal").value;
  const status = document.getElementById("f-status-modal").value;
  const vara   = document.getElementById("f-vara").value.trim();
  const valor  = document.getElementById("f-valor").value.trim();
  const prazoRaw = document.getElementById("f-prazo-modal").value;

  if (!tipo || !cliente) {
    Toast.show('Preencha o Tipo de Ação e o Cliente.', 'error');

    // Após salvar com sucesso, antes do fecharModal():
    Toast.show('Processo salvo com sucesso!', 'success');
    return;
  }

  let prazo = "—";
  if (prazoRaw) {
    const [, m, d] = prazoRaw.split("-");
    const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    prazo = `${Number(d)} ${meses[Number(m) - 1]}`;
  }

  const novoId = processosData.length ? Math.max(...processosData.map(p => p.id)) + 1 : 1;
  processosData.unshift({
    id: novoId, num: num || "—", tipo, cliente, resp, status,
    prazo, prazoUrgente: false, vara: vara || "—",
    valor: valor || "—", fase: "Inicial",
    ajuizamento: new Date().toLocaleDateString("pt-BR"),
  });

  Store.increment('processos');
// Atualiza badge da sidebar
const badge = document.getElementById('badge-processos');
if (badge) badge.textContent = Store.get('processos');

Toast.show('Processo salvo com sucesso!', 'success');

  document.getElementById("badge-processos").textContent = processosData.length;
  fecharModal();
  aplicarFiltros();
}

btnNovo.addEventListener("click", abrirModal);
btnClose.addEventListener("click", fecharModal);
btnCancel.addEventListener("click", fecharModal);
btnSave.addEventListener("click", salvarProcesso);
overlay.addEventListener("click", e => { if (e.target === overlay) fecharModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") fecharModal(); });
document.getElementById("btn-limpar").addEventListener("click", limparFiltros);
document.getElementById("f-busca").addEventListener("input", aplicarFiltros);
document.getElementById("f-status").addEventListener("change", aplicarFiltros);
document.getElementById("f-responsavel").addEventListener("change", aplicarFiltros);
document.getElementById("f-prazo").addEventListener("change", aplicarFiltros);

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => aplicarFiltros())
Notifications.init('btn-notificacoes');