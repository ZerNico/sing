import { Show } from "solid-js";
import { useAuth } from "~/lib/auth";
import LogOut from "~icons/lucide/log-out";
import Avatar from "./ui/avatar";
import DropdownMenu from "./ui/dropdown-menu";

export default function Header() {
  const { profile, logout } = useAuth();

  return (
    <header class="">
      <div class="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        <div>
          <span class="font-bold text-lg">Tune Perfect</span>
        </div>
        <div>
          <Show when={profile}>
            {(profile) => (
              <DropdownMenu>
                <DropdownMenu.Trigger>
                  <Avatar
                    class="transition-opacity hover:opacity-75"
                    src={profile().picture || undefined}
                    fallback={profile().username || undefined}
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
