import type { ResponseBuilder } from "@nokijs/server";

type APIError = {
  code: string;
  message: string;
  status: number;
};

export const errors = {
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    message: "User not found",
    status: 404,
  },
  USER_OR_EMAIL_ALREADY_EXISTS: {
    code: "USER_OR_EMAIL_ALREADY_EXISTS",
    message: "User or email already exists",
    status: 400,
  },
  INVALID_CREDENTIALS: {
    code: "INVALID_CREDENTIALS",
    message: "Invalid credentials",
    status: 400,
  },
  REFRESH_TOKEN_NOT_FOUND: {
    code: "REFRESH_TOKEN_NOT_FOUND",
    message: "Refresh token not found",
    status: 400,
  },
  REFRESH_TOKEN_INVALID: {
    code: "REFRESH_TOKEN_INVALID",
    message: "Refresh token is not valid",
    status: 400,
  },
  CODE_VERIFIER_INVALID: {
    code: "CODE_VERIFIER_INVALID",
    message: "Code verifier is not valid",
    status: 400,
  },
  GOOGLE_AUTH_FAILED: {
    code: "GOOGLE_AUTH_FAILED",
    message: "Google authentication failed",
    status: 400,
  },
} as const satisfies Record<string, APIError>;

export type ErrorCode = keyof typeof errors;

export function sendError(res: ResponseBuilder, error: ErrorCode) {
  const { code, message, status } = errors[error];
  return res.json({ code, message }, { status });
}
