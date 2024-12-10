import { ResponseBuilder, groupRoutes } from "@nokijs/server";
import type { InferSelectModel } from "drizzle-orm";
import * as v from "valibot";
import { baseRoute } from "../base";
import { config } from "../config";
import { authService } from "../services/auth";
import { userService } from "../services/user";

const register = baseRoute
  .body(
    v.object({
      username: v.pipe(v.string(), v.minLength(3), v.maxLength(20)),
      password: v.pipe(v.string(), v.minLength(3), v.maxLength(128)),
    }),
  )
  .post("/register", async ({ res, body }) => {
    const user = await authService.register(body);

    if (!user) {
      return res.json({ code: "USER_ALREADY_EXISTS", message: "User already exists" }, { status: 400 });
    }

    const accessToken = await authService.createAccessToken(user);
    const refreshToken = await authService.createRefreshToken(user);

    res.setCookie("refresh_token", refreshToken.token, {
      secure: true,
      sameSite: "strict",
      httpOnly: true,
      path: "/v1.0/auth/refresh",
      domain: `.${config.BASE_DOMAIN}`,
      expires: refreshToken.expiresAt,
    });
    res.setCookie("access_token", accessToken.token, {
      secure: true,
      sameSite: "strict",
      httpOnly: true,
      path: "/",
      domain: `.${config.BASE_DOMAIN}`,
      expires: accessToken.expiresAt,
    });

    return res.text("", { status: 201 });
  });

const login = baseRoute
  .body(
    v.object({
      username: v.pipe(v.string(), v.minLength(3), v.maxLength(20)),
      password: v.pipe(v.string(), v.minLength(3), v.maxLength(128)),
    }),
  )
  .post("/login", async ({ res, body }) => {
    const user = await authService.login(body);

    if (!user) {
      return res.json({ code: "INVALID_CREDENTIALS", message: "Invalid credentials" }, { status: 400 });
    }

    const accessToken = await authService.createAccessToken(user);
    const refreshToken = await authService.createRefreshToken(user);

    res.setCookie("refresh_token", refreshToken.token, {
      secure: true,
      sameSite: "strict",
      httpOnly: true,
      path: "/v1.0/auth/refresh",
      domain: `.${config.BASE_DOMAIN}`,
      expires: refreshToken.expiresAt,
    });
    res.setCookie("access_token", accessToken.token, {
      secure: true,
      sameSite: "strict",
      httpOnly: true,
      path: "/",
      domain: `.${config.BASE_DOMAIN}`,
      expires: accessToken.expiresAt,
    });

    return res.text("", { status: 201 });
  });

const refresh = baseRoute.post("/refresh", async ({ res, getCookie }) => {
  const refreshToken = getCookie("refresh_token");
  if (!refreshToken) {
    return res.json({ code: "REFRESH_TOKEN_NOT_FOUND", message: "Refresh token not found" }, { status: 400 });
  }

  const payload = await authService.verifyRefreshToken(refreshToken);
  if (!payload) {
    return res.json({ code: "REFRESH_TOKEN_INVALID", message: "Refresh token is not valid" }, { status: 400 });
  }

  const oldRefreshToken = await authService.findRefreshToken(refreshToken);
  if (!oldRefreshToken) {
    return res.json({ code: "REFRESH_TOKEN_NOT_FOUND", message: "Refresh token not found" }, { status: 400 });
  }

  const user = await userService.getById(payload.sub);

  if (!user) {
    return res.json({ code: "REFRESH_TOKEN_INVALID", message: "Refresh token is not valid" }, { status: 400 });
  }

  const accessToken = await authService.createAccessToken(user);
  const newRefreshToken = await authService.createRefreshToken(user);

  await authService.updateRefreshToken(oldRefreshToken.token, newRefreshToken.token, newRefreshToken.expiresAt);

  res.setCookie("refresh_token", newRefreshToken.token, {
    secure: true,
    sameSite: "strict",
    httpOnly: true,
    path: "/v1.0/auth/refresh",
    domain: `.${config.BASE_DOMAIN}`,
    expires: newRefreshToken.expiresAt,
  });
  res.setCookie("access_token", accessToken.token, {
    secure: true,
    sameSite: "strict",
    httpOnly: true,
    path: "/",
    domain: `.${config.BASE_DOMAIN}`,
    expires: accessToken.expiresAt,
  });

  return res.text("", { status: 201 });
});

export const authRoutes = groupRoutes([register, login, refresh], { prefix: "/auth" });
