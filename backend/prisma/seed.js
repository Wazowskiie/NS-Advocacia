import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Populando banco de dados...')

  const senhaHash = await bcrypt.hash('123456', 10)

  const escritorio = await prisma.escritorio.create({
    data: {
      nome: 'Escritório Exemplo Advocacia',
      email: 'contato@escritorio.com',
      usuarios: {
        create: {
          nome: 'Dr. Admin',
          email: 'admin@escritorio.com',
          senha: senhaHash,
          oab: 'OAB/CE 12345',
          cargo: 'ADMIN'
        }
      }
    },
    include: { usuarios: true }
  })

  console.log('✅ Escritório criado:', escritorio.nome)
  console.log('✅ Usuário admin: admin@escritorio.com / senha: 123456')
  console.log('🚀 Seed concluído!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
