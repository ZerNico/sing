import { makeEventListener } from "@solid-primitives/event-listener";
import { debounce } from "@solid-primitives/scheduled";
import { useNavigate } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { event } from "@tauri-apps/api";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { type JSX, createSignal } from "solid-js";
import { v1 } from "./lib/api";

interface AppProps {
  children: JSX.Element;
}

const [initialized, setInitialized] = createSignal(false);

export default function App(props: AppProps) {
  const queryClient = new QueryClient();

  const toggleFullscreen = async () => {
    const window = getCurrentWindow();
    const isFullscreen = await window.isFullscreen();

    await window.setFullscreen(!isFullscreen);
  };

  makeEventListener(document, "keydown", (event) => {
    if (event.key === "F11") {
      toggleFullscreen();
      event.preventDefault();
      event.stopPropagation();
    }
  });

  const navigate = useNavigate();
  const [mouseHidden, setMouseHidden] = createSignal(false);

  const hideMouse = debounce(() => {
    setMouseHidden(true);
  }, 3000);

  makeEventListener(document, "mousemove", () => {
    setMouseHidden(false);
    hideMouse();
  });

  event.listen("tauri://close-requested", async () => {
    await v1.lobbies.current.delete();
  });

  if (!initialized()) {
    setInitialized(true);
    navigate("/");
  }

  return (
    <div
      class="font-primary text-base text-white"
      classList={{
        "cursor-none": mouseHidden(),
      }}
    >
      <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
    </div>
  );
}
