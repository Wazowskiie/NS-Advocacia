const HOURS    = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const HOUR_H   = 64; // px por hora — deve bater com .time-slot height no CSS
const DIAS     = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES    = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

// dia: 0=Seg, 1=Ter, 2=Qua, 3=Qui, 4=Sex, 5=Sáb, 6=Dom (relativo à semana atual)
const eventosData = [
  { id:1,  titulo:'Audiência — TRT 2ª Região',   sub:'Maria Fernanda Costa',      tipo:'audiencia', resp:'Rafael Silva',    dia:0, hIni:9,  hFim:10.5 },
  { id:2,  titulo:'Reunião com cliente',          sub:'Construtora Viva S.A.',     tipo:'reuniao',   resp:'Rafael Silva',    dia:1, hIni:14, hFim:15   },
  { id:3,  titulo:'Protocolo de petição',         sub:'Ação Trabalhista #0012345', tipo:'protocolo', resp:'Rafael Silva',    dia:1, hIni:16, hFim:16.5 },
  { id:4,  titulo:'Prazo — Contestação',          sub:'Indenização Civil',         tipo:'prazo',     resp:'Beatriz Mendes',  dia:2, hIni:9,  hFim:9.5  },
  { id:5,  titulo:'Reunião de equipe',            sub:'Escritório',                tipo:'tarefa',    resp:'Rafael Silva',    dia:2, hIni:10, hFim:11   },
  { id:6,  titulo:'Audiência — 3ª Vara Cível',   sub:'Construtora Viva S.A.',     tipo:'audiencia', resp:'Rafael Silva',    dia:3, hIni:14, hFim:16   },
  { id:7,  titulo:'Prazo recursal',               sub:'Ação de Cobrança',          tipo:'prazo',     resp:'Beatriz Mendes',  dia:4, hIni:9,  hFim:9.5  },
  { id:8,  titulo:'Reunião — Ana Paula',          sub:'Revisão Contratual',        tipo:'reuniao',   resp:'Thiago Carvalho', dia:4, hIni:15, hFim:16   },
  { id:9,  titulo:'Protocolo digital',            sub:'Usucapião Urbano',          tipo:'protocolo', resp:'Beatriz Mendes',  dia:5, hIni:11, hFim:11.5 },
  { id:10, titulo:'Atualizar pasta do processo',  sub:'Dano Moral',                tipo:'tarefa',    resp:'Rafael Silva',    dia:5, hIni:16, hFim:17   },
];

const tipoClass = {
  audiencia: 'ev-audiencia',
  reuniao:   'ev-reuniao',
  prazo:     'ev-prazo',
  protocolo: 'ev-protocolo',
  tarefa:    'ev-tarefa',
};