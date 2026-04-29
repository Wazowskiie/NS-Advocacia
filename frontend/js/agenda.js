const DIAS     = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES    = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const HOURS    = [7,8,9,10,11,12,13,14,15,16,17,18,19,20];
const HOUR_H   = 64;
const tipoClass = {
  AUDIENCIA:  'ev-audiencia',
  REUNIAO:    'ev-reuniao',
  PRAZO:      'ev-prazo',
  DILIGENCIA: 'ev-tarefa',
  OUTRO:      'ev-tarefa',
};

let weekOffset = 0;
let eventosData = [];

// ---------- SEMANA ----------
function getSemana(offset) {
  const hoje = new Date();
  const dow  = hoje.getDay();
  const seg  = new Date(hoje);
  seg.setDate(hoje.getDate() - (dow === 0 ? 6 : dow - 1) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(seg);
    d.setDate(seg.getDate() + i);
    return d;
  });
}

// ---------- CARREGAR EVENTOS DA API ----------
async function carregarEventos() {
  const semana = getSemana(weekOffset);
  const inicio = semana[0].toISOString().split('T')[0];
  const fim    = semana[6].toISOString().split('T')[0];
  try {
    const data = await Api.get(`/eventos?inicio=${inicio}&fim=${fim}`);
    eventosData = (data || []).map(e => {
      const ini  = new Date(e.dataInicio);
      const fim2 = e.dataFim ? new Date(e.dataFim) : new Date(ini.getTime() + 3600000);
      const diaSemana = (ini.getDay() + 6) % 7;
      return {
        id:     e.id,
        titulo: e.titulo,
        sub:    e.descricao || (e.processo ? e.processo.titulo : ''),
        tipo:   e.tipo || 'REUNIAO',
        resp:   e.usuarioId || '',
        dia:    diaSemana,
        hIni: ini.getHours() + ini.getMinutes() / 60,
        hFim: fim2.getHours() + fim2.getMinutes() / 60,
      };
    });
  } catch (err) {
    console.error('Erro ao carregar eventos:', err);
    eventosData = [];
  }
  renderCalendar();
}

// ---------- RENDER ----------
function renderCalendar() {
  const semana     = getSemana(weekOffset);
  const hoje       = new Date();
  const filtroResp = document.getElementById('f-responsavel').value;
  renderHeader(semana, hoje);
  renderGrid(semana, hoje, filtroResp);
  atualizarLabelSemana(semana);
}

function renderHeader(semana, hoje) {
  const head = document.getElementById('cal-head');
  head.innerHTML =
    '<div class="cal-head-empty"></div>' +
    semana.map(d => {
      const isToday = d.toDateString() === hoje.toDateString();
      return `<div class="day-col-head${isToday ? ' today' : ''}">
        <div class="day-name">${DIAS[d.getDay()]}</div>
        <div class="day-num">${d.getDate()}</div>
      </div>`;
    }).join('');
}

function renderGrid(semana, hoje, filtroResp) {
  const grid = document.getElementById('cal-grid');
  const evsFiltrados = eventosData.filter(e => !filtroResp || e.resp === filtroResp);
  const timeCol = `<div class="time-col">${
    HOURS.map(h => `<div class="time-slot">${h}h</div>`).join('')
  }</div>`;
  const diasCols = semana.map(d => {
    const isToday   = d.toDateString() === hoje.toDateString();
    const diaSemana = (d.getDay() + 6) % 7;
    const evsDay    = evsFiltrados.filter(e => e.dia === diaSemana);
    const linhas    = HOURS.map((_, i) => `<div class="hour-line" style="top:${i * HOUR_H}px"></div>`).join('');
    const blocos    = evsDay.map(ev => eventoHTML(ev)).join('');
    const nowLine   = isToday ? nowLineHTML() : '';
    return `<div class="day-col${isToday ? ' today' : ''}">${linhas}${nowLine}${blocos}</div>`;
  }).join('');
  grid.innerHTML = timeCol + diasCols;
}

function eventoHTML(ev) {
  const top    = (ev.hIni - HOURS[0]) * HOUR_H;
  const height = Math.max((ev.hFim - ev.hIni) * HOUR_H - 4, 24);
  const cls    = tipoClass[ev.tipo] || 'ev-tarefa';
  const hIni   = formatHora(ev.hIni);
  const hFim   = formatHora(ev.hFim);
  return `
    <div class="event ${cls}" style="top:${top}px;height:${height}px" data-id="${ev.id}">
      <div class="ev-title">${ev.titulo}</div>
      ${height > 36 ? `<div class="ev-sub">${ev.sub}</div>` : ''}
      ${height > 52 ? `<div class="ev-time">${hIni} — ${hFim}</div>` : ''}
    </div>`;
}

