import { groupRoutes } from "@nokijs/server";
import * as v from "valibot";
import { baseRoute } from "../../base";
import { requireLobby } from "../lobbies/lobbies.middlewares";
import { lobbiesService } from "../lobbies/lobbies.service";
import { highscoresService } from "./highscores.service";

const getHighscores = baseRoute.use(requireLobby).get("/:hash", async ({ res, payload, params }) => {
  const highscores = await highscoresService.getHighscores(payload.sub, params.hash);

  return res.json(highscores);
});

const createOrUpdateHighscore = baseRoute
  .use(requireLobby)
  .body(
    v.object({
      score: v.pipe(v.number(), v.transform(Math.floor), v.maxValue(100000)),
    }),
  )
  .put("/:hash/:userId", async ({ res, payload, params, body }) => {
    const lobby = await lobbiesService.getByIdWithUsers(payload.sub);
    if (!lobby) {
      return res.json({ code: "LOBBY_NOT_FOUND", message: "Lobby not found" }, { status: 404 });
    }

    const userId = Number.parseInt(params.userId);
    if (Number.isNaN(userId)) {
      return res.json({ code: "INVALID_USER_ID", message: "Invalid user ID" }, { status: 400 });
    }

    const user = lobby.users.find((user) => user.id === userId);
    if (!user) {
      return res.json({ code: "USER_NOT_IN_LOBBY", message: "User not in lobby" }, { status: 400 });
    }

    await highscoresService.createOrUpdateHighscore(params.hash, userId, body.score);

    return res.text("");
  });

export const highscoresRoutes = groupRoutes([getHighscores, createOrUpdateHighscore], {
  prefix: "/highscores",
});
