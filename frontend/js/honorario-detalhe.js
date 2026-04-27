// ============================================================
// NS Advocacia — Honorário Detalhe
// ============================================================
const params=new URLSearchParams(window.location.search);
const honId=Number(params.get('id'));
const sMap={'Pago':{cls:'pill--progress',label:'Pago'},'Pendente':{cls:'pill--waiting',label:'Pendente'},'Em atraso':{cls:'pill--urgent',label:'Em atraso'},'Parcelado':{cls:'pill--info',label:'Parcelado'}};
let _hon=null;
async function init() {
  if(!honId){document.querySelector('.main').innerHTML='<div style="padding:48px;text-align:center;color:#9a9a94">ID não informado.</div>';return;}
  try{_hon=await Api.get(`/honorarios/${honId}`);}catch(err){document.querySelector('.main').innerHTML='<div style="padding:48px;text-align:center;color:#9a9a94">Honorário não encontrado.</div>';return;}
  if(!_hon){document.querySelector('.main').innerHTML='<div style="padding:48px;text-align:center;color:#9a9a94">Honorário não encontrado.</div>';return;}
  const h=_hon;
  const titulo=h.processo?.titulo||h.tipo||'Honorário';
  const clienteNome=h.cliente?.nome||h.processo?.cliente?.nome||'—';
  const venc=h.dataVencimento?new Date(h.dataVencimento).toLocaleDateString('pt-BR'):'—';
  const s=sMap[h.status]||sMap['Pendente'];
  document.getElementById('breadcrumb-titulo').textContent=titulo;
  document.title=`NS Advocacia — ${titulo}`;
  document.getElementById('hero-titulo').textContent=titulo;
  document.getElementById('hero-sub').textContent=`${h.processo?.numero||'—'} · ${clienteNome}`;
  document.getElementById('hero-badges').innerHTML=`<span class="pill ${s.cls}">${s.label}</span><span style="font-size:11px;color:var(--t3);padding:3px 0">Tipo: ${h.tipo||'—'}</span>`;
  document.getElementById('hero-stats').innerHTML=`
    <div class="h-stat"><div class="h-stat__label">Valor</div><div class="h-stat__value h-stat__value--green">R$ ${Number(h.valor).toLocaleString('pt-BR')}</div></div>
    <div class="h-stat"><div class="h-stat__label">Vencimento</div><div class="h-stat__value${h.status==='Em atraso'?' h-stat__value--urgent':''}">${venc}</div></div>
    <div class="h-stat"><div class="h-stat__label">Cliente</div><div class="h-stat__value">${clienteNome.split(' ').slice(0,2).join(' ')}</div></div>
    <div class="h-stat"><div class="h-stat__label">Tipo de cobrança</div><div class="h-stat__value">${h.tipo||'—'}</div></div>`;
  renderDados(h,clienteNome,venc,s);
  renderHistorico(h,venc);
  document.querySelectorAll('.tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('pane-'+tab.dataset.pane).classList.add('active');
    });
  });
  const btnPago=document.getElementById('btn-marcar-pago');
  if(h.status==='Pago'){btnPago.disabled=true;btnPago.textContent='Já pago';btnPago.style.opacity='0.5';}
  else{btnPago.onclick=()=>{Confirm.show('Marcar como pago?',`Confirma o recebimento de R$ ${Number(h.valor).toLocaleString('pt-BR')}?`,async()=>{
    try{await Api.patch(`/honorarios/${honId}`,{status:'Pago'});Toast.show('Honorário marcado como pago!','success');setTimeout(()=>window.location.reload(),1000);}
    catch(err){Toast.show('Erro ao atualizar status.','error');}
  });};  }
  if(typeof Notifications!=='undefined') Notifications.init('btn-notificacoes');
}
function renderDados(h,clienteNome,venc,s) {
  const proc=h.processo,cli=h.cliente||proc?.cliente;
  document.getElementById('pane-dados').innerHTML=`<div class="data-grid">
    <div class="data-card"><h4>Dados do lançamento</h4>
      <div class="data-row"><span class="data-row__label">Processo</span><span class="data-row__value">${proc?.titulo||'—'}</span></div>
      <div class="data-row"><span class="data-row__label">Número</span><span class="data-row__value">${proc?.numero||'—'}</span></div>
      <div class="data-row"><span class="data-row__label">Tipo de cobrança</span><span class="data-row__value">${h.tipo||'—'}</span></div>
      <div class="data-row"><span class="data-row__label">Valor</span><span class="data-row__value">R$ ${Number(h.valor).toLocaleString('pt-BR')}</span></div>
      <div class="data-row"><span class="data-row__label">Vencimento</span><span class="data-row__value">${venc}</span></div>
      <div class="data-row"><span class="data-row__label">Status</span><span class="pill ${s.cls}" style="font-size:11px">${s.label}</span></div>
    </div>
    <div class="data-card"><h4>Cliente</h4>
      ${cli?`<div class="data-row"><span class="data-row__label">Nome</span><span class="data-row__value">${cli.nome}</span></div>
        <div class="data-row"><span class="data-row__label">Telefone</span><span class="data-row__value">${cli.telefone||'—'}</span></div>
        <div class="data-row"><span class="data-row__label">E-mail</span><span class="data-row__value data-row__value--small">${cli.email||'—'}</span></div>
        <div style="margin-top:12px"><a href="cliente-detalhe.html?id=${cli.id}" style="font-size:12.5px;color:var(--ga);cursor:pointer">Ver perfil completo →</a></div>`
      :'<p style="font-size:12.5px;color:var(--t3);padding:8px 0">Cliente não encontrado.</p>'}
    </div></div>
    ${proc?`<div style="margin-top:14px"><div class="data-card"><h4>Processo vinculado</h4>
      <div class="data-row"><span class="data-row__label">Tipo</span><span class="data-row__value">${proc.titulo}</span></div>
      <div class="data-row"><span class="data-row__label">Número</span><span class="data-row__value data-row__value--small">${proc.numero||'—'}</span></div>
      <div class="data-row"><span class="data-row__label">Vara</span><span class="data-row__value">${proc.vara||proc.tribunal||'—'}</span></div>
      <div style="margin-top:12px"><a href="processo-detalhe.html?id=${proc.id}" style="font-size:12.5px;color:var(--ga);cursor:pointer">Ver processo completo →</a></div>
    </div></div>`:''}`;
}
function renderHistorico(h,venc) {
  const historico=[
    {evento:'Lançamento criado',data:venc,obs:`Valor: R$ ${Number(h.valor).toLocaleString('pt-BR')} — Tipo: ${h.tipo||'—'}`},
    ...(h.status==='Pago'?[{evento:'Pagamento recebido',data:'Registrado',obs:`R$ ${Number(h.valor).toLocaleString('pt-BR')} confirmado`}]:[]),
    ...(h.status==='Em atraso'?[{evento:'Vencimento em atraso',data:venc,obs:'Pagamento não identificado até a data de vencimento.'}]:[]),
  ];
  document.getElementById('pane-historico').innerHTML=`<div class="timeline">
    ${historico.map((item,i)=>`<div class="tl-item"><div class="tl-spine">
      <div class="tl-dot" style="background:${i===0?'#3d7a52':i===historico.length-1&&h.status==='Em atraso'?'#c0392b':'#2563a8'}"></div>
      <div class="tl-line"></div></div>
      <div class="tl-body"><div class="tl-title">${item.evento}</div><div class="tl-desc">${item.obs}</div>
      <div class="tl-meta"><span class="tl-date">${item.data}</span></div></div></div>`).join('')}
    </div>`;
}
document.addEventListener('DOMContentLoaded', init);