function nowLineHTML() {
  const agora    = new Date();
  const hDecimal = agora.getHours() + agora.getMinutes() / 60;
  if (hDecimal < HOURS[0] || hDecimal > HOURS[HOURS.length - 1] + 1) return '';
  const top = (hDecimal - HOURS[0]) * HOUR_H;
  return `<div class="now-line" style="top:${top}px"></div>`;
}

function atualizarLabelSemana(semana) {
  const ini = semana[0];
  const fim = semana[6];
  const label = ini.getMonth() === fim.getMonth()
    ? `${ini.getDate()} — ${fim.getDate()} ${MESES[fim.getMonth()]} ${fim.getFullYear()}`
    : `${ini.getDate()} ${MESES[ini.getMonth()]} — ${fim.getDate()} ${MESES[fim.getMonth()]} ${fim.getFullYear()}`;
  document.getElementById('week-label').textContent = label;
}

function formatHora(h) {
  const hh = Math.floor(h);
  const mm = h % 1 ? '30' : '00';
  return `${hh}h${mm}`;
}

// ---------- MODAL ----------
const overlay   = document.getElementById('modal-overlay');
const btnNovo   = document.getElementById('btn-novo');
const btnClose  = document.getElementById('modal-close');
const btnCancel = document.getElementById('modal-cancel');
const btnSave   = document.getElementById('modal-save');

function abrirModal()  { overlay.classList.add('active'); document.getElementById('f-titulo').focus(); }
function fecharModal() { overlay.classList.remove('active'); limparModal(); }

function limparModal() {
  ['f-titulo', 'f-sub', 'f-data'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('f-tipo').value     = 'AUDIENCIA';
  document.getElementById('f-hora-ini').value = '09:00';
  document.getElementById('f-hora-fim').value = '10:00';
}

async function salvarEvento() {
  const titulo  = document.getElementById('f-titulo').value.trim();
  const sub     = document.getElementById('f-sub').value.trim();
  const tipo    = document.getElementById('f-tipo').value;
  const data    = document.getElementById('f-data').value;
  const horaIni = document.getElementById('f-hora-ini').value;
  const horaFim = document.getElementById('f-hora-fim').value;

  if (!titulo || !data) {
    Toast.show('Preencha o título e a data do evento.', 'error');
    return;
  }

  const [hIniH, hIniM] = horaIni.split(':').map(Number);
  const [hFimH, hFimM] = horaFim.split(':').map(Number);
  if ((hFimH + hFimM / 60) <= (hIniH + hIniM / 60)) {
    Toast.show('A hora de fim deve ser maior que a hora de início.', 'error');
    return;
  }

  const dataInicio = `${data}T${horaIni}:00`;
  const dataFim    = `${data}T${horaFim}:00`;

  try {
    const usuario = Auth.getUsuario();
    await Api.post('/eventos', { titulo, descricao: sub, tipo, dataInicio, dataFim, usuarioId: usuario ? usuario.id : null });
    Toast.show('Evento criado com sucesso!', 'success');
    fecharModal();
    await carregarEventos();
  } catch (err) {
    Toast.show('Erro de conexão com o servidor.', 'error');
  }
}

// ---------- EVENTOS ----------
document.getElementById('btn-prev').addEventListener('click', () => { weekOffset--; carregarEventos(); });
document.getElementById('btn-next').addEventListener('click', () => { weekOffset++; carregarEventos(); });
document.getElementById('btn-hoje').addEventListener('click', () => { weekOffset = 0; carregarEventos(); });
document.getElementById('f-responsavel').addEventListener('change', renderCalendar);

btnNovo.addEventListener('click', abrirModal);
btnClose.addEventListener('click', fecharModal);
btnCancel.addEventListener('click', fecharModal);
btnSave.addEventListener('click', salvarEvento);
overlay.addEventListener('click', e => { if (e.target === overlay) fecharModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharModal(); });


// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  Auth.exigirLogin();

  const usuario = Auth.getUsuario();
  if (usuario) {
    const select = document.getElementById('f-responsavel');
    const opt = document.createElement('option');
    opt.value = String(usuario.id);
    opt.textContent = usuario.nome;
    opt.selected = true;
    select.appendChild(opt);

    const selectModal = document.getElementById('f-resp-modal');
    if (selectModal) {
      selectModal.innerHTML = `<option value="${usuario.id}">${usuario.nome}</option>`;
    }
  }

  carregarEventos();
  Notifications.init('btn-notificacoes');
});
