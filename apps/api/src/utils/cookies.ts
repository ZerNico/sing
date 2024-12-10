
import type { ResponseBuilder } from "@nokijs/server";
import { config } from "../config";

type TokenInfo = {
  token: string;
  expiresAt: Date;
};

export function setAuthCookies(res: ResponseBuilder, accessToken: TokenInfo, refreshToken: TokenInfo) {
  const baseCookieOptions = {
    secure: true,
    sameSite: "strict" as const,
    httpOnly: true,
    domain: `.${config.BASE_DOMAIN}`,
  };

  res.setCookie("refresh_token", refreshToken.token, {
    ...baseCookieOptions,
    path: "/v1.0/auth/refresh",
    expires: refreshToken.expiresAt,
  });

  res.setCookie("access_token", accessToken.token, {
    ...baseCookieOptions,
    path: "/",
    expires: accessToken.expiresAt,
  });
}