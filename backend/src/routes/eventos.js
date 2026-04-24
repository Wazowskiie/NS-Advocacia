import prisma from '../lib/prisma.js'

export default async function eventoRoutes(app) {
  const opts = { onRequest: [app.authenticate] }

  app.get('/', opts, async (request) => {
    const { escritorioId, id: usuarioId } = request.user
    const { inicio, fim, tipo } = request.query

    return prisma.evento.findMany({
      where: {
        escritorioId,
        ...(tipo && { tipo }),
        ...(inicio && fim && {
          dataInicio: { gte: new Date(inicio), lte: new Date(fim) }
        })
      },
      include: {
        usuario: { select: { id: true, nome: true } },
        processo: { select: { id: true, titulo: true, numero: true } }
      },
      orderBy: { dataInicio: 'asc' }
    })
  })

  app.post('/', opts, async (request, reply) => {
    const { escritorioId, id: usuarioId } = request.user
    const { titulo, tipo, dataInicio, dataFim, local, descricao, processoId } = request.body

    if (!titulo || !tipo || !dataInicio) {
      return reply.status(400).send({ error: 'Título, tipo e data são obrigatórios' })
    }

    return reply.status(201).send(
      await prisma.evento.create({
        data: {
          escritorioId, usuarioId, titulo, tipo,
          dataInicio: new Date(dataInicio),
          dataFim: dataFim ? new Date(dataFim) : null,
          local, descricao, processoId
        },
        include: { processo: { select: { id: true, titulo: true } } }
      })
    )
  })

  app.patch('/:id/concluir', opts, async (request, reply) => {
    const { escritorioId } = request.user
    const existe = await prisma.evento.findFirst({ where: { id: request.params.id, escritorioId } })
    if (!existe) return reply.status(404).send({ error: 'Evento não encontrado' })

    return prisma.evento.update({ where: { id: request.params.id }, data: { concluido: true } })
  })

  app.delete('/:id', opts, async (request, reply) => {
    const { escritorioId } = request.user
    const existe = await prisma.evento.findFirst({ where: { id: request.params.id, escritorioId } })
    if (!existe) return reply.status(404).send({ error: 'Evento não encontrado' })

    await prisma.evento.delete({ where: { id: request.params.id } })
    return { message: 'Evento removido' }
  })
}
