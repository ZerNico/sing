import { groupRoutes } from "@nokijs/server";
import { withQuery } from "ufo";
import { baseRoute } from "../../base";
import { config } from "../../config";
import { authService } from "./oauth.service";

const googleAuthUrl = baseRoute.get("/google/url", async ({ res, query }) => {
  const auth = authService.getGoogleAuthUrl();
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

export const oauthRoutes = groupRoutes([googleAuthUrl], {prefix: "/oauth"});