import { HashRouter } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "uno.css";
import "@fontsource-variable/inter";
import "@unocss/reset/tailwind.css";
import "./styles.scss";
import { Transition } from "solid-transition-group";

export default function App() {
  return (
    <HashRouter
      root={(props) => (
        <>
          <Suspense>
            <Transition
              onExit={(el, done) => {
                const element = el as HTMLElement;
                element.style.position = "absolute";
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
          </Suspense>
        </>
      )}
    >
      <FileRoutes />
    </HashRouter>
  );
}
