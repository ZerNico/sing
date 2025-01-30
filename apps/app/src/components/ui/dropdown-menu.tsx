import type { PolymorphicProps } from "@kobalte/core";
import { type DropdownMenuItemProps, DropdownMenu as KDropdownMenu } from "@kobalte/core/dropdown-menu";
import type { JSX, ValidComponent } from "solid-js";

interface DropdownProps {
  children: JSX.Element;
}

function DropdownMenuRoot(props: DropdownProps) {
  return (
    <KDropdownMenu gutter={4} placement="bottom-end">
      {props.children}
    </KDropdownMenu>
  );
}

interface DropdownMenuContentProps {
  children: JSX.Element;
}

export function DropdownMenuContent(props: DropdownMenuContentProps) {
  return (
    <KDropdownMenu.Portal>
      <KDropdownMenu.Content class="min-w-36 rounded-md border border-gray-200 bg-white p-1 shadow-lg focus:outline-slate-800">
        {props.children}
      </KDropdownMenu.Content>
    </KDropdownMenu.Portal>
  );
}

interface CustomProps<T extends ValidComponent = "button"> extends DropdownMenuItemProps<T> {}

function DropdownMenuItem<T extends ValidComponent = "button">(props: PolymorphicProps<T, CustomProps<T>>) {
  return (
    <KDropdownMenu.Item
      class="flex w-full cursor-pointer items-center gap-2 rounded px-4 py-2 text-sm transition-colors hover:bg-slate-200 focus:outline-slate-800"
      as="button"
      {...props}
    />
  );
}

const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Trigger: KDropdownMenu.Trigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
});

export default DropdownMenu;
