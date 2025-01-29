import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";

import "./app.css";
import "@fontsource/lato/300.css";
import "@fontsource/lato/400.css";
import "@fontsource/lato/700.css";

import App from "./app";

import AuthLayout, { LobbyLayout, NoLobbyLayout } from "./layouts/auth";
import NoAuthLayout from "./layouts/no-auth";
import IndexPage from "./routes/auth";
import CompleteProfilePage from "./routes/auth/complete-profile";
import EditProfilePage from "./routes/auth/edit-profile";
import EditPasswordPage from "./routes/auth/edit-profile/password";
import JoinDirectPage from "./routes/auth/join/[code]";
import JoinPage from "./routes/auth/join/index";
import DiscordCallbackPage from "./routes/no-auth/auth/discord-callback";
import GoogleCallbackPage from "./routes/no-auth/auth/google-callback";
import LoginPage from "./routes/no-auth/sign-in";
import RegisterPage from "./routes/no-auth/sign-up";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error("Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?");
}

render(
  () => (
    <Router root={App}>
      <Route path="/" component={AuthLayout}>
        <Route path="/" component={LobbyLayout}>
          <Route path="/" component={IndexPage} />
        </Route>

        <Route path="/" component={NoLobbyLayout}>
          <Route path="/join" component={JoinPage} />
          <Route path="/join/:code" component={JoinDirectPage} />
        </Route>

        <Route path="/complete-profile" component={CompleteProfilePage} />
        <Route path="/edit-profile" component={EditProfilePage} />
        <Route path="/edit-profile/password" component={EditPasswordPage} />
      </Route>

      <Route path="/" component={NoAuthLayout}>
        <Route path="/sign-in" component={LoginPage} />
        <Route path="/sign-up" component={RegisterPage} />
        <Route path="/auth/google/callback" component={GoogleCallbackPage} />
        <Route path="/auth/discord/callback" component={DiscordCallbackPage} />
      </Route>
    </Router>
  ),
  // biome-ignore lint/style/noNonNullAssertion: This is a root element that is required for the app to function
  root!
);
