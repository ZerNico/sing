import { For, createSignal } from "solid-js";
import { createLoop } from "~/hooks/loop";
import { useNavigation } from "~/hooks/navigation";
import Button from "../ui/button";

interface MenuProps {
  onClose?: () => void;
  class?: string;
}

export default function Menu(props: MenuProps) {
  const [pressed, setPressed] = createSignal(false);

  const buttons = [
    {
      label: "Resume",
      action: () => props.onClose?.(),
    },
    {
      label: "Exit",
      action: () => {},
    },
  ];

  const { position, increment, decrement, set } = createLoop(buttons.length);

  useNavigation(() => ({
    layer: 1,
    onKeydown(event) {
      if (event.action === "back") {
        props.onClose?.();
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
    <div
      class="flex w-full flex-grow flex-col justify-center p-16"
      classList={{
        [props.class || ""]: true,
      }}
    >
      <For each={buttons}>
        {(button, index) => (
          <Button
            gradient="gradient-sing"
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
  );
}
