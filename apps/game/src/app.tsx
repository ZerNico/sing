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
            <Transition name="fade">{props.children}</Transition>
          </Suspense>
        </>
      )}
    >
      <FileRoutes />
    </HashRouter>
  );
}
