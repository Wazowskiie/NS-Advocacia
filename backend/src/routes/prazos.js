export default async function prazosRoutes(app) {
  app.get('/', { onRequest: [app.autenticar] }, async (req, reply) => {
    const { status, prioridade, processoId, vencendo } = req.query
    const where = {
      ...(status && { status }), ...(prioridade && { prioridade }), ...(processoId && { processoId }),
      ...(vencendo === 'true' && { dataLimite: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, status: 'PENDENTE' })
    }
    const prazos = await app.prisma.prazo.findMany({ where, include: { processo: { select: { id: true, numero: true, titulo: true } } }, orderBy: { dataLimite: 'asc' } })
    return reply.send(prazos)
  })

  app.post('/', { onRequest: [app.autenticar] }, async (req, reply) => {
    const prazo = await app.prisma.prazo.create({ data: { ...req.body, dataLimite: new Date(req.body.dataLimite) } })
    return reply.code(201).send(prazo)
  })

  app.put('/:id', { onRequest: [app.autenticar] }, async (req, reply) => {
    const prazo = await app.prisma.prazo.update({ where: { id: req.params.id }, data: req.body })
    return reply.send(prazo)
  })

  app.delete('/:id', { onRequest: [app.autenticar] }, async (req, reply) => {
    await app.prisma.prazo.delete({ where: { id: req.params.id } })
    return reply.send({ mensagem: 'Prazo removido' })
  })
}
