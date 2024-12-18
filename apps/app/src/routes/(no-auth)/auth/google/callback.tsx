import { revalidate, useNavigate, useSearchParams } from "@solidjs/router";
import { v1 } from "~/lib/api";
import { t } from "~/lib/i18n";
import { notify } from "~/lib/toast";

export default function GoogleCallback() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams<{
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
      await revalidate("api/v1.0/users/me");
      navigate("/");
      return;
    }

    notify({
      intent: "error",
      message: t("error.unknown"),
    });
    navigate("/sign-in");
  };

  sendCallback();

  return <div />;
}