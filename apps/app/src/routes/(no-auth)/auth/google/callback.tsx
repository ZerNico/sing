import { useNavigate, useSearchParams } from "@solidjs/router";
import { v1 } from "~/lib/api";

export default function GoogleCallback() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams<{
    code: string;
  }>();

  const sendCallback = async () => {
    if (!searchParams.code) {
      return;
    }

    const response = await v1.auth.google.callback.post({ body: { code: searchParams.code }, credentials: "include" });

    if (response.ok) {
      navigate("/");
    }
  };

  sendCallback();

  return <div>Google</div>;
}
