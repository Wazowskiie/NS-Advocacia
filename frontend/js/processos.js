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

  tbody.querySelectorAll(".proc-row").forEach(row => {
    row.addEventListener("click", () => abrirPainel(row.dataset.id));
  });

  tbody.querySelectorAll(".btn-ver").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      window.location.href = `processo-detalhe.html?id=${btn.dataset.id}`;
    });
  });

  tbody.querySelectorAll('.btn-excluir').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const proc = processosData.find(p => String(p.id) === String(id));
      confirmarExclusao(id, proc);
    });
  });

  const n = lista.length;
  count.textContent = `${n} processo${n !== 1 ? "s" : ""} encontrado${n !== 1 ? "s" : ""}`;
}

function rowHTML(p) {
  const s = statusMap[p.status] || { cls: 'pill--progress', label: p.status };
  const numCurto = (p.num || '—').length > 18 ? p.num.substring(0, 18) + "…" : (p.num || '—');
  return `
    <div class="proc-row${selectedId === p.id ? " selected" : ""}" data-id="${p.id}">
      <div><div class="proc-num-main">${numCurto}</div></div>
      <div class="proc-cell">${p.tipo}</div>
      <div class="proc-cell">${p.cliente}</div>
      <div class="proc-cell">${p.resp ? p.resp.split(" ")[0] : '—'}</div>
      <div><span class="status-pill ${s.cls}">${s.label}</span></div>
      <div class="proc-prazo${p.prazoUrgente ? " proc-prazo--urgent" : ""}">${p.prazo}</div>
      <div class="proc-vara">${p.vara}</div>
      <div style="display:flex;gap:6px;align-items:center">
        <button class="btn-ver" data-id="${p.id}">Abrir</button>
        <button class="btn-excluir" data-id="${p.id}" style="font-size:11px;padding:4px 8px;border-radius:6px;border:0.5px solid #e8b4b0;background:#fdf0ef;color:#c0392b;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap">Excluir</button>
      </div>
    </div>`;
}

// ---------- CONFIRMAÇÃO DE EXCLUSÃO ----------
function confirmarExclusao(id, proc) {
  const existing = document.getElementById('confirm-excluir-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'confirm-excluir-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;z-index:2000';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:28px 28px 20px;width:360px;max-width:90vw;box-shadow:0 8px 32px rgba(0,0,0,0.18)">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <div style="width:36px;height:36px;border-radius:50%;background:#fdf0ef;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg width="16" height="16" fill="none" stroke="#c0392b" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </div>
        <div>
          <div style="font-size:14px;font-weight:500;color:#1c1c1a">Excluir processo?</div>
          <div style="font-size:12px;color:#9a9a94;margin-top:2px">${proc ? proc.tipo + ' · ' + proc.cliente : 'Esta ação não pode ser desfeita.'}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px">
        <button id="confirm-excluir-cancel" style="padding:8px 18px;border-radius:8px;border:0.5px solid rgba(0,0,0,0.14);background:transparent;color:#6b6b67;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif">Cancelar</button>
        <button id="confirm-excluir-ok" style="padding:8px 18px;border-radius:8px;border:none;background:#c0392b;color:#fff;font-size:13px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif">Excluir</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  document.getElementById('confirm-excluir-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.getElementById('confirm-excluir-ok').addEventListener('click', async () => {
    overlay.remove();
    try {
      await Api.delete(`/processos/${id}`);
      Toast.show('Processo excluído.', 'success');
      await carregarProcessosData();
      aplicarFiltros();
    } catch (err) {
      Toast.show('Erro ao excluir processo.', 'error');
    }
  });
}

