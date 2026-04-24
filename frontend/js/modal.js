const overlay   = document.getElementById("modal-overlay");
const openBtn   = document.getElementById("novo-processo-btn");
const closeBtn  = document.getElementById("modal-close");
const cancelBtn = document.getElementById("modal-cancel");
const saveBtn   = document.getElementById("modal-save");

function openModal()  { overlay.classList.add("active"); document.getElementById("f-tipo").focus(); }
function closeModal() { overlay.classList.remove("active"); clearForm(); }

function clearForm() {
  ["f-tipo","f-numero","f-cliente","f-prazo"].forEach((id) => { document.getElementById(id).value = ""; });
  document.getElementById("f-status").value = "Em andamento";
}

function saveProcesso() {
  const tipo    = document.getElementById("f-tipo").value.trim();
  const numero  = document.getElementById("f-numero").value.trim();
  const cliente = document.getElementById("f-cliente").value.trim();
  const status  = document.getElementById("f-status").value;
  const prazoRaw = document.getElementById("f-prazo").value;

  if (!tipo || !cliente) { alert("Preencha o Tipo de Ação e o Cliente."); return; }

  let prazo = "—";
  if (prazoRaw) {
    const [y, m, d] = prazoRaw.split("-");
    const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    prazo = `${Number(d)} ${months[Number(m) - 1]}`;
  }

  const newId = processos.length ? Math.max(...processos.map((p) => p.id)) + 1 : 1;
  processos.unshift({ id: newId, tipo, numero: numero || "—", cliente, status, prazo, prazoUrgente: false });

  renderProcessos(processos);
  closeModal();
}

openBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
saveBtn.addEventListener("click", saveProcesso);
overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });