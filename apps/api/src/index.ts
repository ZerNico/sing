import { Noki, groupRoutes } from "@nokijs/server";
import { corsRoute } from "./base";
import { authRoutes } from "./routes/auth";
import { usersRoutes } from "./routes/users";

const routes = groupRoutes([...authRoutes, ...usersRoutes, corsRoute], { prefix: "/v1.0" });

const noki = new Noki(routes);

const server = Bun.serve({
  fetch: noki.fetch,
  port: 3002,
});

console.log(`Listening on ${server.url}`);

export type App = typeof noki;
