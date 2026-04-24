// ============================================================
// LexDesk — Configurações
// ============================================================

const equipeData = [
  { id:1, nome:'Rafael Silva',    email:'rafael.silva@lexdesk.com.br',   cor:'#2d5a3d', iniciais:'RS', cargo:'Admin',    online:true,  isAdmin:true  },
  { id:2, nome:'Beatriz Mendes',  email:'beatriz.mendes@lexdesk.com.br',  cor:'#3d5a7a', iniciais:'BM', cargo:'Advogada', online:true,  isAdmin:false },
  { id:3, nome:'Thiago Carvalho', email:'thiago.carvalho@lexdesk.com.br', cor:'#7a6a3d', iniciais:'TC', cargo:'Estagiário',online:false, isAdmin:false },
];

// ---------- ABAS ----------
document.querySelectorAll('.cfg-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.cfg-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.cfg-pane').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('pane-' + tab.dataset.pane).classList.add('active');
  });
});

// ---------- TOGGLES ----------
document.querySelectorAll('.toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('on');
    const key = toggle.dataset.key;
    if (key) localStorage.setItem(key, toggle.classList.contains('on') ? '1' : '0');
  });
});

// Restaura estado dos toggles do localStorage
document.querySelectorAll('.toggle[data-key]').forEach(toggle => {
  const val = localStorage.getItem(toggle.dataset.key);
  if (val === '0') toggle.classList.remove('on');
  if (val === '1') toggle.classList.add('on');
});

// ---------- EQUIPE ----------
function renderEquipe() {
  const lista = document.getElementById('equipe-lista');
  lista.innerHTML = equipeData.map(m => `
    <div class="team-item" data-id="${m.id}">
      <div class="team-avatar" style="background:${m.cor}">${m.iniciais}</div>
      <div class="team-info">
        <div class="team-name">${m.nome}</div>
        <div class="team-email">${m.email}</div>
      </div>
      <div class="team-actions">
        <span class="online-dot ${m.online ? 'online-dot--on' : 'online-dot--off'}"></span>
        <span class="role-badge ${m.isAdmin ? 'role-badge--admin' : ''}">${m.cargo}</span>
        ${!m.isAdmin ? `<button class="btn-remove" data-id="${m.id}">Remover</button>` : ''}
      </div>
    </div>
  `).join('') + `
    <button class="add-member-btn" id="btn-convidar">
      <div class="add-member-icon">
        <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </div>
      <span class="add-member-btn__label">Convidar novo membro</span>
    </button>
  `;

  lista.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id  = Number(btn.dataset.id);
      const mem = equipeData.find(m => m.id === id);
      if (!mem) return;
      Confirm.show(
        'Remover membro?',
        `${mem.nome} perderá o acesso ao sistema imediatamente.`,
        () => {
          const idx = equipeData.findIndex(m => m.id === id);
          if (idx > -1) equipeData.splice(idx, 1);
          renderEquipe();
          Toast.show(`${mem.nome} removido da equipe.`, 'warning');
        }
      );
    });
  });

  document.getElementById('btn-convidar').addEventListener('click', abrirModalConvite);
}

// ---------- SALVAR PERFIL ----------
document.getElementById('btn-salvar').addEventListener('click', () => {
  const nome = document.getElementById('f-nome')?.value.trim();
  if (nome) {
    document.getElementById('profile-name-display').textContent = nome;
    const iniciais = nome.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();
    const av = document.getElementById('profile-avatar');
    if (av) { av.childNodes[0].textContent = iniciais; }
    localStorage.setItem('ld_user_nome', nome);
  }
  Toast.show('Configurações salvas com sucesso!', 'success');
});

// ---------- LOGO UPLOAD ----------
document.getElementById('btn-logo-upload')?.addEventListener('click', () => {
  document.getElementById('logo-input').click();
});
document.getElementById('logo-input')?.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const box = document.getElementById('logo-box');
    box.innerHTML = `<img src="${ev.target.result}" alt="Logo" />`;
  };
  reader.readAsDataURL(file);
  Toast.show('Logo atualizada!', 'success');
});

