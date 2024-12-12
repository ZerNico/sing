import { groupRoutes } from "@nokijs/server";
import { withQuery } from "ufo";
import * as v from "valibot";
import { baseRoute } from "../../base";
import { config } from "../../config";
import { authService } from "../../services/auth";
import { oauthService } from "../../services/oauth";
import { userService } from "../../services/user";
import { setAuthCookies } from "../../utils/cookies";
import { sendError } from "../../utils/errors";

const url = baseRoute.get("", async ({ res, query }) => {
  const auth = oauthService.googleAuthUrl();
  const url = withQuery(auth.url.href, query);

  res.setCookie("google_code_verifier", auth.codeVerifier, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
    domain: `.${config.BASE_DOMAIN}`,
    path: "/",
  });

  return res.json({ url: url });
});

const callback = baseRoute
  .body(
    v.object({
      code: v.string(),
    }),
  )
  .post("/callback", async ({ getCookie, res, body }) => {
    const codeVerifier = getCookie("google_code_verifier");
    res.deleteCookie("google_code_verifier", {
      domain: `.${config.BASE_DOMAIN}`,
      path: "/",
    });

    if (!codeVerifier) {
      return sendError(res, "CODE_VERIFIER_INVALID");
    }

    const googleResponse = await oauthService.verifyGoogleCode(body.code, codeVerifier);

    if (!googleResponse.user || !googleResponse.user.email_verified) {
      return sendError(res, "GOOGLE_AUTH_FAILED");
    }

    let user = await userService.getByGoogleId(googleResponse.user.sub);

    if (!user) {
      user = await userService.getByEmail(googleResponse.user.email);
      if (user) {
        user = await oauthService.mergeGoogleUser(user, googleResponse.user);
      } else {
        user = await oauthService.createUserFromGoogle(googleResponse.user);
      }
    }

    if (!user) {
      return sendError(res, "GOOGLE_AUTH_FAILED");
    }

    const accessToken = await authService.createAccessToken(user);
    const refreshToken = await authService.createRefreshToken(user);

    setAuthCookies(res, accessToken, refreshToken);
    return res.text("", { status: 200 });
  });

export const googleAuthRoutes = groupRoutes([url, callback], { prefix: "/google" });
