import { useNavigate, useSearchParams } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import { v1 } from "~/lib/api";
import { t } from "~/lib/i18n";
import { profileQueryOptions } from "~/lib/queries";
import { notify } from "~/lib/toast";
import LoaderCircle from "~icons/lucide/loader-circle";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchParams] = useSearchParams<{
    code: string;
    state: string;
  }>();

  const sendCallback = async () => {
    if (!searchParams.code || !searchParams.state) {
      return;
    }

    const response = await v1.oauth.google.callback.post({
      body: { code: searchParams.code, state: searchParams.state },
      credentials: "include",
    });

    if (response.ok) {
      await queryClient.invalidateQueries(profileQueryOptions());
      const storedRedirect = localStorage.getItem('google_auth_redirect');
      localStorage.removeItem('google_auth_redirect');
      navigate(storedRedirect || "/", { replace: true });
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
