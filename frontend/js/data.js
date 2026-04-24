// ============================================================
// NS Advocacia — Data
// Substitui array mockado por chamadas reais à API
// ============================================================

// Mapeamento de status do backend para o visual do frontend
const statusMap = {
  'ATIVO':     { cls: 'pill--progress', label: 'Em andamento' },
  'ARQUIVADO': { cls: 'pill--waiting',  label: 'Arquivado'    },
  'ENCERRADO': { cls: 'pill--waiting',  label: 'Encerrado'    },
  'SUSPENSO':  { cls: 'pill--urgent',   label: 'Suspenso'     },
  // Compatibilidade com os status antigos do frontend
  'Urgente':      { cls: 'pill--urgent',   label: 'Urgente'      },
  'Aguardando':   { cls: 'pill--waiting',  label: 'Aguardando'   },
  'Em andamento': { cls: 'pill--progress', label: 'Em andamento' },
};

// Processos em memória (cache da sessão)
let processos = [];

async function carregarProcessos(filtros = {}) {
  try {
    const params = new URLSearchParams(filtros).toString();
    const dados = await Api.get(`/processos${params ? '?' + params : ''}`);
    if (!dados) return [];

    // Normaliza para o formato que o render.js já conhece
    processos = dados.map(p => ({
      id:          p.id,
      tipo:        p.titulo,
      numero:      p.numero || '—',
      cliente:     p.cliente?.nome || '—',
      status:      p.status,
      prazo:       _formatarPrazo(p),
      prazoUrgente: p.status === 'SUSPENSO',
      area:        p.area,
    }));

    return processos;
  } catch (err) {
    console.error('Erro ao carregar processos:', err);
    return [];
  }
}

async function criarProcesso(dados) {
  return Api.post('/processos', dados);
}

async function atualizarProcesso(id, dados) {
  return Api.put(`/processos/${id}`, dados);
}

function _formatarPrazo(processo) {
  // Pega o próximo evento de prazo vinculado ao processo
  const hoje = new Date();
  // Por ora retorna traço — será enriquecido quando integrarmos agenda
  return '—';
}
