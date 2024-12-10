import { groupRoutes } from "@nokijs/server";
import { authRoute } from "../base";

import { userService } from "../services/user";

const me = authRoute.get("/me", async ({ res, payload }) => {
  const user = await userService.getById(payload.sub);

  if (!user) {
    return res.json({ code: "NOT_FOUND", message: "User not found" }, { status: 404 });
  }

  const { password, ...userWithoutPassword } = user;
  return res.json(userWithoutPassword);
});

export const usersRoutes = groupRoutes([me], { prefix: "/users" });
