import { groupRoutes } from "@nokijs/server";
import { withQuery } from "ufo";
import * as v from "valibot";
import { baseRoute } from "../../base";
import { config } from "../../config";
import { authService } from "../auth/auth.service";
import { setAuthCookies } from "../auth/auth.utils";
import { usersService } from "../users/users.service";
import { oAuthService } from "./oauth.service";

const googleAuthUrl = baseRoute.get("/google/url", async ({ res }) => {
  const auth = oAuthService.getGoogleAuthUrl();

  res.setCookie("google_code_verifier", auth.codeVerifier, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    domain: config.COOKIE_DOMAIN,
    path: "/v1.0/oauth/google/callback",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // 1 day
  });

  res.setCookie("google_state", auth.state, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    domain: config.COOKIE_DOMAIN,
    path: "/v1.0/oauth/google/callback",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // 1 day
  });

  return res.json({ url: auth.url.href });
});

const googleCallback = baseRoute
  .body(v.object({ code: v.string(), state: v.string() }))
  .post("/google/callback", async ({ res, getCookie, body }) => {
    const codeVerifier = getCookie("google_code_verifier");
    res.deleteCookie("google_code_verifier", {
      domain: config.COOKIE_DOMAIN,
      path: "/v1.0/oauth/google/callback",
    });
    const state = getCookie("google_state");
    res.deleteCookie("google_state", {
      domain: config.COOKIE_DOMAIN,
      path: "/v1.0/oauth/google/callback",
    });

    if (!codeVerifier) {
      return res.json({ code: "INVALID_CODE_VERIFIER", message: "Invalid code verifier" }, { status: 400 });
    }

    if (!state || body.state !== state) {
      return res.json({ code: "INVALID_OR_MISSING_STATE", message: "Invalid or missing state" }, { status: 400 });
    }

    const tokens = await oAuthService.verifyGoogleCallback(body.code, codeVerifier);
    if (!tokens) {
      return res.json({ code: "INVALID_CODE", message: "Invalid code" }, { status: 400 });
    }

    const profile = await oAuthService.getGoogleProfile(tokens.accessToken());
    if (!profile) {
      return res.json({ code: "GOOGLE_PROFILE_NOT_FOUND", message: "Google profile not found" }, { status: 400 });
    }

    if (!profile.email_verified) {
      return res.json({ code: "GOOGLE_EMAIL_NOT_VERIFIED", message: "Google Email not verified" }, { status: 400 });
    }

    let user = await usersService.getByGoogleId(profile.sub);

    if (!user) {
      user = await usersService.getByEmail(profile.email);
      if (user) {
        if (!user.emailVerified) {
          return res.json({ code: "EMAIL_NOT_VERIFIED", message: "Email not verified" }, { status: 400 });
        }

        user = await oAuthService.mergeGoogleProfile(user, profile);
      } else {
        user = await oAuthService.createUserFromGoogleProfile(profile);
      }
    }

    if (!user) {
      return res.json({ code: "GOOGLE_USER_NOT_CREATED", message: "Google user not created" }, { status: 400 });
    }

    const { accessToken, refreshToken } = await authService.createTokens(user);
    setAuthCookies(res, accessToken, refreshToken);
    return res.text("", { status: 200 });
  });

const discordAuthUrl = baseRoute.get("/discord/url", async ({ res, query }) => {
  const auth = oAuthService.getDiscordAuthUrl();
  const url = withQuery(auth.url.href, query);

  res.setCookie("discord_code_verifier", auth.codeVerifier, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    domain: config.COOKIE_DOMAIN,
    path: "/v1.0/oauth/discord/callback",
  });

  res.setCookie("discord_state", auth.state, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    domain: config.COOKIE_DOMAIN,
    path: "/v1.0/oauth/discord/callback",
  });

  return res.json({ url });
});

const discordCallback = baseRoute
  .body(v.object({ code: v.string(), state: v.string() }))
  .post("/discord/callback", async ({ res, getCookie, body }) => {
    const codeVerifier = getCookie("discord_code_verifier");
    res.deleteCookie("discord_code_verifier", {
      domain: config.COOKIE_DOMAIN,
      path: "/v1.0/oauth/discord/callback",
    });

    const state = getCookie("discord_state");
    res.deleteCookie("discord_state", {
      domain: config.COOKIE_DOMAIN,
      path: "/v1.0/oauth/discord/callback",
    });

    if (!codeVerifier) {
      return res.json({ code: "INVALID_CODE_VERIFIER", message: "Invalid code verifier" }, { status: 400 });
    }

    if (!state || body.state !== state) {
      return res.json({ code: "INVALID_OR_MISSING_STATE", message: "Invalid or missing state" }, { status: 400 });
    }

    const tokens = await oAuthService.verifyDiscordCallback(body.code, codeVerifier);
    if (!tokens) {
      return res.json({ code: "INVALID_CODE_VERIFIER", message: "Invalid code verifier" }, { status: 400 });
    }

    const profile = await oAuthService.getDiscordProfile(tokens.accessToken());
    if (!profile) {
      return res.json({ code: "DISCORD_PROFILE_NOT_FOUND", message: "Discord profile not found" }, { status: 400 });
    }

    if (!profile.verified) {
      return res.json({ code: "DISCORD_EMAIL_NOT_VERIFIED", message: "Discord Email not verified" }, { status: 400 });
    }

    let user = await usersService.getByDiscordId(profile.id);

    if (!user) {
      user = await usersService.getByEmail(profile.email);
      if (user) {
        if (!user.emailVerified) {
          return res.json({ code: "EMAIL_NOT_VERIFIED", message: "Email not verified" }, { status: 400 });
        }

        user = await oAuthService.mergeDiscordProfile(user, profile);
      } else {
        user = await oAuthService.createUserFromDiscordProfile(profile);
      }
    }

    if (!user) {
      return res.json({ code: "DISCORD_USER_NOT_CREATED", message: "Discord user not created" }, { status: 400 });
    }

    const { accessToken, refreshToken } = await authService.createTokens(user);
    setAuthCookies(res, accessToken, refreshToken);
    return res.text("", { status: 200 });
  });

export const oauthRoutes = groupRoutes([googleAuthUrl, googleCallback, discordAuthUrl, discordCallback], {
  prefix: "/oauth",
});
