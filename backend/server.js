import 'dotenv/config';
import app from './src/app.js';
import prisma from './src/lib/prisma.js'
import redis from './src/lib/redis.js'
import { v2 as cloudinary } from 'cloudinary'

const PORT = process.env.PORT || 3000;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const start = async () => {
  const statuses = {
    prisma: false,
    redis: false,
    cloudinary: false,
  }

  // Check Prisma (DB)
  try {
    await prisma.$connect()
    statuses.prisma = true
  } catch (err) {
    console.error('Prisma (DB) connection error:', err.message || err)
  }

  // Check Redis
  try {
    // redis client may already be connected on import; use ping to verify
    const pong = await redis.ping()
    statuses.redis = pong === 'PONG' || pong === 'pong'
  } catch (err) {
    console.error('Redis connection error:', err.message || err)
  }

  // Check Cloudinary
  try {
    const ping = await cloudinary.api.ping()
    statuses.cloudinary = !!ping
  } catch (err) {
    console.error('Cloudinary connection error:', err.message || err)
  }

  const statusLines = []
  statusLines.push(`Server starting on port ${PORT}`)
  statusLines.push(`DB (Prisma): ${statuses.prisma ? 'connected' : 'failed'}`)
  statusLines.push(`Redis: ${statuses.redis ? 'connected' : 'failed'}`)
  statusLines.push(`Cloudinary: ${statuses.cloudinary ? 'connected' : 'failed'}`)

  console.log(statusLines.join(' | '))

  app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})