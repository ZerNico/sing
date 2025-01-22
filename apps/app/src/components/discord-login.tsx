import { createSignal } from "solid-js";
import { v1 } from "~/lib/api";
import { t } from "~/lib/i18n";
import { notify } from "~/lib/toast";
import DiscordIcon from "~icons/logos/discord-icon";
import Button from "./ui/button";

export default function DiscordLogin() {
  const [loading, setLoading] = createSignal(false);

  const login = async () => {
    setLoading(true);
    const response = await v1.oauth.discord.url.get({
      credentials: "include",
      query: {}
    });

    if (response.ok) {
      window.location.href = response.data.url;
      return;
    }

    notify({
      intent: "error",
      message: t("error.unknown"),
    });

    setLoading(false);
  };

  return (
    <Button class="flex-1" onClick={login} loading={loading()}>
      <DiscordIcon class="text-sm" /> Discord
    </Button>
  );
}
