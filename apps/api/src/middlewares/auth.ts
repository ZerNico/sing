import type { BaseContext } from "@nokijs/server";
import { authService } from "../services/auth";

export function withUser() {
  return async ({ getCookie }: BaseContext) => {
    const accessToken = getCookie("access_token");

    if (!accessToken) {
      return;
    }

    const payload = await authService.verifyAccessToken(accessToken);

    return { payload };
  };
}

export function requireUser() {
  return async ({ payload, res }: BaseContext & { payload: unknown }) => {
    if (!payload) {
      return res.json({ code: "UNAUTHORIZED", message: "Unauthorized" }, { status: 401 });
    }
  };
}
