import { useNavigate } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import { Show } from "solid-js";
import { v1 } from "~/lib/api";
import { useAuth } from "~/lib/auth";
import { t } from "~/lib/i18n";
import { profileQueryOptions } from "~/lib/queries";
import { notify } from "~/lib/toast";
import IconBan from "~icons/lucide/ban";
import IconLogOut from "~icons/lucide/log-out";
import Avatar from "./ui/avatar";
import DropdownMenu from "./ui/dropdown-menu";

export default function Header() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const leaveLobby = async () => {
    const response = await v1.lobbies.leave.post();

    if (response.ok) {
      await queryClient.invalidateQueries(profileQueryOptions());
      navigate("/join");
      return;
    }

    notify({
      message: t("error.unknown"),
      intent: "error",
    });
  };

  return (
    <header class="">
      <div class="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        <div>
          <span class="font-bold text-lg">Tune Perfect</span>
        </div>
        <Show when={profile()}>
          {(profile) => (
            <DropdownMenu>
              <DropdownMenu.Trigger class="cursor-pointer">
                <Avatar
                  class="transition-opacity hover:opacity-75"
                  src={profile().picture || undefined}
                  fallback={profile().username || undefined}
                />
              </DropdownMenu.Trigger>

              <DropdownMenu.Content>
                <Show when={profile().lobbyId}>
                  <DropdownMenu.Item onClick={leaveLobby}>
                    <IconBan /> Leave Lobby
                  </DropdownMenu.Item>
                </Show>
                <DropdownMenu.Item onClick={logout}>
                  <IconLogOut /> Sign out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          )}
        </Show>
      </div>
    </header>
  );
}
