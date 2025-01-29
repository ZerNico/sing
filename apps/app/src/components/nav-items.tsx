import { useLocation } from "@solidjs/router";
import { type Component, Show } from "solid-js";
import { useAuth } from "~/lib/auth";
import { t } from "~/lib/i18n";
import IconUser from "~icons/lucide/user";
import IconUserPlus from "~icons/lucide/user-plus";
import IconUsers from "~icons/lucide/users";

interface NavItemsProps {
  class?: string;
}

export default function NavItems(props: NavItemsProps) {
  const { profile } = useAuth();

  return (
    <nav
      class="grid place-items-center"
      style={{ "grid-auto-flow": "column", "grid-auto-columns": "1fr" }}
      classList={{
        [props.class || ""]: true,
      }}
    >
      <Show when={!profile()?.lobbyId}>
        <NavItem href="/join" icon={IconUserPlus} label={t("nav.join")} />
      </Show>
      <Show when={profile()?.lobbyId}>
        <NavItem href="/" icon={IconUsers} label={t("nav.lobby")} />
      </Show>
      <NavItem href="/edit-profile" icon={IconUser} label={t("nav.profile")} />
    </nav>
  );
}

interface NavItemProps {
  href: string;
  icon: Component<{ class?: string }>;
  label: string;
}

function NavItem(props: NavItemProps) {
  const location = useLocation();

  const isActive = () => location.pathname === props.href;

  return (
    <a href={props.href} class="relative w-full rounded-md px-3 hover:bg-white/10">
      <div class="flex flex-col items-center py-2 md:flex-row md:gap-2">
        <props.icon />
        {props.label}
      </div>

      <div
        class="absolute right-0 bottom-0 left-0 px-3 transition-opacity"
        classList={{
          "opacity-0": !isActive(),
        }}
      >
        <div class="h-1 w-full rounded-full bg-white" />
      </div>
    </a>
  );
}
