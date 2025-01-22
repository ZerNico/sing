import { groupRoutes } from "@nokijs/server";
import { baseRoute } from "../../base";
import { verified } from "../auth/auth.middlewares";
import { lobbiesService } from "./lobbies.service";

const createLobby = baseRoute.post("", async ({ res }) => {
  const lobby = await lobbiesService.createLobby();

  if (!lobby) {
    return res.json(
      {
        code: "LOBBY_CREATION_FAILED",
        message: "Failed to create lobby",
      },
      { status: 500 },
    );
  }

  const lobbyToken = await lobbiesService.createLobbyToken(lobby.id);

  return res.json({ lobby, token: lobbyToken.token });
});

const joinLobby = baseRoute.use(verified).post("/:lobbyId/join", async ({ res, payload, params }) => {
  const lobby = lobbiesService.getById(params.lobbyId);

  if (!lobby) {
    return res.json({ code: "LOBBY_NOT_FOUND", message: "Lobby not found" }, { status: 404 });
  }

  await lobbiesService.joinLobby(params.lobbyId, payload.sub);

  return res.text("");
});

export const lobbiesRoutes = groupRoutes([createLobby, joinLobby], { prefix: "/lobbies" });
