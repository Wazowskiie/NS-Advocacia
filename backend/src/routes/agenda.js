export default async function agendaRoutes(app) {
  app.get('/', { onRequest: [app.autenticar] }, async (req, reply) => {
    const { inicio, fim, usuarioId, tipo } = req.query
    const where = {
      ...(usuarioId ? { usuarioId } : { usuarioId: req.user.id }),
      ...(tipo && { tipo }),
      ...(inicio && fim && { dataInicio: { gte: new Date(inicio), lte: new Date(fim) } })
    }
    const compromissos = await app.prisma.compromisso.findMany({
      where, include: { processo: { select: { id: true, numero: true, titulo: true } }, usuario: { select: { id: true, nome: true } } },
      orderBy: { dataInicio: 'asc' }
    })
    return reply.send(compromissos)
  })

  app.post('/', { onRequest: [app.autenticar] }, async (req, reply) => {
    const comp = await app.prisma.compromisso.create({
      data: { ...req.body, usuarioId: req.body.usuarioId || req.user.id, dataInicio: new Date(req.body.dataInicio), dataFim: req.body.dataFim ? new Date(req.body.dataFim) : null }
    })
    return reply.code(201).send(comp)
  })

  app.put('/:id', { onRequest: [app.autenticar] }, async (req, reply) => {
    const comp = await app.prisma.compromisso.update({ where: { id: req.params.id }, data: req.body })
    return reply.send(comp)
  })

  app.delete('/:id', { onRequest: [app.autenticar] }, async (req, reply) => {
    await app.prisma.compromisso.delete({ where: { id: req.params.id } })
    return reply.send({ mensagem: 'Compromisso removido' })
  })
}
