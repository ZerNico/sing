import { RouteBuilder } from "@nokijs/server";
import * as v from "valibot";
import { authService } from "./services/auth";
import { db } from "./services/db";

export const baseRoute = new RouteBuilder()
  .derive(() => {
    return {
      db,
      authService,
    };
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
        },
      );
    }

    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

    return res.json({
      type: "error",
      error: errorMessage,
    });
  });
