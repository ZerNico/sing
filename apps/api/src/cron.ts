import { Cron } from 'croner'
import { prisma } from './prisma'

export const startCron = () => {
  // every hour
  Cron('0 * * * *', async () => {
    console.log('cron job ran')

    // delete all lobbies that are older than 7 days
    await prisma.lobby.deleteMany({
      where: {
        createdAt: {
          lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    })
  })
}
