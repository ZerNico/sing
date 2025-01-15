import type { ResponseBuilder } from "@nokijs/server";
import { config } from "../../config";

type TokenInfo = {
  token: string;
  expiresAt: Date;
};

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";
const ACCESS_STATE_COOKIE = "auth_token_state";
const REFRESH_STATE_COOKIE = "refresh_token_state";

export function setAuthCookies(res: ResponseBuilder, accessToken: TokenInfo, refreshToken: TokenInfo) {
  const baseCookieOptions = {
    secure: true,
    sameSite: "lax" as const,
    domain: config.COOKIE_DOMAIN,
  };

  // Set httpOnly token cookies
  res.setCookie(REFRESH_COOKIE, refreshToken.token, {
    ...baseCookieOptions,
    httpOnly: true,
    path: "/",
    expires: refreshToken.expiresAt,
  });

  res.setCookie(ACCESS_COOKIE, accessToken.token, {
    ...baseCookieOptions,
    httpOnly: true,
    path: "/",
    expires: accessToken.expiresAt,
  });

  // Set frontend-readable state cookies
  res.setCookie(REFRESH_STATE_COOKIE, "true", {
    ...baseCookieOptions,
    path: "/",
    expires: refreshToken.expiresAt,
  });

  res.setCookie(ACCESS_STATE_COOKIE, "true", {
    ...baseCookieOptions,
    path: "/",
    expires: accessToken.expiresAt,
  });
}

export function clearAuthCookies(res: ResponseBuilder) {
  const baseCookieOptions = {
    domain: config.COOKIE_DOMAIN,
  };

  res.deleteCookie(REFRESH_COOKIE, {
    ...baseCookieOptions,
    path: "/",
  });

  res.deleteCookie(ACCESS_COOKIE, {
    ...baseCookieOptions,
    path: "/",
  });

  res.deleteCookie(REFRESH_STATE_COOKIE, {
    ...baseCookieOptions,
    path: "/",
  });

  res.deleteCookie(ACCESS_STATE_COOKIE, {
    ...baseCookieOptions,
    path: "/",
  });
}
