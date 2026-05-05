import prisma from '../lib/prisma.js'

export default async function custasRoutes(app) {
  const opts = { onRequest: [app.authenticate] }

  app.get('/', opts, async (request) => {
    const { escritorioId } = request.user
    const { status, clienteId, processoId } = request.query
    return prisma.lancamento.findMany({
      where: {
        escritorioId,
        tipo: 'DESPESA',
        ...(status && { status }),
        ...(clienteId && { clienteId }),
        ...(processoId && { processoId }),
      },
      include: {
        cliente:  { select: { id: true, nome: true } },
        processo: { select: { id: true, titulo: true, numero: true } }
      },
      orderBy: { dataVencimento: 'desc' }
    })
  })

  app.get('/:id', opts, async (request, reply) => {
    const { escritorioId } = request.user
    const custa = await prisma.lancamento.findFirst({
      where: { id: request.params.id, escritorioId, tipo: 'DESPESA' },
      include: {
        cliente: { select: { id: true, nome: true, telefone: true, email: true } },
        processo: { select: { id: true, titulo: true, numero: true, vara: true, tribunal: true } }
      }
    })
    if (!custa) return reply.status(404).send({ error: 'Custa não encontrada' })
    return custa
  })

  app.post('/', opts, async (request, reply) => {
    const { escritorioId, id: usuarioId } = request.user
    const { tipo, valor, status, data, descricao, clienteId, processoId, clienteNome, processoTitulo } = request.body
    if (!valor || !tipo) {
      return reply.status(400).send({ error: 'Tipo e valor são obrigatórios' })
    }
    let resolvedClienteId = clienteId
    if (!resolvedClienteId && clienteNome) {
      let cliente = await prisma.cliente.findFirst({
        where: { escritorioId, nome: { equals: clienteNome, mode: 'insensitive' } }
      })
      if (!cliente) {
        cliente = await prisma.cliente.create({ data: { escritorioId, nome: clienteNome } })
      }
      resolvedClienteId = cliente.id
    }
    let resolvedProcessoId = processoId
    if (!resolvedProcessoId && processoTitulo) {
      const processo = await prisma.processo.findFirst({
        where: { escritorioId, titulo: { contains: processoTitulo, mode: 'insensitive' } }
      })
      if (processo) resolvedProcessoId = processo.id
    }
    return reply.status(201).send(
      await prisma.lancamento.create({
        data: {
          escritorioId,
          usuarioId,
          tipo: 'DESPESA',
          categoria: tipo,
          descricao: descricao || tipo,
          valor: parseFloat(valor),
          dataVencimento: data ? new Date(data) : new Date(),
          status: status || 'PENDENTE',
          clienteId: resolvedClienteId,
          processoId: resolvedProcessoId,
        },
        include: {
          cliente:  { select: { id: true, nome: true } },
          processo: { select: { id: true, titulo: true, numero: true } }
        }
      })
    )
  })

  app.patch('/:id', opts, async (request, reply) => {
    const { escritorioId } = request.user
    const existe = await prisma.lancamento.findFirst({
      where: { id: request.params.id, escritorioId, tipo: 'DESPESA' }
    })
    if (!existe) return reply.status(404).send({ error: 'Custa não encontrada' })
    const { status, valor, categoria, dataVencimento } = request.body
    return prisma.lancamento.update({
      where: { id: request.params.id },
      data: {
        ...(status && { status }),
        ...(valor && { valor: parseFloat(valor) }),
        ...(categoria && { categoria }),
        ...(dataVencimento && { dataVencimento: new Date(dataVencimento) }),
        ...(status === 'PAGO' && { dataPagamento: new Date() }),
      }
    })
  })

  app.delete('/:id', opts, async (request, reply) => {
    const { escritorioId } = request.user
    const existe = await prisma.lancamento.findFirst({
      where: { id: request.params.id, escritorioId, tipo: 'DESPESA' }
    })
    if (!existe) return reply.status(404).send({ error: 'Custa não encontrada' })
    await prisma.lancamento.delete({ where: { id: request.params.id } })
    return { message: 'Custa excluída' }
  })
}