import prisma from '../lib/prisma.js'

export default async function financeiroRoutes(app) {
  const opts =  onRequest: [app.authenticate] }: [app.authenticate] }

  app.get('/', opts, async (request) => {
    const { escritorioId } = request.user
    const { tipo, status, clienteId, processoId, inicio, fim } = request.query

    return prisma.lancamento.findMany({
      where: {
        escritorioId,
        ...(tipo && { tipo }),
        ...(status && { status }),
        ...(clienteId && { clienteId }),
        ...(processoId && { processoId }),
        ...(inicio && fim && {
          dataVencimento: { gte: new Date(inicio), lte: new Date(fim) }
        })
      },
      include: {
        cliente: { select: { id: true, nome: true } },
        processo: { select: { id: true, titulo: true, numero: true } }
      },
      orderBy: { dataVencimento: 'asc' }
    })
  })

  app.post('/', opts, async (request, reply) => {
    const { escritorioId, id: usuarioId } = request.user
    const { tipo, categoria, descricao, valor, dataVencimento, clienteId, processoId } = request.body

    if (!tipo || !descricao || !valor || !dataVencimento) {
      return reply.status(400).send({ error: 'Tipo, descrição, valor e vencimento são obrigatórios' })
    }

    return reply.status(201).send(
      await prisma.lancamento.create({
        data: {
          escritorioId, usuarioId, tipo, categoria: categoria || 'Geral',
          descricao, valor: parseFloat(valor),
          dataVencimento: new Date(dataVencimento),
          clienteId, processoId
        }
      })
    )
  })

  app.patch('/:id/pagar', opts, async (request, reply) => {
    const { escritorioId } = request.user
    const existe = await prisma.lancamento.findFirst({ where: { id: request.params.id, escritorioId } })
    if (!existe) return reply.status(404).send({ error: 'Lançamento não encontrado' })

    return prisma.lancamento.update({
      where: { id: request.params.id },
      data: { status: 'PAGO', dataPagamento: new Date() }
    })
  })

  app.delete('/:id', opts, async (request, reply) => {
    const { escritorioId } = request.user
    const existe = await prisma.lancamento.findFirst({ where: { id: request.params.id, escritorioId } })
    if (!existe) return reply.status(404).send({ error: 'Lançamento não encontrado' })

    await prisma.lancamento.update({ where: { id: request.params.id }, data: { status: 'CANCELADO' } })
    return { message: 'Lançamento cancelado' }
  })
}
