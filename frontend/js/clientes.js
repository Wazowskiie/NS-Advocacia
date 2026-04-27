// ============================================================
// NS Advocacia — Clientes
// ============================================================

let selectedId = null;
let sortCol = null;
let sortDir = 1;

// ---------- RENDER TABELA ----------
function renderTabela(lista) {
  const tbody = document.getElementById("cli-tbody");
  const count = document.getElementById("cli-count");

  if (!lista.length) {
    tbody.innerHTML = `
      <div class="empty-state">
        <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
        <p>Nenhum cliente encontrado para os filtros aplicados.</p>
      </div>`;
    count.textContent = "0 clientes encontrados";
    return;
  }

  tbody.innerHTML = `<div class="cli-tbody-scroll">${lista.map(c => rowHTML(c)).join("")}</div>`;

  tbody.querySelectorAll(".cli-row").forEach(row => {
    row.addEventListener("click", () => abrirPainel(row.dataset.id));
  });
  tbody.querySelectorAll(".btn-ver").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      abrirPainel(btn.dataset.id);
    });
  });

  const n = lista.length;
  count.textContent = `${n} cliente${n !== 1 ? "s" : ""} encontrado${n !== 1 ? "s" : ""}`;
}

function rowHTML(c) {
  const tipoKey = c.tipo === 'PESSOA_JURIDICA' ? 'PJ' : 'PF';
  const t = tipoMap[tipoKey] || tipoMap['PF'];
  return `
    <div class="cli-row${selectedId === c.id ? " selected" : ""}" data-id="${c.id}">
      <div class="cli-identity">
        <div class="cli-avatar" style="background:${c.cor}">${c.iniciais}</div>
        <div>
          <div class="cli-name">${c.nome}${c.vip ? ' <span class="badge-tipo badge-vip">VIP</span>' : ""}</div>
          <div class="cli-email">${c.email}</div>
        </div>
      </div>
      <div class="cli-cell">${c.telefone}</div>
      <div><span class="badge-tipo ${t.cls}">${t.label}</span></div>
      <div class="cli-cell">${c.resp}</div>
      <div class="cli-cell">${c.valor}</div>
      <div class="cli-num">${c.processos}</div>
      <button class="btn-ver" onclick="window.location.href='cliente-detalhe.html?id=${c.id}'">Ver</button>
    </div>`;
}

// ---------- PAINEL LATERAL ----------
function abrirPainel(id) {
  selectedId = id;
  const c = clientesData.find(x => String(x.id) === String(id));
  if (!c) return;
  const tipoKey = c.tipo === 'PESSOA_JURIDICA' ? 'PJ' : 'PF';
  const t = tipoMap[tipoKey] || tipoMap['PF'];

  document.getElementById("sp-empty").style.display = "none";

  const det = document.getElementById("sp-detail");
  det.innerHTML = `
    <div class="sp-header">
      <div class="sp-avatar-lg" style="background:${c.cor}">${c.iniciais}</div>
      <h3>${c.nome}</h3>
      <p class="sp-sub">${c.email}</p>
      <div class="sp-badges">
        <span class="badge-tipo ${t.cls}">${t.label}</span>
        ${c.vip ? '<span class="badge-tipo badge-vip">⭐ VIP</span>' : ""}
      </div>
    </div>
    <div class="sp-stats">
      <div class="sp-stat">
        <div class="sp-stat-num">${c.processos}</div>
        <div class="sp-stat-label">Processos</div>
      </div>
      <div class="sp-stat">
        <div class="sp-stat-num" style="font-size:${c.valor.length > 6 ? "13px" : "20px"}">${c.valor}</div>
        <div class="sp-stat-label">Em causa</div>
      </div>
    </div>
    <div class="sp-section">
      <h4>Contato</h4>
      <div class="sp-row"><span class="sp-label">Telefone</span><span class="sp-value">${c.telefone}</span></div>
      <div class="sp-row"><span class="sp-label">E-mail</span><span class="sp-value" style="font-size:11px">${c.email}</span></div>
      <div class="sp-row"><span class="sp-label">Documento</span><span class="sp-value">${c.doc}</span></div>
      <div class="sp-row"><span class="sp-label">Endereço</span><span class="sp-value" style="font-size:10.5px">${c.endereco}</span></div>
    </div>
    <div class="sp-section">
      <h4>Escritório</h4>
      <div class="sp-row"><span class="sp-label">Responsável</span><span class="sp-value">${c.resp}</span></div>
      <div class="sp-row"><span class="sp-label">Cliente desde</span><span class="sp-value">${c.desde}</span></div>
    </div>
    <div class="sp-actions">
      <button class="btn btn--primary" onclick="window.location.href='cliente-detalhe.html?id=${c.id}'">Ver perfil completo</button>
      <button class="btn btn--secondary">Novo processo</button>
    </div>`;

  aplicarFiltros();
}

