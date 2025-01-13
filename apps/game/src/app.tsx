import { makeEventListener } from "@solid-primitives/event-listener";
import { debounce } from "@solid-primitives/scheduled";
import { useNavigate } from "@solidjs/router";
import { type JSX, createSignal } from "solid-js";

interface AppProps {
  children: JSX.Element;
}

const [initialized, setInitialized] = createSignal(false);

export default function App(props: AppProps) {
  const navigate = useNavigate();
  const [mouseHidden, setMouseHidden] = createSignal(false);

  const hideMouse = debounce(() => {
    setMouseHidden(true);
  }, 3000);

  makeEventListener(document, "mousemove", () => {
    setMouseHidden(false);
    hideMouse();
  });

  if (!initialized()) {
    setInitialized(true);
    navigate("/loading");
  }

  return (
    <div
      class="font-primary text-base text-white"
      classList={{
        "cursor-none": mouseHidden(),
      }}
    >
      {props.children}
    </div>
  );
}
