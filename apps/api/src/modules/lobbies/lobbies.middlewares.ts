import { RouteBuilder } from "@nokijs/server";
import { authService } from "../auth/auth.service";
import { lobbiesService } from "./lobbies.service";

const withLobbyPayload = new RouteBuilder().derive(async ({ headers }) => {
  const authHeader = headers.authorization;
  const lobbyToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!lobbyToken) {
    return;
  }

  const payload = await lobbiesService.verifyLobbyToken(lobbyToken);
  if (payload) {
    return { payload };
  }
});

export const requireLobby = withLobbyPayload
  .before(({ payload, res }) => {
    if (!payload) {
      return res.json({ code: "UNAUTHORIZED", message: "Unauthorized" }, { status: 401 });
    }
  })
  .derive(({ payload }) => {
    return {
      // biome-ignore lint/style/noNonNullAssertion: Payload is guaranteed to be defined
      payload: payload!,
    };
  });

export const withLobbyOrUserPayload = new RouteBuilder().derive(async ({ getCookie, headers }) => {
  const accessToken = getCookie("access_token");
  const authHeader = headers.authorization;
  const lobbyToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!accessToken && !lobbyToken) {
    return;
  }

  if (accessToken) {
    const payload = await authService.verifyAccessToken(accessToken);
    if (payload) {
      return { payload };
    }
  }

  if (lobbyToken) {
    const payload = await lobbiesService.verifyLobbyToken(lobbyToken);
    if (payload) {
      return { payload };
    }
  }
});

export const requireLobbyOrUser = withLobbyOrUserPayload
  .before(({ payload, res }) => {
    if (!payload) {
      return res.json({ code: "UNAUTHORIZED", message: "Unauthorized" }, { status: 401 });
    }
  })
  .derive(({ payload }) => {
    return {
      // biome-ignore lint/style/noNonNullAssertion: Payload is guaranteed to be defined
      payload: payload!,
    };
  });

export const requireLobbyOrVerifiedUser = requireLobbyOrUser.before(({ payload, res }) => {
  if (payload.type === "access" && !payload.emailVerified) {
    return res.json({ code: "EMAIL_NOT_VERIFIED", message: "Email not verified" }, { status: 403 });
  }
}); 