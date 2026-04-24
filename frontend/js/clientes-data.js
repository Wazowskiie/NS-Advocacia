// ============================================================
// NS Advocacia — Clientes Data
// Busca clientes reais do backend
// ============================================================

const tipoMap = {
  PF:            { label: "Pessoa Física",   cls: "badge-pf" },
  PJ:            { label: "Pessoa Jurídica", cls: "badge-pj" },
  PESSOA_FISICA:  { label: "Pessoa Física",   cls: "badge-pf" },
  PESSOA_JURIDICA:{ label: "Pessoa Jurídica", cls: "badge-pj" },
};

const statusProcMap = {
  "Urgente":      { cls: "pill--urgent",   bg: "#fdf0ef", color: "#c0392b" },
  "Aguardando":   { cls: "pill--waiting",  bg: "#fdf6ec", color: "#c07a20" },
  "Em andamento": { cls: "pill--progress", bg: "#e8f5ee", color: "#2d7a52" },
  "ATIVO":        { cls: "pill--progress", bg: "#e8f5ee", color: "#2d7a52" },
  "ARQUIVADO":    { cls: "pill--waiting",  bg: "#fdf6ec", color: "#c07a20" },
  "ENCERRADO":    { cls: "pill--waiting",  bg: "#fdf6ec", color: "#c07a20" },
  "SUSPENSO":     { cls: "pill--urgent",   bg: "#fdf0ef", color: "#c0392b" },
};

const cores = ["#2d5a3d","#3d5a7a","#7a6a3d","#5a3d6a","#3d6a5a","#6a3d3d","#6a5a3d","#4a5a6a"];

let clientesData = [];

function gerarIniciais(nome) {
  const partes = nome.trim().split(" ").filter(Boolean);
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function corAleatoria(index) {
  return cores[index % cores.length];
}

async function carregarClientesData(filtros = {}) {
  try {
    const params = new URLSearchParams();
    if (filtros.busca) params.append('busca', filtros.busca);
    if (filtros.tipo)  params.append('tipo', filtros.tipo);

    const query = params.toString();
    const dados = await Api.get(`/clientes${query ? '?' + query : ''}`);
    if (!dados) return [];

    clientesData = dados.map((c, i) => ({
      id:       c.id,
      nome:     c.nome,
      iniciais: gerarIniciais(c.nome),
      cor:      corAleatoria(i),
      tipo:     c.tipo === 'PESSOA_JURIDICA' ? 'PJ' : 'PF',
      vip:      false,
      telefone: c.telefone || '—',
      email:    c.email || '—',
      doc:      c.cpfCnpj || '—',
      endereco: c.endereco || '—',
      resp:     '—',
      processos: c._count?.processos || 0,
      valor:    '—',
      desde:    new Date(c.criadoEm).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      processosLista: [],
    }));

    // Atualiza contador
    const totalLabel = document.getElementById('total-label');
    if (totalLabel) totalLabel.textContent = `${clientesData.length} cliente${clientesData.length !== 1 ? 's' : ''} ativo${clientesData.length !== 1 ? 's' : ''}`;

    return clientesData;
  } catch (err) {
    console.error('Erro ao carregar clientes:', err);
    return [];
  }
}

async function criarClienteAPI(dados) {
  return Api.post('/clientes', dados);
}