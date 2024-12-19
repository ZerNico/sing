import { groupRoutes } from "@nokijs/server";
import postgres from "postgres";
import { baseRoute } from "../../base";
import { verified } from "../auth/auth.middlewares";
import { patchMeSchema } from "./users.models";
import { usersService } from "./users.service";

const getMe = baseRoute.use(verified).get("/me", async ({ res, payload }) => {
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
      const user = await usersService.update(payload.sub, body);

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

export const usersRoutes = groupRoutes([getMe, patchMe], { prefix: "/users" });
