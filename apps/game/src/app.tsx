import { useNavigate } from "@solidjs/router";
import { createSignal, type JSX } from "solid-js";

interface AppProps {
  children: JSX.Element;
}


const [initialized, setInitialized] = createSignal(false);

export default function App(props: AppProps) {
  const navigate = useNavigate();

  if (!initialized()) {
    setInitialized(true);
    navigate("/loading");
  }

  return <div class="font-primary text-base text-white">{props.children}</div>;
}
