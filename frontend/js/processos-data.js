// ============================================================
// NS Advocacia — Processos Data
// Busca processos reais do backend
// ============================================================

const statusMap = {
  // Status do backend
  'ATIVO':     { cls: 'pill--progress', label: 'Em andamento' },
  'ARQUIVADO': { cls: 'pill--waiting',  label: 'Arquivado'    },
  'ENCERRADO': { cls: 'pill--waiting',  label: 'Encerrado'    },
  'SUSPENSO':  { cls: 'pill--urgent',   label: 'Suspenso'     },
  // Compatibilidade com status antigos
  'Urgente':      { cls: 'pill--urgent',   label: 'Urgente'      },
  'Aguardando':   { cls: 'pill--waiting',  label: 'Aguardando'   },
  'Em andamento': { cls: 'pill--progress', label: 'Em andamento' },
};

let processosData = [];

async function carregarProcessosData(filtros = {}) {
  try {
    const params = new URLSearchParams();
    if (filtros.status)   params.append('status', filtros.status);
    if (filtros.busca)    params.append('busca', filtros.busca);
    if (filtros.clienteId) params.append('clienteId', filtros.clienteId);

    const query = params.toString();
    const dados = await Api.get(`/processos${query ? '?' + query : ''}`);
    if (!dados) return [];

    // Normaliza para o formato que processos.js já conhece
    processosData = dados.map(p => ({
      id:          p.id,
      num:         p.numero || '—',
      tipo:        p.titulo,
      cliente:     p.cliente?.nome || '—',
      resp:        p.advogados?.[0]?.usuario?.nome || '—',
      status:      p.status,
      prazo:       '—',
      prazoUrgente: p.status === 'SUSPENSO',
      vara:        p.vara || p.tribunal || '—',
      valor:       p.valorCausa ? `R$ ${Number(p.valorCausa).toLocaleString('pt-BR')}` : '—',
      fase:        '—',
      ajuizamento: p.dataDistribuicao
        ? new Date(p.dataDistribuicao).toLocaleDateString('pt-BR')
        : '—',
    }));

    // Atualiza contador
    const totalLabel = document.getElementById('total-label');
    if (totalLabel) totalLabel.textContent = `${processosData.length} processo${processosData.length !== 1 ? 's' : ''} encontrado${processosData.length !== 1 ? 's' : ''}`;

    const badgeProcessos = document.getElementById('badge-processos');
    if (badgeProcessos) badgeProcessos.textContent = processosData.length;

    return processosData;
  } catch (err) {
    console.error('Erro ao carregar processos:', err);
    return [];
  }
}

async function criarProcessoAPI(dados) {
  return Api.post('/processos', dados);
}

async function atualizarProcessoAPI(id, dados) {
  return Api.put(`/processos/${id}`, dados);
}