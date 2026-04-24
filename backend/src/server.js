import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

// Routes
import authRoutes from './routes/auth.js'
import usuarioRoutes from './routes/usuarios.js'
import clienteRoutes from './routes/clientes.js'
import processoRoutes from './routes/processos.js'
import eventoRoutes from './routes/eventos.js'
import financeiroRoutes from './routes/financeiro.js'
import dashboardRoutes from './routes/dashboard.js'

const app = Fastify({ logger: true })

// Plugins
await app.register(cors, {
  origin: true,
  credentials: true
})

await app.register(jwt, {
  secret: process.env.JWT_SECRET
})

// Decorator de autenticação
app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send({ error: 'Token inválido ou expirado' })
  }
})

// Rotas
app.register(authRoutes, { prefix: '/auth' })
app.register(usuarioRoutes, { prefix: '/usuarios' })
app.register(clienteRoutes, { prefix: '/clientes' })
app.register(processoRoutes, { prefix: '/processos' })
app.register(eventoRoutes, { prefix: '/eventos' })
app.register(financeiroRoutes, { prefix: '/financeiro' })
app.register(dashboardRoutes, { prefix: '/dashboard' })

// Health check
app.get('/health', () => ({ status: 'ok', version: '1.0.0' }))

// Start
const PORT = process.env.PORT || 3333
try {
  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`🚀 LexDesk API rodando na porta ${PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
