import { groupRoutes } from "@nokijs/server";
import * as v from "valibot";
import { baseRoute } from "../base";

const register = baseRoute
  .body(
    v.object({
      username: v.pipe(v.string(), v.minLength(3), v.maxLength(20)),
      password: v.pipe(v.string(), v.minLength(3), v.maxLength(20)),
    }),
  )
  .post("/register", async ({ res, authService, body }) => {
    const user = await authService.register(body);

    console.log(user);

    return res.text("Register");
  });

const test = baseRoute.get("/test", async ({ res, test }) => {
  console.log(123, test);
  

  return res.text("Test");
});

export const authRoutes = groupRoutes([register, test], { prefix: "/auth" });