// ---------- MODAL SENHA ----------
const modalSenha = document.getElementById('modal-senha');
document.getElementById('btn-alterar-senha')?.addEventListener('click', () => modalSenha.classList.add('active'));
document.getElementById('modal-senha-close')?.addEventListener('click', () => fecharModalSenha());
document.getElementById('modal-senha-cancel')?.addEventListener('click', () => fecharModalSenha());
document.getElementById('modal-senha-save')?.addEventListener('click', () => {
  const atual = document.getElementById('f-senha-atual').value;
  const nova  = document.getElementById('f-senha-nova').value;
  const conf  = document.getElementById('f-senha-conf').value;

  if (!atual || !nova || !conf) {
    Toast.show('Preencha todos os campos.', 'error');
    return;
  }
  if (nova.length < 8) {
    Toast.show('A nova senha precisa ter pelo menos 8 caracteres.', 'error');
    return;
  }
  if (nova !== conf) {
    Toast.show('As senhas não coincidem.', 'error');
    return;
  }
  fecharModalSenha();
  Toast.show('Senha alterada com sucesso!', 'success');
});

function fecharModalSenha() {
  modalSenha.classList.remove('active');
  ['f-senha-atual','f-senha-nova','f-senha-conf'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

// ---------- MODAL CONVITE ----------
const modalConvite = document.getElementById('modal-convite');

function abrirModalConvite() { modalConvite.classList.add('active'); }
function fecharModalConvite() {
  modalConvite.classList.remove('active');
  ['f-convite-nome','f-convite-email'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

document.getElementById('modal-convite-close')?.addEventListener('click', fecharModalConvite);
document.getElementById('modal-convite-cancel')?.addEventListener('click', fecharModalConvite);
document.getElementById('modal-convite-save')?.addEventListener('click', () => {
  const nome  = document.getElementById('f-convite-nome').value.trim();
  const email = document.getElementById('f-convite-email').value.trim();
  const cargo = document.getElementById('f-convite-cargo').value;

  if (!nome || !email) {
    Toast.show('Preencha nome e e-mail.', 'error');
    return;
  }

  const iniciais = nome.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  const cores = ['#2d5a3d','#3d5a7a','#7a6a3d','#5a3d6a','#3d6a5a','#6a3d3d'];
  const novoId = equipeData.length ? Math.max(...equipeData.map(m => m.id)) + 1 : 1;

  equipeData.push({
    id: novoId,
    nome, email,
    cor: cores[novoId % cores.length],
    iniciais,
    cargo,
    online: false,
    isAdmin: false,
  });

  fecharModalConvite();
  renderEquipe();
  Toast.show(`Convite enviado para ${nome}!`, 'success');
});

// ---------- EXCLUIR CONTA ----------
document.getElementById('btn-excluir-conta')?.addEventListener('click', () => {
  Confirm.show(
    'Excluir conta permanentemente?',
    'Todos os dados do escritório, processos e clientes serão removidos. Esta ação não pode ser desfeita.',
    () => Toast.show('Funcionalidade disponível apenas na versão completa.', 'info'),
    'danger'
  );
});

// Fecha modais ao clicar fora ou pressionar Escape
[modalSenha, modalConvite].forEach(modal => {
  modal?.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    modalSenha?.classList.remove('active');
    modalConvite?.classList.remove('active');
  }
});

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  renderEquipe();
  Notifications.init('btn-notificacoes');

  // Restaura nome salvo
  const nomesSalvo = localStorage.getItem('ld_user_nome');
  if (nomesSalvo) {
    const input = document.getElementById('f-nome');
    const display = document.getElementById('profile-name-display');
    if (input) input.value = nomesSalvo;
    if (display) display.textContent = nomesSalvo;
  }
});
