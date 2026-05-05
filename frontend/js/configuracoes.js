// ============================================================
// NS Advocacia — Configurações
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  Auth.exigirLogin();

  const usuario = Auth.getUsuario();

  // ── Preenche dados do perfil com dados reais do localStorage ──
  if (usuario) {
    document.getElementById('f-nome').value     = usuario.nome  || '';
    document.getElementById('f-email').value    = usuario.email || '';
    document.getElementById('f-oab').value      = usuario.oab   || '';
    document.getElementById('f-cargo').value    = usuario.cargo || '';
    document.getElementById('profile-name-display').textContent = usuario.nome || '';
    document.getElementById('profile-avatar').textContent =
      usuario.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const elNome  = document.getElementById('sidebar-nome');
    const elCargo = document.getElementById('sidebar-cargo');
    const elAv    = document.getElementById('sidebar-avatar');
    if (elNome)  elNome.textContent  = usuario.nome;
    if (elCargo) elCargo.textContent = usuario.cargo;
    if (elAv)    elAv.textContent    = usuario.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  // ── Tabs ──
  document.querySelectorAll('.cfg-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.cfg-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.cfg-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('pane-' + tab.dataset.pane).classList.add('active');
    });
  });

  // ── Toggles ──
  document.querySelectorAll('.toggle').forEach(toggle => {
    toggle.addEventListener('click', () => toggle.classList.toggle('on'));
  });

  // ── Carregar equipe ──
  await carregarEquipe();

  // ── Salvar perfil ──
  document.getElementById('btn-salvar').addEventListener('click', async () => {
    const paneAtiva = document.querySelector('.cfg-tab.active')?.dataset.pane;

    if (paneAtiva === 'perfil') {
      await salvarPerfil();
    } else if (paneAtiva === 'escritorio') {
      Toast.show('Dados do escritório salvos.', 'success');
    } else if (paneAtiva === 'notificacoes') {
      Toast.show('Preferências de notificação salvas.', 'success');
    } else if (paneAtiva === 'preferencias') {
      Toast.show('Preferências salvas.', 'success');
    } else {
      Toast.show('Alterações salvas.', 'success');
    }
  });

  // ── Modal senha ──
  document.getElementById('btn-alterar-senha').addEventListener('click', () => {
    document.getElementById('modal-senha').classList.add('active');
  });
  document.getElementById('modal-senha-close').addEventListener('click', fecharModalSenha);
  document.getElementById('modal-senha-cancel').addEventListener('click', fecharModalSenha);
  document.getElementById('modal-senha').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-senha')) fecharModalSenha();
  });
  document.getElementById('modal-senha-save').addEventListener('click', salvarSenha);

  // ── Modal convite ──
  document.getElementById('modal-convite-close').addEventListener('click', fecharModalConvite);
  document.getElementById('modal-convite-cancel').addEventListener('click', fecharModalConvite);
  document.getElementById('modal-convite').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-convite')) fecharModalConvite();
  });
  document.getElementById('modal-convite-save').addEventListener('click', enviarConvite);

  // ── Logo upload ──
  document.getElementById('btn-logo-upload').addEventListener('click', () => {
    document.getElementById('logo-input').click();
  });
  document.getElementById('logo-input').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const box = document.getElementById('logo-box');
      box.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:contain;border-radius:8px" />`;
    };
    reader.readAsDataURL(file);
  });

  // ── Excluir conta ──
  document.getElementById('btn-excluir-conta').addEventListener('click', () => {
    if (confirm('Tem certeza? Esta ação é irreversível e apagará todos os dados do escritório.')) {
      Toast.show('Funcionalidade desativada neste ambiente.', 'error');
    }
  });

  if (typeof Notifications !== 'undefined') Notifications.init('btn-notificacoes');
});

// ── Salvar perfil ──
async function salvarPerfil() {
  const usuario = Auth.getUsuario();
  const nome    = document.getElementById('f-nome').value.trim();
  const email   = document.getElementById('f-email').value.trim();
  const oab     = document.getElementById('f-oab').value.trim();
  const cargo   = document.getElementById('f-cargo').value.trim();
  const telefone = document.getElementById('f-telefone').value.trim();

  if (!nome || !email) {
    Toast.show('Nome e e-mail são obrigatórios.', 'error');
    return;
  }

  try {
    const atualizado = await Api.put(`/usuarios/${usuario.id}`, { nome, email, oab, cargo, telefone });

    // Atualiza localStorage com novos dados
    const novoUsuario = { ...usuario, nome, email, oab, cargo, telefone };
    localStorage.setItem('ns_usuario', JSON.stringify(novoUsuario));

    // Atualiza UI
    document.getElementById('profile-name-display').textContent = nome;
    document.getElementById('profile-avatar').textContent =
      nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const elNome = document.getElementById('sidebar-nome');
    const elAv   = document.getElementById('sidebar-avatar');
    if (elNome) elNome.textContent = nome;
    if (elAv)   elAv.textContent   = nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    Toast.show('Perfil atualizado com sucesso!', 'success');
  } catch (err) {
    Toast.show(err.message || 'Erro ao salvar perfil.', 'error');
  }
}

