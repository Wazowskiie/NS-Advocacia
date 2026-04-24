const honorariosData = [
  { id:1,  processo:'Ação Trabalhista',    num:'#0012345', cliente:'Maria Fernanda Costa',  cor:'#2d5a3d', tipo:'Fixo',    valor:12000, venc:'15/03/2024', status:'Pago'      },
  { id:2,  processo:'Indenização Civil',   num:'#0033210', cliente:'Construtora Viva S.A.', cor:'#3d5a7a', tipo:'% causa', valor:18500, venc:'30/04/2024', status:'Parcelado'  },
  { id:3,  processo:'Divórcio Consensual', num:'#0009871', cliente:'João Renato Alves',     cor:'#7a6a3d', tipo:'Fixo',    valor:4800,  venc:'10/04/2024', status:'Pendente'   },
  { id:4,  processo:'Rescisão Contratual', num:'#0021098', cliente:'Farmácia Bela Saúde',   cor:'#6a3d3d', tipo:'Por hora',valor:7800,  venc:'05/03/2024', status:'Em atraso'  },
  { id:5,  processo:'Revisão Contratual',  num:'#0087654', cliente:'Ana Paula Rodrigues',   cor:'#5a3d6a', tipo:'Fixo',    valor:3600,  venc:'19/03/2024', status:'Pago'       },
  { id:6,  processo:'Usucapião Urbano',    num:'#0054321', cliente:'Carlos Eduardo Lima',   cor:'#3d6a5a', tipo:'Fixo',    valor:6000,  venc:'25/04/2024', status:'Pendente'   },
  { id:7,  processo:'Ação de Cobrança',    num:'#0076543', cliente:'Distribuidora Norte',   cor:'#3d5a7a', tipo:'% causa', valor:9200,  venc:'02/04/2024', status:'Parcelado'  },
  { id:8,  processo:'Pensão Alimentícia',  num:'#0098765', cliente:'Lucia Moraes',          cor:'#6a5a3d', tipo:'Fixo',    valor:2400,  venc:'07/04/2024', status:'Pendente'   },
];

// Dados para o gráfico — recebido e pendente por mês
const graficoData = {
  meses:     ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  recebido:  [5200,  8400,  6800,  9200,  4600,  4000],
  pendente:  [2000,  0,     4800,  0,     7800,  3900],
};

const honorariosStatusMap = {
  'Pago':       { cls: 'pill--pago',      badgeCls: 's-badge--pago'      },
  'Pendente':   { cls: 'pill--pendente',  badgeCls: 's-badge--pendente'  },
  'Em atraso':  { cls: 'pill--atraso',    badgeCls: 's-badge--atraso'    },
  'Parcelado':  { cls: 'pill--parcelado', badgeCls: 's-badge--parcelado' },
};

function formatMoeda(v) {
  return 'R$ ' + v.toLocaleString('pt-BR');
}