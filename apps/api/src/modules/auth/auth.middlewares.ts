import { RouteBuilder } from "@nokijs/server";
import { authService } from "./auth.service";

export const withPayload = new RouteBuilder().derive(async ({ getCookie }) => {
  const accessToken = getCookie("access_token");

  if (!accessToken) {
    return;
  }
  const payload = await authService.verifyAccessToken(accessToken);

  return { payload };
});

export const authenticated = withPayload
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

export const verified = authenticated.before(({ payload, res }) => {
  if (!payload.emailVerified) {
    return res.json({ code: "EMAIL_NOT_VERIFIED", message: "Email not verified" }, { status: 403 });
  }
});
