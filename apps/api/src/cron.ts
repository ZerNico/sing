import { Cron } from 'croner'
import { prisma } from './prisma'

export const startCron = () => {
  // every hour
  Cron('* * * * *', async () => {
    // delete all lobbies that are older than 7 days
    await prisma.lobby
      .deleteMany({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      })
      .catch((e) => {
        console.error('Cron delete failed', e)
      })
  })
}
