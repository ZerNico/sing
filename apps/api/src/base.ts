import { RouteBuilder } from "@nokijs/server";
import * as v from "valibot";
import { config } from "./config";
import { cors } from "./utils/cors";
import { csrf } from "./utils/csrf";
import { rateLimit } from "./utils/rate-limit";

export const baseRoute = new RouteBuilder()
  .use(
    cors({
      origin: `https://app.${config.BASE_DOMAIN}`,
      credentials: true,
      allowHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(rateLimit({ max: 100, window: 60, generateKey: (ctx) => ctx.raw.headers.get("x-forwarded-for") ?? "anonymous" }))
  .use(csrf({ allowedOrigins: [`https://app.${config.BASE_DOMAIN}`] }))
  .error((error, { res }) => {
    if (error instanceof v.ValiError) {
      const flattened = v.flatten(error.issues);

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
        type: "error",
        error: errorMessage,
      },
      {
        status: 500,
      },
    );
  });

export const preflightRoute = baseRoute.options("*", ({ res }) => {
  return res.text("");
});
