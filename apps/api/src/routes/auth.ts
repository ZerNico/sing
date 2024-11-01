import { groupRoutes } from "@nokijs/server";
import * as v from "valibot";
import { baseRoute } from "../base";
import { authService } from "../services/auth";

const register = baseRoute
  .body(
    v.object({
      username: v.pipe(v.string(), v.minLength(3), v.maxLength(20)),
      password: v.pipe(v.string(), v.minLength(3), v.maxLength(128)),
    }),
  )
  .post("/register", async ({ res, body }) => {
    const user = await authService.register(body);

    if (!user) {
      return res.json({ code: "USER_ALREADY_EXISTS", message: "User already exists" }, { status: 400 });
    }

    const jwt = await authService.createJwt(user);

    return res.json({ jwt });
  });

const login = baseRoute
  .body(
    v.object({
      username: v.pipe(v.string(), v.minLength(3), v.maxLength(20)),
      password: v.pipe(v.string(), v.minLength(3), v.maxLength(128)),
    }),
  )
  .post("/login", async ({ res, body }) => {
    const user = await authService.login(body);

    if (!user) {
      return res.json({ code: "INVALID_CREDENTIALS", message: "Invalid credentials" }, { status: 400 });
    }

    const jwt = await authService.createJwt(user);

    return res.json({ jwt });
  });

export const authRoutes = groupRoutes([register, login], { prefix: "/auth" });
