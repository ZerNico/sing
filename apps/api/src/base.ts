import { RouteBuilder } from "@nokijs/server";
import * as v from "valibot";
import { withUser } from "./middlewares/auth";
import { authService } from "./services/auth";
import { db } from "./services/db";

export const baseRoute = new RouteBuilder()
  .derive(() => {
    return {
      db,
      authService,
    };
  })
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
          type: "validation",
          error: flattened,
        },
        {
          status: 400,
        } as const,
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

export const authRoute = baseRoute
  .derive(withUser())
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

export const corsRoute = baseRoute.options("*", ({ res }) => {
  return res.text("");
});
