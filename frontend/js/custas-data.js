const custasData = [
  { id:1,  processo:'Ação Trabalhista',    num:'#0012345', cliente:'Maria Fernanda Costa',  tipo:'Taxa judiciária',       valor:3200, data:'08/01/2024', pagador:'Escritório', status:'Reembolsado' },
  { id:2,  processo:'Indenização Civil',   num:'#0033210', cliente:'Construtora Viva S.A.', tipo:'Depósito recursal',     valor:6200, data:'15/02/2024', pagador:'Cliente',    status:'Pago'        },
  { id:3,  processo:'Ação Trabalhista',    num:'#0012345', cliente:'Maria Fernanda Costa',  tipo:'Peritos / assistentes', valor:5100, data:'20/02/2024', pagador:'Escritório', status:'Pendente'    },
  { id:4,  processo:'Rescisão Contratual', num:'#0021098', cliente:'Farmácia Bela Saúde',   tipo:'Diligências / oficiais',valor:2800, data:'05/03/2024', pagador:'Escritório', status:'Pendente'    },
  { id:5,  processo:'Divórcio Consensual', num:'#0009871', cliente:'João Renato Alves',     tipo:'Cópias e certidões',    valor:1480, data:'12/03/2024', pagador:'Cliente',    status:'Reembolsado' },
  { id:6,  processo:'Usucapião Urbano',    num:'#0054321', cliente:'Carlos Eduardo Lima',   tipo:'Taxa judiciária',       valor:2800, data:'18/03/2024', pagador:'Escritório', status:'Pendente'    },
  { id:7,  processo:'Ação de Cobrança',    num:'#0076543', cliente:'Distribuidora Norte',   tipo:'Outras despesas',       valor:700,  data:'22/03/2024', pagador:'Cliente',    status:'Pago'        },
  { id:8,  processo:'Revisão Contratual',  num:'#0087654', cliente:'Ana Paula Rodrigues',   tipo:'Taxa judiciária',       valor:2400, data:'28/03/2024', pagador:'Escritório', status:'Reembolsado' },
  { id:9,  processo:'Pensão Alimentícia',  num:'#0098765', cliente:'Lucia Moraes',          tipo:'Diligências / oficiais',valor:0,    data:'02/04/2024', pagador:'Cliente',    status:'Pago'        },
];

const tipoConfig = {
  'Taxa judiciária':       { cor: '#2563a8' },
  'Depósito recursal':     { cor: '#c07a20' },
  'Peritos / assistentes': { cor: '#3d7a52' },
  'Diligências / oficiais':{ cor: '#c0392b' },
  'Cópias e certidões':    { cor: '#888780' },
  'Outras despesas':       { cor: '#b4b2a9' },
};

const custasStatusMap = {
  'Pago':        { cls: 'pill--pago',     label: 'Pago'        },
  'Pendente':    { cls: 'pill--pendente', label: 'Pendente'    },
  'Reembolsado': { cls: 'pill--reemb',   label: 'Reembolsado' },
};

function formatMoeda(v) {
  return 'R$ ' + v.toLocaleString('pt-BR');
}