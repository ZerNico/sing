import { DropdownMenu as KDropdownMenu, Trigger as KTrigger } from "@kobalte/core/dropdown-menu";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import { type JSX, type ValidComponent, splitProps } from "solid-js";

interface DropdownProps {
  children: JSX.Element;
}

function Root(props: DropdownProps) {
  return <KDropdownMenu gutter={4} placement="bottom-end">{props.children}</KDropdownMenu>;
}

interface DropdownMenuContentProps {
  children: JSX.Element;
}

export function DropdownMenuContent(props: DropdownMenuContentProps) {
  return (
    <KDropdownMenu.Portal>
      <KDropdownMenu.Content class="min-w-36 rounded-md border border-gray-200 bg-white p-1 shadow-lg">
        {props.children}
      </KDropdownMenu.Content>
    </KDropdownMenu.Portal>
  );
}

interface DropdownMenuItemProps<T extends ValidComponent = "div"> {
  children: JSX.Element;
  class?: string;
}
export function DropdownMenuItem<T extends ValidComponent = "div">(props: PolymorphicProps<T, DropdownMenuItemProps<T>>) {
  const [local, others] = splitProps(props as DropdownMenuItemProps, ["class"]);

  return (
    <KDropdownMenu.Item
      as="div"
      class="block flex w-full items-center gap-2 rounded px-4 py-2 text-gray-700 text-sm hover:bg-gray-100"
      classList={{
        [local.class || ""]: !!local.class,
      }}
      {...others}
    >
      {props.children}
    </KDropdownMenu.Item>
  );
}

const DropdownMenu = Object.assign(Root, {
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  Trigger: KTrigger,
});

export default DropdownMenu;