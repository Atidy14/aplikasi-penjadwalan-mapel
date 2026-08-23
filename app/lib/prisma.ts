import { PrismaClient } from '@/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'
import fs from 'fs'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function getDatabaseUrl(): string {
  // Jika user menyetel DATABASE_URL eksternal (misal PostgreSQL/Turso/dll)
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')) {
    return process.env.DATABASE_URL
  }

  // Jika berjalan di lingkungan Vercel / AWS Lambda (Read-Only filesystem kecuali /tmp)
  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db'
    const sourceDbPath = path.join(process.cwd(), 'prisma', 'dev.db')

    // Salin starter database (beserta data dummy) ke /tmp agar dapat dimutasi/ditulis
    if (!fs.existsSync(tmpDbPath)) {
      try {
        if (fs.existsSync(sourceDbPath)) {
          fs.copyFileSync(sourceDbPath, tmpDbPath)
        }
      } catch (err) {
        console.error('Gagal menyalin database ke /tmp:', err)
      }
    }
    return `file:${tmpDbPath}`
  }

  // Lingkungan lokal biasa (Windows/Mac/Linux)
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
  return `file:${dbPath.replace(/\\/g, '/')}`
}

function makePrisma() {
  const url = getDatabaseUrl()
  const adapter = new PrismaLibSql({ url })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? makePrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
