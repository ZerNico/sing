import { RouteBuilder } from "@nokijs/server";
import { SchemaError } from "@standard-schema/utils";
import { config } from "./config";
import { cors } from "./utils/cors";
import { csrf } from "./utils/csrf";
import { rateLimit } from "./utils/rate-limit";
import { flattenIssues } from "./utils/validation";

export const baseRoute = new RouteBuilder()
  .use(
    cors({
      origin: [config.APP_URL, "http://localhost:1420"],
      credentials: true,
      allowHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(rateLimit({ max: 100, window: 60, generateKey: (ctx) => ctx.headers["x-forwarded-for"] ?? "anonymous" }))
  .use(csrf({ allowedOrigins: [config.APP_URL, "http://localhost:1420"] }))
  .error((error, { res }) => {
    if (error instanceof SchemaError) {
      const flattened = flattenIssues(error.issues);

      return res.json(
        {
          code: "VALIDATION_ERROR",
          error: flattened,
        } as const,
        {
          status: 400,
        },
      );
    }

    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

    return res.json(
      {
        error: errorMessage,
        code: "UNKNOWN_ERROR",
      },
      {
        status: 500,
      },
    );
  });

export const preflightRoute = baseRoute.options("*", ({ res }) => {
  return res.text("");
});
