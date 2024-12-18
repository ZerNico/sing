import { RouteBuilder } from "@nokijs/server";
import * as v from "valibot";

export const baseRoute = new RouteBuilder()
  .before(({ res }) => {
    res.headers.set("Access-Control-Allow-Origin", "https://app.tuneperfect.localhost");
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  })
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
