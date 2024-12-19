import { revalidate, useNavigate, useSearchParams } from "@solidjs/router";
import { v1 } from "~/lib/api";
import { t } from "~/lib/i18n";
import { notify } from "~/lib/toast";
import LoaderCircle from "~icons/lucide/loader-circle";

export default function DiscordCallback() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams<{
    code: string;
    state: string;
  }>();

  const sendCallback = async () => {
    if (!searchParams.code || !searchParams.state) {
      return;
    }

    const response = await v1.oauth.discord.callback.post({
      body: { code: searchParams.code, state: searchParams.state },
      credentials: "include",
    });

    if (response.ok) {
      await revalidate("api/v1.0/users/me");
      navigate("/", { replace: true });
      return;
    }

    notify({
      intent: "error",
      message: t("error.unknown"),
    });
    navigate("/sign-in");
  };

  sendCallback();

  return (
    <div class="flex flex-grow items-center justify-center">
      <LoaderCircle class="animate-spin text-4xl" />
    </div>
  );
}
