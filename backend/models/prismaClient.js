// backend/models/prismaClient.js
import { PrismaClient } from '@prisma/client'

// Create a new PrismaClient instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
})

// Test the connection on startup
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully')
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error)
  })

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma