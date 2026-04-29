import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'

export default async function authRoutes(app) {
  // POST /auth/register — cria escritório + admin
  app.post('/register', async (request, reply) => {
    const { nomeEscritorio, nome, email, senha, oab } = request.body

    if (!nomeEscritorio || !nome || !email || !senha) {
      return reply.status(400).send({ error: 'Campos obrigatórios faltando' })
    }

    const emailExiste = await prisma.usuario.findUnique({ where: { email } })
    if (emailExiste) return reply.status(409).send({ error: 'E-mail já cadastrado' })

    const senhaHash = await bcrypt.hash(senha, 10)

    const escritorio = await prisma.escritorio.create({
      data: {
        nome: nomeEscritorio,
        usuarios: {
          create: {
            nome,
            email,
            senha: senhaHash,
            oab,
            cargo: 'ADMIN'
          }
        }
      },
      include: { usuarios: true }
    })

    const usuario = escritorio.usuarios[0]
    const token = app.jwt.sign(
      { id: usuario.id, escritorioId: escritorio.id, cargo: usuario.cargo },
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    return reply.status(201).send({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, cargo: usuario.cargo },
      escritorio: { id: escritorio.id, nome: escritorio.nome }
    })
  })

  // POST /auth/login
  app.post('/login', async (request, reply) => {
    const { email, senha } = request.body

    if (!email || !senha) return reply.status(400).send({ error: 'E-mail e senha obrigatórios' })

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { escritorio: true }
    })

    if (!usuario || !usuario.ativo) return reply.status(401).send({ error: 'Credenciais inválidas' })

    const senhaOk = await bcrypt.compare(senha, usuario.senha)
    if (!senhaOk) return reply.status(401).send({ error: 'Credenciais inválidas' })

    const token = app.jwt.sign(
      { id: usuario.id, escritorioId: usuario.escritorioId, cargo: usuario.cargo },
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        oab: usuario.oab
      },
      escritorio: {
        id: usuario.escritorio.id,
        nome: usuario.escritorio.nome
      }
    }
  })

  // GET /auth/me — dados do usuário logado
  aapp.get('/me', { onRequest: [app.authenticate] }, async (request) => {
    const usuario = await prisma.usuario.findUnique({
      where: { id: request.user.id },
      select: {
        id: true, nome: true, email: true,
        cargo: true, oab: true,
        escritorio: { select: { id: true, nome: true } }
      }
    })
    return usuario
  })
}
