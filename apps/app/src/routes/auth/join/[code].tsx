import { useNavigate, useParams } from "@solidjs/router";
import { onMount } from "solid-js";
import { v1 } from "~/lib/api";
import { t } from "~/lib/i18n";
import { notify } from "~/lib/toast";
import LoaderCircle from "~icons/lucide/loader-circle";

export default function JoinDirectPage() {
  const navigate = useNavigate();
  const params = useParams<{ code: string }>();

  onMount(async () => {
    const lobbyCode = params.code.toUpperCase();
    const response = await v1.lobbies[":lobbyId"].join.post({
      params: { lobbyId: lobbyCode },
      credentials: "include",
    });

    if (response.ok) {
      navigate("/");
      return;
    }

    if (response.status === 404) {
      notify({
        intent: "error",
        message: t("join_lobby.lobby_not_found"),
      });
      navigate("/join");
      return;
    }

    notify({
      intent: "error",
      message: t("error.unknown"),
    });
    navigate("/join");
  });

  return (
    <div class="flex flex-grow items-center justify-center">
      <LoaderCircle class="animate-spin text-4xl" />
    </div>
  );
}
