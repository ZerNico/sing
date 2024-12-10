import { groupRoutes } from "@nokijs/server";
import * as v from "valibot";
import { baseRoute } from "../base";
import { authService } from "../services/auth";
import { setAuthCookies } from "../utils/cookies";
import { sendError } from "../utils/errors";

const credentialsSchema = v.object({
  username: v.pipe(v.string(), v.minLength(3), v.maxLength(20)),
  password: v.pipe(v.string(), v.minLength(3), v.maxLength(128)),
});

const register = baseRoute
  .body(credentialsSchema)
  .post("/register", async ({ res, body }) => {
    const user = await authService.register(body);
    if (!user) {
      return sendError(res, "USER_ALREADY_EXISTS");
    }

    const accessToken = await authService.createAccessToken(user);
    const refreshToken = await authService.createRefreshToken(user);
    
    setAuthCookies(res, accessToken, refreshToken);
    return res.text("", { status: 201 });
  });

const login = baseRoute
  .body(credentialsSchema)
  .post("/login", async ({ res, body }) => {
    const user = await authService.login(body);
    if (!user) {
      return sendError(res, "INVALID_CREDENTIALS");
    }

    const accessToken = await authService.createAccessToken(user);
    const refreshToken = await authService.createRefreshToken(user);

    setAuthCookies(res, accessToken, refreshToken);
    return res.text("", { status: 201 });
  });

const refresh = baseRoute.post("/refresh", async ({ res, getCookie }) => {
  const refreshToken = getCookie("refresh_token");
  if (!refreshToken) {
    return sendError(res, "REFRESH_TOKEN_NOT_FOUND");
  }

  const tokens = await authService.rotateTokens(refreshToken);
  if (!tokens) {
    return sendError(res, "REFRESH_TOKEN_INVALID");
  }

  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  return res.text("", { status: 201 });
});

export const authRoutes = groupRoutes([register, login, refresh], { prefix: "/auth" });
