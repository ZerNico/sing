import { groupRoutes } from "@nokijs/server";
import * as v from "valibot";
import { baseRoute } from "../../base";
import { rateLimit } from "../../utils/rate-limit";
import { usersService } from "../users/users.service";
import { authenticated } from "./auth.middlewares";
import { loginSchema, registerSchema } from "./auth.models";
import { authService } from "./auth.service";
import { clearAuthCookies, setAuthCookies } from "./auth.utils";

const register = baseRoute
  .use(rateLimit({ max: 5, window: 60, generateKey: (ctx) => ctx.headers["x-forwarded-for"] ?? "anonymous" }))
  .body(registerSchema)
  .post("/register", async ({ res, body }) => {
    const user = await authService.register(body);

    if (!user) {
      return res.json(
        {
          code: "USER_OR_EMAIL_ALREADY_EXISTS",
          message: "User or email already exists",
        },
        { status: 400 },
      );
    }

    await authService.sendVerificationEmail(user);

    const { accessToken, refreshToken } = await authService.createTokens(user);

    setAuthCookies(res, accessToken, refreshToken);
    return res.text("", { status: 201 });
  });

const login = baseRoute
  .use(rateLimit({ max: 5, window: 60, generateKey: (ctx) => ctx.headers["x-forwarded-for"] ?? "anonymous" }))
  .body(loginSchema)
  .post("/login", async ({ res, body }) => {
    const user = await authService.login(body);

    if (!user) {
      return res.json(
        {
          code: "INVALID_CREDENTIALS",
          message: "Invalid credentials",
        },
        { status: 400 },
      );
    }

    const { accessToken, refreshToken } = await authService.createTokens(user);

    setAuthCookies(res, accessToken, refreshToken);
    return res.text("", { status: 200 });
  });

const logout = baseRoute.use(authenticated).post("/logout", async ({ res, getCookie }) => {
  const refreshToken = getCookie("refresh_token");
  if (refreshToken) {
    const payload = await authService.verifyRefreshToken(refreshToken);
    if (payload) {
      await authService.removeRefreshToken(refreshToken, payload.sub);
    }
  }

  clearAuthCookies(res);

  return res.text("", { status: 200 });
});

const refresh = baseRoute.post("/refresh", async ({ res, getCookie }) => {
  const oldRefreshToken = getCookie("refresh_token");

  if (!oldRefreshToken) {
    return res.json(
      {
        code: "INVALID_REFRESH_TOKEN",
        message: "Invalid refresh token",
      },
      { status: 401 },
    );
  }

  const tokens = await authService.rotateTokens(oldRefreshToken);

  if (!tokens) {
    return res.json(
      {
        code: "INVALID_REFRESH_TOKEN",
        message: "Invalid refresh token",
      },
      { status: 401 },
    );
  }

  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  return res.text("", { status: 200 });
});

const resend = baseRoute.use(authenticated).post("/resend", async ({ res, payload }) => {
  if (payload.emailVerified) {
    return res.json(
      {
        code: "EMAIL_ALREADY_VERIFIED",
        message: "Email already verified",
      },
      { status: 400 },
    );
  }
  const user = await usersService.getById(payload.sub);

  if (!user) {
    return res.json(
      {
        code: "USER_NOT_FOUND",
        message: "User not found",
      },
      { status: 404 },
    );
  }

  const result = await authService.sendVerificationEmail(user);

  if (result?.rateLimited) {
    return res.json(
      {
        code: "RESEND_RATE_LIMITED",
        message: "Too many requests",
        retryAfter: result.expiresAt.toISOString(),
      } as const,
      { status: 429 },
    );
  }

  return res.text("", { status: 200 });
});

const verify = baseRoute
  .use(rateLimit({ max: 5, window: 60, generateKey: (ctx) => ctx.headers["x-forwarded-for"] ?? "anonymous" }))
  .body(v.object({ code: v.pipe(v.string(), v.length(8)) }))
  .use(authenticated)
  .post("/verify", async ({ res, payload, body, getCookie }) => {
    if (payload.emailVerified) {
      return res.json(
        {
          code: "EMAIL_ALREADY_VERIFIED",
          message: "Email already verified",
        },
        { status: 400 },
      );
    }

    const oldRefreshToken = getCookie("refresh_token");

    if (!oldRefreshToken) {
      return res.json(
        {
          code: "INVALID_REFRESH_TOKEN",
          message: "Invalid refresh token",
        },
        { status: 401 },
      );
    }

    const user = await authService.verifyEmail(payload.sub, body.code);

    if (!user) {
      return res.json(
        {
          code: "INVALID_CODE",
          message: "Invalid code",
        },
        { status: 400 },
      );
    }

    const tokens = await authService.rotateTokens(oldRefreshToken);

    if (!tokens) {
      return res.json(
        {
          code: "INVALID_REFRESH_TOKEN",
          message: "Invalid refresh token",
        },
        { status: 401 },
      );
    }

    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return res.text("", { status: 200 });
  });

const requestPasswordReset = baseRoute
  .use(rateLimit({ max: 5, window: 60, generateKey: (ctx) => ctx.headers["x-forwarded-for"] ?? "anonymous" }))
  .body(
    v.object({
      email: v.pipe(v.string(), v.email(), v.maxLength(128)),
    }),
  )
  .post("/request-reset", async ({ res, body }) => {
    const result = await authService.sendPasswordResetEmail(body.email);

    if (result.notFound) {
      // Return success even if user not found to prevent email enumeration
      return res.text("", { status: 200 });
    }

    if (result.rateLimited) {
      return res.json(
        {
          code: "RESET_RATE_LIMITED",
          message: "Too many requests",
          retryAfter: result.expiresAt.toISOString(),
        } as const,
        { status: 429 },
      );
    }

    return res.text("", { status: 200 });
  });

const resetPassword = baseRoute
  .use(rateLimit({ max: 5, window: 60, generateKey: (ctx) => ctx.headers["x-forwarded-for"] ?? "anonymous" }))
  .body(
    v.object({
      code: v.pipe(v.string(), v.length(8)),
      password: v.pipe(v.string(), v.minLength(6), v.maxLength(128)),
    }),
  )
  .post("/reset", async ({ res, body }) => {
    const result = await authService.resetPassword(body.code, body.password);

    if (result.invalidCode) {
      return res.json(
        {
          code: "INVALID_CODE",
          message: "Invalid code",
        },
        { status: 400 },
      );
    }

    if (result.userNotFound) {
      return res.json(
        {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
        { status: 404 },
      );
    }

    return res.text("", { status: 200 });
  });

export const authRoutes = groupRoutes(
  [register, login, resend, verify, refresh, logout, requestPasswordReset, resetPassword],
  { prefix: "/auth" },
);
