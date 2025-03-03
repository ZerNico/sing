import { Noki, groupRoutes } from "@nokijs/server";

import { preflightRoute } from "./base";
import { authRoutes } from "./modules/auth/auth.controller";
import { highscoresRoutes } from "./modules/highscores/highscores.controller";
import { lobbiesRoutes } from "./modules/lobbies/lobbies.controller";
import { oauthRoutes } from "./modules/oauth/oauth.controller";
import { usersRoutes } from "./modules/users/users.controller";

const routes = groupRoutes([...authRoutes, ...usersRoutes, ...oauthRoutes, ...lobbiesRoutes, ...highscoresRoutes, preflightRoute], {
  prefix: "/v1.0",
});

const noki = new Noki(routes);

const server = Bun.serve({
  fetch: noki.fetch,
  port: 3002,
});

console.log(`Listening on ${server.url}`);

export type App = typeof noki;
