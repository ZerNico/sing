import { groupRoutes } from "@nokijs/server";
import { authRoute } from "../base";
import { userService } from "../services/user";
import { sendError } from "../utils/errors";

const me = authRoute.get("/me", async ({ res, payload }) => {
  const user = await userService.getById(payload.sub);

  if (!user) {
    return sendError(res, "USER_NOT_FOUND");
  }

  const { password, ...userWithoutPassword } = user;
  return res.json(userWithoutPassword);
});

export const usersRoutes = groupRoutes([me], { prefix: "/users" });
