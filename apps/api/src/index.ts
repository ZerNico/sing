import { Noki, groupRoutes } from "@nokijs/server";

import { preflightRoute } from "./base";
import { authRoutes } from "./modules/auth/auth.controller";
import { usersRoutes } from "./modules/users/users.controller";

const routes = groupRoutes([...authRoutes, ...usersRoutes, preflightRoute], { prefix: "/v1.0" });

const noki = new Noki(routes);

const server = Bun.serve({
  fetch: noki.fetch,
  port: 3002,
});

console.log(`Listening on ${server.url}`);

export type App = typeof noki;
