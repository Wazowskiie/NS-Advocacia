import prisma from '../lib/prisma.js'

export default async function dashboardRoutes(app) {
  app.get('/', { onRequest: [app.authenticate] }, async (request) => {
    const { escritorioId } = request.user
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
    const proximos7dias = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000)

    const [
      totalProcessos,
      processosAtivos,
      totalClientes,
      prazosProximos,
      receitaMes,
      despesaMes,
      ultimosAndamentos,
      proximosEventos
    ] = await Promise.all([
      prisma.processo.count({ where: { escritorioId } }),
      prisma.processo.count({ where: { escritorioId, status: 'ATIVO' } }),
      prisma.cliente.count({ where: { escritorioId, ativo: true } }),
      prisma.evento.count({
        where: {
          escritorioId,
          tipo: 'PRAZO',
          concluido: false,
          dataInicio: { gte: hoje, lte: proximos7dias }
        }
      }),
      prisma.lancamento.aggregate({
        where: { escritorioId, tipo: 'RECEITA', status: 'PAGO', dataVencimento: { gte: inicioMes, lte: fimMes } },
        _sum: { valor: true }
      }),
      prisma.lancamento.aggregate({
        where: { escritorioId, tipo: 'DESPESA', status: 'PAGO', dataVencimento: { gte: inicioMes, lte: fimMes } },
        _sum: { valor: true }
      }),
      prisma.andamento.findMany({
        where: { processo: { escritorioId } },
        include: { processo: { select: { id: true, titulo: true } } },
        orderBy: { criadoEm: 'desc' },
        take: 5
      }),
      prisma.evento.findMany({
        where: { escritorioId, concluido: false, dataInicio: { gte: hoje } },
        include: { processo: { select: { id: true, titulo: true } } },
        orderBy: { dataInicio: 'asc' },
        take: 5
      })
    ])

    return {
      metricas: {
        totalProcessos,
        processosAtivos,
        totalClientes,
        prazosProximos,
        receitaMes: receitaMes._sum.valor || 0,
        despesaMes: despesaMes._sum.valor || 0,
        saldoMes: (receitaMes._sum.valor || 0) - (despesaMes._sum.valor || 0)
      },
      ultimosAndamentos,
      proximosEventos
    }
  })
}
