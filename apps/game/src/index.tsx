import "uno.css";
import "./styles.scss";
import "@unocss/reset/tailwind.css";
import '@fontsource/lato/300.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import { render, Suspense } from "solid-js/web";
import { Router } from "@solidjs/router";
import routes from "~solid-pages";
import App from "./app";
import { Transition } from "solid-transition-group";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error("Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?");
}

render(
  () => (
    <Router
      root={(props) => (
        <Suspense>
          <App>
            <Transition
              onExit={(el, done) => {
                const element = el as HTMLElement;
                element.style.position = "absolute";
                element.style.zIndex = "999";
                element.style.top = "0";
                element.style.left = "0";

                const a = el.animate([{ opacity: 1 }, { opacity: 0 }], {
                  duration: 300,
                });
                a.finished.then(done);
              }}
       
            >
              {props.children}
            </Transition>
          </App>
        </Suspense>
      )}
    >
      {routes}
    </Router>
  ),
  root!
);
