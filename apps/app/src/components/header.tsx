import { Show } from "solid-js";
import { useAuth } from "~/hooks/auth";
import LogOut from "~icons/lucide/log-out";
import Avatar from "./ui/avatar";
import DropdownMenu from "./ui/dropdown-menu";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header class="">
      <div class="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        <div>
          <span class="font-bold text-lg">Tune Perfect</span>
        </div>

        <div>
          <Show when={user()}>
            {(user) => (
              <DropdownMenu>
                <DropdownMenu.Trigger>
                  <Avatar
                    class="transition-opacity hover:opacity-75"
                    src={user().picture || undefined}
                    fallback={user().username || undefined}
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item as="button" onClick={logout}>
                    <LogOut /> Sign out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu>
            )}
          </Show>
        </div>
      </div>
    </header>
  );
}
