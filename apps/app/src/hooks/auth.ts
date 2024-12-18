import { useNavigate } from "@solidjs/router";
import { createResource } from "solid-js";
import { v1 } from "~/lib/api";
import { getMe } from "~/lib/auth";

export function useAuth() {
  const navigate = useNavigate();

  const [user, { refetch }] = createResource(async () => {
    const response = await getMe();

    if (response.ok) {
      return response.data;
    }
  });

  const logout = async () => {
    await v1.auth.logout.post({ credentials: "include" });
    navigate("/sign-in");
  };

  return {
    user,
    refetch,
    logout,
  };
}
