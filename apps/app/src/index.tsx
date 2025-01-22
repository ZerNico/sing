import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import "./app.css";
import App from "./app";

import AuthLayout from "./layouts/auth";
import NoAuthLayout from "./layouts/no-auth";
import IndexPage from "./routes/auth";
import CompleteProfilePage from "./routes/auth/complete-profile";
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
        <Route path="/" component={IndexPage} />
        <Route path="/complete-profile" component={CompleteProfilePage} />
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
