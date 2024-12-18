import { groupRoutes } from "@nokijs/server";
import { withQuery } from "ufo";
import * as v from "valibot";
import { baseRoute } from "../../base";
import { config } from "../../config";
import { authService } from "../auth/auth.service";
import { setAuthCookies } from "../auth/auth.utils";
import { usersService } from "../users/users.service";
import { oAuthService } from "./oauth.service";
const googleAuthUrl = baseRoute.get("/google/url", async ({ res, query }) => {
  const auth = oAuthService.getGoogleAuthUrl();
  const url = withQuery(auth.url.href, query);

  res.setCookie("google_code_verifier", auth.codeVerifier, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    domain: config.BASE_DOMAIN,
    path: "/v1.0/oauth/google/callback",
  });

  res.setCookie("google_state", auth.state, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    domain: config.BASE_DOMAIN,
    path: "/v1.0/oauth/google/callback",
  });

  return res.json({ url });
});

const googleCallback = baseRoute
  .body(v.object({ code: v.string(), state: v.string() }))
  .post("/google/callback", async ({ res, getCookie, body }) => {
    const codeVerifier = getCookie("google_code_verifier");
    res.deleteCookie("google_code_verifier", {
      domain: `.${config.BASE_DOMAIN}`,
      path: "/v1.0/oauth/google/callback",
    });
    const state = getCookie("google_state");
    res.deleteCookie("google_state", {
      domain: `.${config.BASE_DOMAIN}`,
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
      return res.json({ code: "INVALID_CODE_VERIFIER", message: "Invalid code verifier" }, { status: 400 });
    }

    const profile = await oAuthService.getGoogleProfile(tokens.accessToken());
    if (!profile) {
      return res.json({ code: "INVALID_CODE_VERIFIER", message: "Invalid code verifier" }, { status: 400 });
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

export const oauthRoutes = groupRoutes([googleAuthUrl, googleCallback], { prefix: "/oauth" });