// ---------- FILTROS ----------
function aplicarFiltros() {
  const q    = document.getElementById("f-busca").value.toLowerCase().trim();
  // ✅ Corrigido: usa f-tipo (barra de filtros) não f-tipo-modal (modal de criação)
  const tipoVal = document.getElementById("f-tipo").value;
  const vip  = document.getElementById("f-vip").value;
  const resp = document.getElementById("f-responsavel").value;

  let lista = clientesData.filter(c => {
    if (q && !c.nome.toLowerCase().includes(q) &&
            !c.email.toLowerCase().includes(q) &&
            !c.telefone.includes(q)) return false;
    if (tipoVal) {
      // f-tipo usa valores PESSOA_FISICA / PESSOA_JURIDICA
      const tipoCliente = c.tipo === 'PJ' ? 'PESSOA_JURIDICA' : 'PESSOA_FISICA';
      if (tipoCliente !== tipoVal) return false;
    }
    if (vip === "vip" && !c.vip) return false;
    if (resp && c.resp !== resp) return false;
    return true;
  });

  if (sortCol) {
    lista = [...lista].sort((a, b) => {
      const av = String(a[sortCol] ?? "").toLowerCase();
      const bv = String(b[sortCol] ?? "").toLowerCase();
      return av < bv ? -sortDir : av > bv ? sortDir : 0;
    });
  }

  renderTabela(lista);
}

function limparFiltros() {
  document.getElementById("f-busca").value       = "";
  document.getElementById("f-tipo").value        = ""; // ✅ corrigido
  document.getElementById("f-vip").value         = "";
  document.getElementById("f-responsavel").value = "";
  aplicarFiltros();
}

async function carregarEAplicar() {
  await carregarClientesData();
  aplicarFiltros();
}

// ---------- MODAL NOVO CLIENTE ----------
const overlay   = document.getElementById("modal-overlay");
const btnNovo   = document.getElementById("btn-novo");
const btnClose  = document.getElementById("modal-close");
const btnCancel = document.getElementById("modal-cancel");
const btnSave   = document.getElementById("modal-save");

function abrirModal()  { overlay.classList.add("active"); document.getElementById("f-nome").focus(); }
function fecharModal() { overlay.classList.remove("active"); limparModal(); }

function limparModal() {
  ["f-nome","f-telefone","f-email","f-doc","f-endereco"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("f-tipo-modal").value = "PF";
  const vipCheck = document.getElementById("f-vip-modal");
  if (vipCheck) vipCheck.checked = false;
}

async function salvarCliente() {
  const nome     = document.getElementById("f-nome").value.trim();
  const telefone = document.getElementById("f-telefone").value.trim();
  const email    = document.getElementById("f-email").value.trim();
  const cpfCnpj  = document.getElementById("f-doc").value.trim();
  const endereco = document.getElementById("f-endereco").value.trim();
  const tipoRaw  = document.getElementById("f-tipo-modal").value;

  // Converte PF/PJ para o formato que o backend espera
  const tipo = tipoRaw === 'PJ' ? 'PESSOA_JURIDICA' : 'PESSOA_FISICA';

  if (!nome) {
    Toast.show('Preencha o nome do cliente.', 'error');
    return;
  }

  btnSave.disabled = true;
  btnSave.textContent = 'Salvando...';

  try {
    await criarClienteAPI({
      nome,
      tipo,
      telefone:  telefone  || undefined,
      email:     email     || undefined,
      cpfCnpj:   cpfCnpj   || undefined,
      endereco:  endereco  || undefined,
    });

    Toast.show('Cliente cadastrado com sucesso!', 'success');
    fecharModal();
    await carregarEAplicar();
  } catch (err) {
    Toast.show(err.message || 'Erro ao salvar cliente.', 'error');
  } finally {
    btnSave.disabled = false;
    btnSave.textContent = 'Salvar Cliente';
  }
}

// ---------- ORDENAÇÃO ----------
document.querySelectorAll(".cli-table-head span[data-col]").forEach(th => {
  th.addEventListener("click", () => {
    const col = th.dataset.col;
    sortDir = sortCol === col ? sortDir * -1 : 1;
    sortCol = col;
    document.querySelectorAll(".cli-table-head span").forEach(s => s.classList.remove("sorted"));
    th.classList.add("sorted");
    aplicarFiltros();
  });
});

btnNovo.addEventListener("click", abrirModal);
btnClose.addEventListener("click", fecharModal);
btnCancel.addEventListener("click", fecharModal);
btnSave.addEventListener("click", salvarCliente);
overlay.addEventListener("click", e => { if (e.target === overlay) fecharModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") fecharModal(); });
document.getElementById("btn-limpar").addEventListener("click", limparFiltros);
document.getElementById("f-busca").addEventListener("input", aplicarFiltros);
document.getElementById("f-tipo").addEventListener("change", aplicarFiltros);
document.getElementById("f-vip").addEventListener("change", aplicarFiltros);
document.getElementById("f-responsavel").addEventListener("change", aplicarFiltros);

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
  Auth.exigirLogin();
  await carregarEAplicar();
  if (typeof Notifications !== 'undefined') {
    Notifications.init('btn-notificacoes');
  }
});
