import { useSearchParams } from "@solidjs/router";
import { createSignal } from "solid-js";
import { v1 } from "~/lib/api";
import { t } from "~/lib/i18n";
import { notify } from "~/lib/toast";
import DiscordIcon from "~icons/logos/discord-icon";
import Button from "./ui/button";

export default function DiscordLogin() {
  const [loading, setLoading] = createSignal(false);
  const [searchParams] = useSearchParams<{
    redirect?: string;
  }>();

  const login = async () => {
    setLoading(true);
    
    if (searchParams.redirect) {
      localStorage.setItem('discord_auth_redirect', searchParams.redirect);
    } else {
      localStorage.removeItem('discord_auth_redirect');
    }

    const response = await v1.oauth.discord.url.get({
      credentials: "include",
      query: {
        redirect: searchParams.redirect,
      },
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
