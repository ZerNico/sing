import { groupRoutes } from "@nokijs/server";
import { baseRoute } from "../../base";
import { rateLimit } from "../../utils/rate-limit";
import { verified } from "../auth/auth.middlewares";
import { requireLobby, requireLobbyOrVerifiedUser } from "./lobbies.middlewares";
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

const joinLobby = baseRoute
  .use(rateLimit({ max: 5, window: 60, generateKey: (ctx) => ctx.headers["x-forwarded-for"] ?? "anonymous" }))
  .use(verified)
  .post("/:lobbyId/join", async ({ res, payload, params }) => {
    const lobby = await lobbiesService.getById(params.lobbyId);

    if (!lobby) {
      return res.json({ code: "LOBBY_NOT_FOUND", message: "Lobby not found" }, { status: 404 });
    }

    await lobbiesService.joinLobby(params.lobbyId, payload.sub);

    return res.text("");
  });

const getCurrentLobby = baseRoute.use(requireLobbyOrVerifiedUser).get("/current", async ({ res, payload }) => {
  if (payload.type === "access") {
    const lobby = await lobbiesService.getByUserIdWithUsers(payload.sub);

    if (!lobby) {
      return res.json({ code: "LOBBY_NOT_FOUND", message: "Lobby not found" }, { status: 404 });
    }

    return res.json(lobby);
  }

  const lobby = await lobbiesService.getByIdWithUsers(payload.sub);

  if (!lobby) {
    return res.json({ code: "LOBBY_NOT_FOUND", message: "Lobby not found" }, { status: 404 });
  }

  return res.json(lobby);
});

const deleteCurrentLobby = baseRoute.use(requireLobby).delete("/current", async ({ res, payload }) => {
  await lobbiesService.deleteLobby(payload.sub);

  return res.text("");
});

const leaveLobby = baseRoute.use(verified).post("/leave", async ({ res, payload }) => {
  await lobbiesService.leaveLobby(payload.sub);
  
  return res.text("");
});

export const lobbiesRoutes = groupRoutes([createLobby, joinLobby, getCurrentLobby, leaveLobby, deleteCurrentLobby], {
  prefix: "/lobbies",
});
