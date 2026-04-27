// ============================================================
// NS Advocacia — Cliente Detalhe
// ============================================================
const params = new URLSearchParams(window.location.search);
const clienteId = Number(params.get('id'));
const sMap = {
  'ATIVO':{cls:'pill--progress',label:'Em andamento'},'ARQUIVADO':{cls:'pill--waiting',label:'Arquivado'},
  'ENCERRADO':{cls:'pill--waiting',label:'Encerrado'},'SUSPENSO':{cls:'pill--urgent',label:'Suspenso'},
  'Urgente':{cls:'pill--urgent',label:'Urgente'},'Aguardando':{cls:'pill--waiting',label:'Aguardando'},
  'Em andamento':{cls:'pill--progress',label:'Em andamento'},
};
const sMapH = {
  'Pago':{cls:'pill--progress',label:'Pago'},'Pendente':{cls:'pill--waiting',label:'Pendente'},
  'Em atraso':{cls:'pill--urgent',label:'Em atraso'},'Parcelado':{cls:'pill--info',label:'Parcelado'},
};
const cores = ["#2d5a3d","#3d5a7a","#7a6a3d","#5a3d6a","#3d6a5a","#6a3d3d","#6a5a3d","#4a5a6a"];
function gerarIniciais(nome) {
  const p=(nome||'').trim().split(' ').filter(Boolean);
  if(p.length===1) return p[0].substring(0,2).toUpperCase();
  return (p[0][0]+p[p.length-1][0]).toUpperCase();
}
async function init() {
  if (!clienteId) { document.querySelector('.main').innerHTML='<div style="padding:48px;text-align:center;color:#9a9a94">ID não informado.</div>'; return; }
  let cli;
  try { cli = await Api.get(`/clientes/${clienteId}`); } catch(err) { document.querySelector('.main').innerHTML='<div style="padding:48px;text-align:center;color:#9a9a94">Cliente não encontrado.</div>'; return; }
  if (!cli) { document.querySelector('.main').innerHTML='<div style="padding:48px;text-align:center;color:#9a9a94">Cliente não encontrado.</div>'; return; }
  const iniciais=gerarIniciais(cli.nome), cor=cores[cli.id%cores.length];
  const tipoLabel=cli.tipo==='PESSOA_JURIDICA'?'Pessoa Jurídica':'Pessoa Física';
  const tipoCls=cli.tipo==='PESSOA_JURIDICA'?'pill--escrit':'pill--info';
  const desde=cli.criadoEm?new Date(cli.criadoEm).toLocaleDateString('pt-BR',{month:'short',year:'numeric'}):'—';
  document.getElementById('breadcrumb-nome').textContent=cli.nome;
  document.title=`NS Advocacia — ${cli.nome}`;
  const av=document.getElementById('hero-avatar'); av.textContent=iniciais; av.style.background=cor;
  document.getElementById('hero-nome').textContent=cli.nome;
  document.getElementById('hero-sub').textContent=`${cli.email||'—'} · ${cli.telefone||'—'}`;
  document.getElementById('hero-badges').innerHTML=`<span class="pill ${tipoCls}">${tipoLabel}</span>`;
  document.getElementById('hero-stats').innerHTML=`
    <div class="h-stat"><div class="h-stat__label">Processos</div><div class="h-stat__value">${cli._count?.processos||0}</div></div>
    <div class="h-stat"><div class="h-stat__label">Cliente desde</div><div class="h-stat__value">${desde}</div></div>
    <div class="h-stat"><div class="h-stat__label">Tipo</div><div class="h-stat__value">${tipoLabel}</div></div>`;
  renderDados(cli,desde,tipoLabel);
  await renderProcessos(cli);
  await renderFinanceiro(cli);
  document.querySelectorAll('.tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('pane-'+tab.dataset.pane).classList.add('active');
    });
  });
  if(typeof Notifications!=='undefined') Notifications.init('btn-notificacoes');
}
function renderDados(cli,desde,tipoLabel) {
  document.getElementById('pane-dados').innerHTML=`<div class="data-grid">
    <div class="data-card"><h4>Contato</h4>
      <div class="data-row"><span class="data-row__label">Telefone</span><span class="data-row__value">${cli.telefone||'—'}</span></div>
      <div class="data-row"><span class="data-row__label">E-mail</span><span class="data-row__value">${cli.email||'—'}</span></div>
      <div class="data-row"><span class="data-row__label">Endereço</span><span class="data-row__value">${cli.endereco||'—'}</span></div>
    </div>
    <div class="data-card"><h4>Dados cadastrais</h4>
      <div class="data-row"><span class="data-row__label">Tipo</span><span class="data-row__value">${tipoLabel}</span></div>
      <div class="data-row"><span class="data-row__label">Documento</span><span class="data-row__value">${cli.cpfCnpj||'—'}</span></div>
      <div class="data-row"><span class="data-row__label">Cliente desde</span><span class="data-row__value">${desde}</span></div>
    </div></div>`;
}
async function renderProcessos(cli) {
  let processos=[];
  try { processos=await Api.get(`/processos?clienteId=${cli.id}`)||[]; } catch(e) {}
  document.getElementById('pane-processos').innerHTML=processos.length
    ?`<div class="related-list">${processos.map(p=>{const s=sMap[p.status]||sMap['Em andamento'];return`
      <a class="related-item" href="processo-detalhe.html?id=${p.id}">
        <div class="related-info"><h5>${p.titulo}</h5><p>${p.numero||'—'} · ${p.vara||p.tribunal||'—'}</p></div>
        <div style="display:flex;align-items:center;gap:10px"><span class="pill ${s.cls}">${s.label}</span></div>
      </a>`;}).join('')}</div>`
    :'<div class="empty-state"><p>Nenhum processo vinculado.</p></div>';
}
async function renderFinanceiro(cli) {
  let honorarios=[],custas=[];
  try { honorarios=await Api.get(`/honorarios?clienteId=${cli.id}`)||[]; } catch(e) {}
  try { custas=await Api.get(`/custas?clienteId=${cli.id}`)||[]; } catch(e) {}
  const totalH=honorarios.reduce((s,h)=>s+(Number(h.valor)||0),0);
  const totalC=custas.reduce((s,c)=>s+(Number(c.valor)||0),0);
  const honHTML=honorarios.length?honorarios.map(h=>`<div class="fin-row">
    <div class="fin-info"><h5>${h.processo?.titulo||h.tipo||'Honorário'}</h5><p>Vence ${h.dataVencimento?new Date(h.dataVencimento).toLocaleDateString('pt-BR'):'—'}</p></div>
    <div class="fin-right"><div class="fin-value">R$ ${Number(h.valor).toLocaleString('pt-BR')}</div>
    <span class="pill ${(sMapH[h.status]||sMapH['Pendente']).cls}" style="font-size:10.5px">${h.status||'—'}</span></div></div>`).join('')
    :'<div class="empty-state"><p>Nenhum honorário registrado.</p></div>';
  const custasHTML=custas.length?custas.map(c=>`<div class="fin-row">
    <div class="fin-info"><h5>${c.tipo||'Custa'}</h5><p>${c.processo?.titulo||'—'} · ${c.data?new Date(c.data).toLocaleDateString('pt-BR'):'—'}</p></div>
    <div class="fin-right"><div class="fin-value">R$ ${Number(c.valor).toLocaleString('pt-BR')}</div>
    <span class="pill pill--waiting" style="font-size:10.5px">${c.status||'—'}</span></div></div>`).join('')
    :'<div class="empty-state"><p>Nenhuma custa registrada.</p></div>';
  document.getElementById('pane-financeiro').innerHTML=`
    <div class="fin-section"><h4>Honorários</h4>${honHTML}
    ${honorarios.length?`<div class="fin-total"><span>Total</span><strong>R$ ${totalH.toLocaleString('pt-BR')}</strong></div>`:''}</div>
    <div class="fin-section"><h4>Custas</h4>${custasHTML}
    ${custas.length?`<div class="fin-total"><span>Total</span><strong>R$ ${totalC.toLocaleString('pt-BR')}</strong></div>`:''}</div>`;
}
document.addEventListener('DOMContentLoaded', init);