// ---------- PAINEL LATERAL ----------
function abrirPainel(id) {
  selectedId = id;
  const p = processosData.find(x => String(x.id) === String(id));
  if (!p) return;
  const s = statusMap[p.status] || { cls: 'pill--progress', label: p.status };

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
      <div class="sp-row"><span class="sp-label">Número</span><span class="sp-value sp-value--num">${p.num}</span></div>
      <div class="sp-row"><span class="sp-label">Ajuizamento</span><span class="sp-value">${p.ajuizamento}</span></div>
      <div class="sp-row"><span class="sp-label">Vara / Tribunal</span><span class="sp-value">${p.vara}</span></div>
      <div class="sp-row"><span class="sp-label">Fase</span><span class="sp-value">${p.fase}</span></div>
    </div>
    <div class="sp-section">
      <h4>Responsável & Financeiro</h4>
      <div class="sp-row"><span class="sp-label">Responsável</span><span class="sp-value">${p.resp}</span></div>
      <div class="sp-row"><span class="sp-label">Prazo</span><span class="sp-value${p.prazoUrgente ? " sp-value--urgent" : ""}">${p.prazo}</span></div>
      <div class="sp-row"><span class="sp-label">Valor da Causa</span><span class="sp-value">${p.valor}</span></div>
    </div>
    <div class="sp-actions">
      <button class="btn btn--primary" onclick="window.location.href='processo-detalhe.html?id=${p.id}'">Abrir processo completo</button>
      <button class="btn btn--secondary">Adicionar andamento</button>
    </div>`;

  aplicarFiltros();
}

// ---------- FILTROS ----------
function aplicarFiltros() {
  const q     = document.getElementById("f-busca").value.toLowerCase().trim();
  const st    = document.getElementById("f-status").value;
  const resp  = document.getElementById("f-responsavel").value;
  const prazo = document.getElementById("f-prazo").value;

  let lista = processosData.filter(p => {
    if (q && !(p.num || '').toLowerCase().includes(q) &&
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

// ---------- CARREGAR CLIENTES NO SELECT ----------
async function carregarClientesSelect() {
  const select = document.getElementById("f-cliente");
  try {
    const clientes = await Api.get('/clientes');
    if (!clientes || !clientes.length) {
      select.innerHTML = '<option value="">Nenhum cliente cadastrado</option>';
      return;
    }
    select.innerHTML = '<option value="">Selecione um cliente</option>' +
      clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
  } catch (err) {
    console.error('Erro ao carregar clientes:', err);
    select.innerHTML = '<option value="">Erro ao carregar clientes</option>';
  }
}

// ---------- MODAL NOVO PROCESSO ----------
const overlay   = document.getElementById("modal-overlay");
const btnNovo   = document.getElementById("btn-novo");
const btnClose  = document.getElementById("modal-close");
const btnCancel = document.getElementById("modal-cancel");
const btnSave   = document.getElementById("modal-save");

function abrirModal() {
  overlay.classList.add("active");
  document.getElementById("f-tipo").focus();
}

function fecharModal() {
  overlay.classList.remove("active");
  limparModal();
}

function limparModal() {
  ["f-tipo","f-numero","f-vara","f-valor","f-comarca","f-prazo-modal"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const clienteSelect = document.getElementById("f-cliente");
  if (clienteSelect) clienteSelect.value = "";
  const statusModal = document.getElementById("f-status-modal");
  if (statusModal) statusModal.value = "ATIVO";
  const areaModal = document.getElementById("f-area");
  if (areaModal) areaModal.value = "TRABALHISTA";
}

async function salvarProcesso() {
  const titulo   = document.getElementById("f-tipo").value.trim();
  const numero   = document.getElementById("f-numero").value.trim();
  const cliente  = document.getElementById("f-cliente").value.trim();
  const area     = document.getElementById("f-area").value;
  const resp     = document.getElementById("f-resp-modal").value;
  const status   = document.getElementById("f-status-modal").value;
  const vara     = document.getElementById("f-vara").value.trim();
  const comarca  = document.getElementById("f-comarca").value.trim();
  const valor    = document.getElementById("f-valor").value.trim();
  const prazo    = document.getElementById("f-prazo-modal").value;

  if (!titulo) {
    Toast.show('Preencha o Tipo de Ação.', 'error');
    return;
  }
  if (!cliente) {
    Toast.show('Preencha o nome do cliente.', 'error');
    return;
  }
  if (!area) {
    Toast.show('Selecione a Área.', 'error');
    return;
  }

  btnSave.disabled = true;
  btnSave.textContent = 'Salvando...';

  try {
    const payload = {
      titulo,
      clienteNome: cliente,
      area,
      status,
      numero:     numero   || undefined,
      vara:       vara     || undefined,
      comarca:    comarca  || undefined,
      valorCausa: valor    ? Number(valor.replace(/\D/g, '')) : undefined,
      prazo:      prazo    || undefined,
    };

    const criado = await criarProcessoAPI(payload);

    if (criado) {
      await carregarProcessosData();
      aplicarFiltros();
      Toast.show('Processo salvo com sucesso!', 'success');
      fecharModal();
    } else {
      Toast.show('Erro ao salvar. Tente novamente.', 'error');
    }
  } catch (err) {
    console.error('Erro ao salvar processo:', err);
    Toast.show('Erro ao salvar. Verifique os dados.', 'error');
  } finally {
    btnSave.disabled = false;
    btnSave.textContent = 'Salvar Processo';
  }
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
document.addEventListener("DOMContentLoaded", async () => {
  Auth.exigirLogin();

  const usuario = Auth.getUsuario();
  if (usuario) {
    const elNome  = document.getElementById('sidebar-nome');
    const elCargo = document.getElementById('sidebar-cargo');
    const elAv    = document.getElementById('sidebar-avatar');
    if (elNome)  elNome.textContent  = usuario.nome;
    if (elCargo) elCargo.textContent = usuario.cargo;
    if (elAv)    elAv.textContent    = usuario.nome.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

    const selectResp = document.getElementById('f-resp-modal');
    if (selectResp) {
      selectResp.innerHTML = `<option value="${usuario.id}">${usuario.nome}</option>`;
    }

    const selectFiltro = document.getElementById('f-responsavel');
    if (selectFiltro) {
      selectFiltro.innerHTML = `<option value="">Responsável</option><option value="${usuario.id}">${usuario.nome}</option>`;
    }
  }

  await carregarProcessosData();
  aplicarFiltros();

  if (typeof Notifications !== 'undefined') {
    Notifications.init('btn-notificacoes');
  }
});