// ── Alterar senha ──
async function salvarSenha() {
  const usuario   = Auth.getUsuario();
  const senhaAtual = document.getElementById('f-senha-atual').value;
  const novaSenha  = document.getElementById('f-senha-nova').value;
  const conf       = document.getElementById('f-senha-conf').value;

  if (!senhaAtual || !novaSenha || !conf) {
    Toast.show('Preencha todos os campos.', 'error');
    return;
  }
  if (novaSenha.length < 8) {
    Toast.show('A nova senha deve ter ao menos 8 caracteres.', 'error');
    return;
  }
  if (novaSenha !== conf) {
    Toast.show('As senhas não coincidem.', 'error');
    return;
  }

  try {
    await Api.put(`/usuarios/${usuario.id}/senha`, { senhaAtual, novaSenha });
    Toast.show('Senha alterada com sucesso!', 'success');
    fecharModalSenha();
    document.getElementById('f-senha-atual').value = '';
    document.getElementById('f-senha-nova').value  = '';
    document.getElementById('f-senha-conf').value  = '';
  } catch (err) {
    Toast.show(err.message || 'Erro ao alterar senha.', 'error');
  }
}

// ── Carregar equipe ──
async function carregarEquipe() {
  const lista = document.getElementById('equipe-lista');
  lista.innerHTML = '<p style="padding:16px;color:#aaa;font-size:13px">Carregando...</p>';

  try {
    const membros = await Api.get('/usuarios');
    if (!membros || !membros.length) {
      lista.innerHTML = '<p style="padding:16px;color:#aaa;font-size:13px">Nenhum membro encontrado.</p>';
      return;
    }

    const cores = ['#2d5a3d','#3d5a7a','#7a6a3d','#5a3d6a','#3d6a5a','#6a3d3d'];
    lista.innerHTML = membros.map((m, i) => {
      const iniciais = m.nome.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();
      return `
        <div class="field-row" style="align-items:center;gap:12px">
          <div style="width:36px;height:36px;border-radius:50%;background:${cores[i % cores.length]};display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:500;flex-shrink:0">${iniciais}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:500;color:#1c1c1a">${m.nome}</div>
            <div style="font-size:12px;color:#9a9a94">${m.email} · ${m.cargo || 'Membro'}</div>
          </div>
          <span style="font-size:11px;padding:3px 10px;border-radius:20px;background:${m.ativo ? '#eaf4ee' : '#f5f5f3'};color:${m.ativo ? '#2d6a4f' : '#9a9a94'}">${m.ativo ? 'Ativo' : 'Inativo'}</span>
        </div>`;
    }).join('');

    // Botão convidar
    lista.innerHTML += `
      <div style="padding-top:12px;border-top:1px solid rgba(0,0,0,0.06);margin-top:8px">
        <button id="btn-convidar" style="font-size:13px;padding:8px 16px;border-radius:8px;border:0.5px solid rgba(0,0,0,0.14);background:transparent;color:#3d6a5a;cursor:pointer;font-family:'DM Sans',sans-serif">
          + Convidar membro
        </button>
      </div>`;

    document.getElementById('btn-convidar').addEventListener('click', () => {
      document.getElementById('modal-convite').classList.add('active');
    });

  } catch (err) {
    lista.innerHTML = '<p style="padding:16px;color:#aaa;font-size:13px">Erro ao carregar equipe.</p>';
  }
}

// ── Enviar convite (cria usuário) ──
async function enviarConvite() {
  const nome  = document.getElementById('f-convite-nome').value.trim();
  const email = document.getElementById('f-convite-email').value.trim();
  const cargo = document.getElementById('f-convite-cargo').value;

  if (!nome || !email) {
    Toast.show('Preencha nome e e-mail.', 'error');
    return;
  }

  try {
    // Cria com senha provisória — o membro deverá trocar no primeiro acesso
    await Api.post('/usuarios', {
      nome,
      email,
      cargo: cargo.toUpperCase(),
      senha: 'Mudar@123',
    });
    Toast.show(`Membro ${nome} adicionado! Senha provisória: Mudar@123`, 'success');
    fecharModalConvite();
    await carregarEquipe();
  } catch (err) {
    Toast.show(err.message || 'Erro ao convidar membro.', 'error');
  }
}

function fecharModalSenha() {
  document.getElementById('modal-senha').classList.remove('active');
}

function fecharModalConvite() {
  document.getElementById('modal-convite').classList.remove('active');
  document.getElementById('f-convite-nome').value  = '';
  document.getElementById('f-convite-email').value = '';
}