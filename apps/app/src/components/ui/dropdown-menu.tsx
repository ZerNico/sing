import { DropdownMenu as KDropdownMenu } from "@kobalte/core/dropdown-menu";
import type { JSX } from "solid-js";

interface DropdownMenuProps {
  children: JSX.Element;
  trigger: JSX.Element;
}

function DropdownMenuRoot(props: DropdownMenuProps) {
  return (
    <KDropdownMenu gutter={4} placement="bottom-end">
      <KDropdownMenu.Trigger>{props.trigger}</KDropdownMenu.Trigger>
      <KDropdownMenu.Portal>
        <KDropdownMenu.Content class="min-w-36 rounded-md border border-gray-200 bg-white p-1 shadow-lg focus:outline-slate-800">
          {props.children}
        </KDropdownMenu.Content>
      </KDropdownMenu.Portal>
    </KDropdownMenu>
  );
}

interface DropdownMenuItemProps {
  children: JSX.Element;
  onClick?: () => void;
}


function DropdownMenuItem(props: DropdownMenuItemProps) {
  return (
    <KDropdownMenu.Item
      class="flex w-full cursor-pointer items-center gap-2 rounded px-4 py-2 text-sm transition-colors hover:bg-slate-200 focus:outline-slate-800"
      as="button"
      onClick={props.onClick}
    >
      {props.children}
    </KDropdownMenu.Item>
  );
}

const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Item: DropdownMenuItem,
});

export default DropdownMenu;
