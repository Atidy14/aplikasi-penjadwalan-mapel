import { PrismaClient } from '@/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function makePrisma() {
  const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db')
  const url = `file:${dbPath.replace(/\\/g, '/')}`
  const adapter = new PrismaLibSql({ url })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? makePrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
