import Menu, { type MenuItem } from "../menu";

interface PauseMenuProps {
  onClose?: () => void;
  onExit?: () => void;
  class?: string;
}

export default function PauseMenu(props: PauseMenuProps) {
  const menuItems: MenuItem[] = [
    {
      type: "button",
      label: "Resume",
      action: () => props.onClose?.(),
    },
    {
      type: "button",
      label: "Exit",
      action: () => props.onExit?.(),
    },
  ];

  return (
    <div
      class="h-full w-full p-16"
      classList={{
        [props.class || ""]: true,
      }}
    >
      <Menu items={menuItems} layer={1} gradient="gradient-sing" />
    </div>
  );
}
