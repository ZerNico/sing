import { groupRoutes } from "@nokijs/server";
import { baseRoute } from "../../base";
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

export const lobbiesRoutes = groupRoutes([createLobby], { prefix: "/lobbies" });
