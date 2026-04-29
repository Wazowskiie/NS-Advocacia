import prisma from '../lib/prisma.js'

export default async function processoRoutes(app) {
  const opts =  onRequest: [app.authenticate] }: [app.authenticate] }

  app.get('/', opts, async (request) => {
    const { escritorioId } = request.user
    const { busca, status, area, clienteId } = request.query

    return prisma.processo.findMany({
      where: {
        escritorioId,
        ...(status && { status }),
        ...(area && { area }),
        ...(clienteId && { clienteId }),
        ...(busca && {
          OR: [
            { titulo: { contains: busca, mode: 'insensitive' } },
            { numero: { contains: busca } }
          ]
        })
      },
      include: {
        cliente: { select: { id: true, nome: true } },
        advogados: {
          include: { usuario: { select: { id: true, nome: true } } }
        },
        _count: { select: { andamentos: true, documentos: true } }
      },
      orderBy: { criadoEm: 'desc' }
    })
  })

  app.get('/:id', opts, async (request, reply) => {
    const { escritorioId } = request.user
    const processo = await prisma.processo.findFirst({
      where: { id: request.params.id, escritorioId },
      include: {
        cliente: true,
        advogados: { include: { usuario: { select: { id: true, nome: true, oab: true } } } },
        andamentos: { orderBy: { data: 'desc' } },
        documentos: { orderBy: { criadoEm: 'desc' } },
        eventos: { where: { dataInicio: { gte: new Date() } }, orderBy: { dataInicio: 'asc' } }
      }
    })
    if (!processo) return reply.status(404).send({ error: 'Processo não encontrado' })
    return processo
  })

  app.post('/', opts, async (request, reply) => {
    const { escritorioId, id: usuarioId } = request.user
    const { titulo, clienteId, area, numero, tribunal, vara, comarca, valorCausa, dataDistribuicao, descricao, advogadosIds = [] } = request.body

    if (!titulo || !clienteId || !area) {
      return reply.status(400).send({ error: 'Título, cliente e área são obrigatórios' })
    }

    return reply.status(201).send(
      await prisma.processo.create({
        data: {
          escritorioId, titulo, clienteId, area, numero, tribunal, vara, comarca,
          valorCausa, dataDistribuicao: dataDistribuicao ? new Date(dataDistribuicao) : null,
          descricao,
          advogados: {
            create: [
              { usuarioId, principal: true },
              ...advogadosIds.filter(id => id !== usuarioId).map(id => ({ usuarioId: id, principal: false }))
            ]
          }
        },
        include: { cliente: { select: { id: true, nome: true } }, advogados: true }
      })
    )
  })

  app.put('/:id', opts, async (request, reply) => {
    const { escritorioId } = request.user
    const existe = await prisma.processo.findFirst({ where: { id: request.params.id, escritorioId } })
    if (!existe) return reply.status(404).send({ error: 'Processo não encontrado' })

    const { advogadosIds, ...data } = request.body
    return prisma.processo.update({ where: { id: request.params.id }, data })
  })

  // Adicionar andamento
  app.post('/:id/andamentos', opts, async (request, reply) => {
    const { escritorioId } = request.user
    const existe = await prisma.processo.findFirst({ where: { id: request.params.id, escritorioId } })
    if (!existe) return reply.status(404).send({ error: 'Processo não encontrado' })

    return reply.status(201).send(
      await prisma.andamento.create({
        data: {
          processoId: request.params.id,
          descricao: request.body.descricao,
          data: request.body.data ? new Date(request.body.data) : new Date(),
          origem: request.body.origem || 'manual'
        }
      })
    )
  })
}
