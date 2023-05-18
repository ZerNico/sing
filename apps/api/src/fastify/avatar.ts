import { FastifyInstance } from 'fastify'
import { prisma } from '../prisma'

export const registerAvatarRoutes = (server: FastifyInstance) => {
  server.get('/api/avatar/:id', async (req, res) => {
    const { id } = req.params as { id: string }

    const avatar = await prisma.avatar.findUnique({
      where: {
        userId: id,
      },
    })

    if (!avatar) {
      res.status(404)
      return {
        error: 'Avatar not found',
      }
    }

    res.status(200)
    res.header('Content-Type', avatar.mime)
    res.send(avatar.file)
  })
}
