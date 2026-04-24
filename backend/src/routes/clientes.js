import prisma from '../lib/prisma.js'

export default async function clienteRoutes(app) {
  const opts = { onRequest: [app.authenticate] }

  // Listar clientes do escritório
  app.get('/', opts, async (request) => {
    const { escritorioId } = request.user
    const { busca, tipo, ativo = 'true' } = request.query

    return prisma.cliente.findMany({
      where: {
        escritorioId,
        ativo: ativo === 'true',
        ...(tipo && { tipo }),
        ...(busca && {
          OR: [
            { nome: { contains: busca, mode: 'insensitive' } },
            { email: { contains: busca, mode: 'insensitive' } },
            { cpfCnpj: { contains: busca } }
          ]
        })
      },
      include: { _count: { select: { processos: true } } },
      orderBy: { nome: 'asc' }
    })
  })

  // Buscar cliente por ID
  app.get('/:id', opts, async (request, reply) => {
    const { escritorioId } = request.user
    const cliente = await prisma.cliente.findFirst({
      where: { id: request.params.id, escritorioId },
      include: {
        processos: {
          select: { id: true, titulo: true, numero: true, status: true, area: true }
        },
        lancamentos: {
          where: { status: 'PENDENTE' },
          select: { id: true, descricao: true, valor: true, tipo: true, dataVencimento: true }
        }
      }
    })
    if (!cliente) return reply.status(404).send({ error: 'Cliente não encontrado' })
    return cliente
  })

  // Criar cliente
  app.post('/', opts, async (request, reply) => {
    const { escritorioId } = request.user
    const { nome, tipo: tipoRaw, cpfCnpj, email, telefone, endereco, observacoes } = request.body
    const tipo = tipoRaw === 'PF' ? 'PESSOA_FISICA' : tipoRaw === 'PJ' ? 'PESSOA_JURIDICA' : tipoRaw

    if (!nome) return reply.status(400).send({ error: 'Nome obrigatório' })

    return reply.status(201).send(
      await prisma.cliente.create({
        data: { escritorioId, nome, tipo, cpfCnpj, email, telefone, endereco, observacoes }
      })
    )
  })

  // Atualizar cliente
  app.put('/:id', opts, async (request, reply) => {
    const { escritorioId } = request.user
    const existe = await prisma.cliente.findFirst({ where: { id: request.params.id, escritorioId } })
    if (!existe) return reply.status(404).send({ error: 'Cliente não encontrado' })

    return prisma.cliente.update({
      where: { id: request.params.id },
      data: request.body
    })
  })

  // Desativar cliente
  app.delete('/:id', opts, async (request, reply) => {
    const { escritorioId } = request.user
    const existe = await prisma.cliente.findFirst({ where: { id: request.params.id, escritorioId } })
    if (!existe) return reply.status(404).send({ error: 'Cliente não encontrado' })

    await prisma.cliente.update({ where: { id: request.params.id }, data: { ativo: false } })
    return { message: 'Cliente desativado' }
  })
}
