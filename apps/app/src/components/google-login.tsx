import { useSearchParams } from "@solidjs/router";
import { createSignal } from "solid-js";
import { v1 } from "~/lib/api";
import { t } from "~/lib/i18n";
import { notify } from "~/lib/toast";
import GoogleIcon from "~icons/logos/google-icon";
import Button from "./ui/button";

export default function GoogleLogin() {
  const [loading, setLoading] = createSignal(false);
  const [searchParams] = useSearchParams<{
    redirect?: string;
  }>();

  const login = async () => {
    setLoading(true);
    
    if (searchParams.redirect) {
      localStorage.setItem('google_auth_redirect', searchParams.redirect);
    } else {
      localStorage.removeItem('google_auth_redirect');
    }

    const response = await v1.oauth.google.url.get({
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
      <GoogleIcon class="text-sm" /> Google
    </Button>
  );
}
