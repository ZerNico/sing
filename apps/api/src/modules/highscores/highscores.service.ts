import { and, eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "../../db/connection";
import { highscores, users } from "../../db/schema";

const { password, googleId, discordId, ...limitedUsersColumns } = getTableColumns(users);

class HighscoresService {
  async getHighscores(lobbyId: string, hash: string) {
    const scores = await db
      .select({
        ...getTableColumns(highscores),
        user: {
          ...limitedUsersColumns,
        },
      })
      .from(highscores)
      .innerJoin(users, eq(highscores.userId, users.id))
      .where(and(eq(highscores.hash, hash), eq(users.lobbyId, lobbyId)))
      .orderBy(highscores.score);

    return scores;
  }

  async createOrUpdateHighscore(hash: string, userId: number, score: number) {
    const [highscore] = await db
      .insert(highscores)
      .values({ hash, userId, score })
      .onConflictDoUpdate({
        target: [highscores.hash, highscores.userId],
        set: { score },
        setWhere: sql`${score} > ${highscores.score}`,
      });

    return highscore;
  }
}

export const highscoresService = new HighscoresService();
