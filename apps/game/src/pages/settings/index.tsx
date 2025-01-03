import { useNavigate } from "@solidjs/router";
import { For, createSignal } from "solid-js";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import TitleBar from "~/components/title-bar";
import Button from "~/components/ui/button";
import { createLoop } from "~/hooks/loop";
import { useNavigation } from "~/hooks/navigation";

export default function Settings() {
  const navigate = useNavigate();
  const [pressed, setPressed] = createSignal(false);

  console.log("Setting6");
  

  const onBack = () => navigate("/home");
  const buttons = [
    {
      label: "Songs",
      action: () => navigate("/settings/songs"),
    },
    {
      label: "Microphones",
      action: () => navigate("/settings/microphones"),
    },
    {
      label: "Credits",
      action: () => navigate("/settings/credits"),
    },
  ];

  const { position, increment, decrement, set } = createLoop(buttons.length);

  useNavigation(() => ({
    layer: 0,
    onKeydown(event) {
      if (event.action === "back") {
        onBack();
      } else if (event.action === "up") {
        decrement();
      } else if (event.action === "down") {
        increment();
      } else if (event.action === "confirm") {
        setPressed(true);
      }
    },
    onKeyup(event) {
      if (event.action === "confirm") {
        setPressed(false);
        buttons[position()]?.action();
      }
    },
  }));

  return (
    <Layout
      intent="secondary"
      header={<TitleBar title="Settings" onBack={onBack} />}
      footer={<KeyHints hints={["back", "navigate", "confirm"]} />}
    >
      <div class="flex w-full flex-grow flex-col justify-center">
        <For each={buttons}>
          {(button, index) => (
            <Button
              gradient="gradient-settings"
              selected={position() === index()}
              active={pressed() && position() === index()}
              onClick={button.action}
              onMouseEnter={() => set(index())}
            >
              {button.label}
            </Button>
          )}
        </For>
      </div>
    </Layout>
  );
}
