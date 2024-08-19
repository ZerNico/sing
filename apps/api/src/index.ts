import { Noki, groupRoutes } from "@nokijs/server";
import { authRoutes } from "./routes/auth";

const routes = groupRoutes([...authRoutes], { prefix: "/api" });

const noki = new Noki({
  routes,
});

const server = Bun.serve({
  fetch: noki.fetch,
});

console.log(`Listening on ${server.url}`);
