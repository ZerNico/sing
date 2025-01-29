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
import IconUser from "~icons/lucide/user";
import NavItems from "./nav-items";
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
    <>
      <div class="h-16" />
      <header class="fixed top-0 right-0 left-0 border-white/10 border-b">
        <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
          <div>
            <span class="font-bold text-lg">{t("header.app_name")}</span>
          </div>
          <div class="flex flex-grow justify-center">
            <NavItems class="hidden md:flex" />
          </div>
          <div>
            <Show when={profile()}>
              {(profile) => (
                <DropdownMenu>
                  <DropdownMenu.Trigger class="cursor-pointer">
                    <Avatar class="transition-opacity hover:opacity-75" user={profile()} />
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Content>
                    <DropdownMenu.Item onClick={() => navigate("/edit-profile")}>
                      <IconUser /> {t("header.edit_profile")}
                    </DropdownMenu.Item>
                    <Show when={profile().lobbyId}>
                      <DropdownMenu.Item onClick={leaveLobby}>
                        <IconBan /> {t("header.leave_lobby")}
                      </DropdownMenu.Item>
                    </Show>
                    <DropdownMenu.Item onClick={logout}>
                      <IconLogOut /> {t("header.sign_out")}
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu>
              )}
            </Show>
          </div>
        </div>
      </header>
    </>
  );
}
