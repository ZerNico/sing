import { groupRoutes } from "@nokijs/server";
import { baseRoute } from "../../base";
import { verified } from "../auth/auth.middlewares";
import { usersService } from "./users.service";

const me = baseRoute.use(verified).get("/me", async ({ res, payload }) => {
  const user = await usersService.getById(payload.sub);

  if (!user) {
    return res.json({ code: "USER_NOT_FOUND", message: "User not found" }, { status: 404 });
  }

  const { password, ...userWithoutPassword } = user;
  return res.json(userWithoutPassword);
});

export const usersRoutes = groupRoutes([me], { prefix: "/users" });
