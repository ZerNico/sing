import path from "node:path";
import { groupRoutes } from "@nokijs/server";
import postgres from "postgres";
import * as v from "valibot";
import { baseRoute } from "../../base";
import { config } from "../../config";
import { authenticated, verified } from "../auth/auth.middlewares";
import { patchMeSchema } from "./users.models";
import { usersService } from "./users.service";

const getMe = baseRoute.use(authenticated).get("/me", async ({ res, payload }) => {
  const user = await usersService.getById(payload.sub);

  if (!user) {
    return res.json({ code: "USER_NOT_FOUND", message: "User not found" }, { status: 404 });
  }

  const { password, ...userWithoutPassword } = user;
  return res.json(userWithoutPassword);
});

const patchMe = baseRoute
  .use(verified)
  .body(patchMeSchema)
  .patch("/me", async ({ res, payload, body }) => {
    try {
      const { picture, ...rest } = body;

      if (picture) {
        await usersService.uploadPicture(payload.sub, picture);
      }

      const user = await usersService.update(payload.sub, rest);

      if (!user) {
        return res.json({ code: "USER_NOT_FOUND", message: "User not found" }, { status: 404 });
      }

      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof postgres.PostgresError && error.code === "23505") {
        return res.json(
          {
            code: "USER_OR_EMAIL_ALREADY_EXISTS",
            message: "User or email already exists",
          },
          { status: 400 },
        );
      }

      throw error;
    }
  });

const getPicture = baseRoute.get("/pictures/:path", async ({ res, params }) => {
  const picture = await usersService.getPicture(params.path);
  if (!picture) {
    return res.json({ code: "PICTURE_NOT_FOUND", message: "Picture not found" }, { status: 404 });
  }

  return new Response(picture.stream(), {
    headers: {
      "Content-Type": picture.type,
    },
  });
});

export const usersRoutes = groupRoutes([getMe, patchMe, getPicture], { prefix: "/users" });
