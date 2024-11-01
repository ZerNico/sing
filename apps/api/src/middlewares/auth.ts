import { authService } from "../services/auth";

export function verifyAuth() {
  return async ({ headers }: { headers: Record<string, string> }) => {
    if (!headers.authorization) {
      return {
        payload: null,
      };
    }

    const [type, token] = headers.authorization.split(" ");

    if (type?.toLowerCase() !== "bearer" || !token) {
      return {
        payload: null,
      };
    }

    const payload = await authService.verifyJwt(token);

    return { payload: payload };
  };
}
