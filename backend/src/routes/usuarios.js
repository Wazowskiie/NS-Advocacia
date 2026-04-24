import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'

export default async function usuarioRoutes(app) {
  const opts = { onRequest: [app.authenticate] }

  app.get('/', opts, async (request) => {
    const { escritorioId } = request.user
    return prisma.usuario.findMany({
      where: { escritorioId },
      select: { id: true, nome: true, email: true, oab: true, cargo: true, ativo: true }
    })
  })

  app.post('/', opts, async (request, reply) => {
    const { escritorioId, cargo } = request.user
    if (cargo !== 'ADMIN') return reply.status(403).send({ error: 'Apenas admins podem criar usuários' })

    const { nome, email, senha, oab, cargo: novoCargo } = request.body
    const existe = await prisma.usuario.findUnique({ where: { email } })
    if (existe) return reply.status(409).send({ error: 'E-mail já cadastrado' })

    const senhaHash = await bcrypt.hash(senha, 10)
    return reply.status(201).send(
      await prisma.usuario.create({
        data: { escritorioId, nome, email, senha: senhaHash, oab, cargo: novoCargo || 'ADVOGADO' },
        select: { id: true, nome: true, email: true, cargo: true, oab: true }
      })
    )
  })

  app.put('/:id/senha', opts, async (request, reply) => {
    const { id } = request.user
    if (id !== request.params.id) return reply.status(403).send({ error: 'Sem permissão' })

    const { senhaAtual, novaSenha } = request.body
    const usuario = await prisma.usuario.findUnique({ where: { id } })
    const ok = await bcrypt.compare(senhaAtual, usuario.senha)
    if (!ok) return reply.status(400).send({ error: 'Senha atual incorreta' })

    await prisma.usuario.update({
      where: { id },
      data: { senha: await bcrypt.hash(novaSenha, 10) }
    })
    return { message: 'Senha atualizada' }
  })
}
