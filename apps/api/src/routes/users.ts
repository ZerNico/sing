import { groupRoutes } from "@nokijs/server";
import { baseRoute } from "../base";
import { verifyAuth } from "../middlewares/auth";
import { userService } from "../services/user";

const me = baseRoute.derive(verifyAuth()).get("/me", async ({ res, payload }) => {
  if (!payload) {
    return res.json({ code: "UNAUTHORIZED", message: "Unauthorized" }, { status: 401 });
  }

  const user = await userService.getById(payload.sub);

  if (!user) {
    return res.json({ code: "NOT_FOUND", message: "User not found" }, { status: 404 });
  }

  const { password, ...userWithoutPassword } = user;

  return res.json(userWithoutPassword);
});

export const usersRoutes = groupRoutes([me], { prefix: "/users" });
