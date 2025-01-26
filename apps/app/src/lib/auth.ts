import { useNavigate } from "@solidjs/router";
import { createQuery, useQueryClient } from "@tanstack/solid-query";
import { v1 } from "./api";
import { profileQueryOptions } from "./queries";

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profileQuery = createQuery(() => profileQueryOptions());

  const logout = async () => {
    await v1.auth.logout.post({ credentials: "include" });
    queryClient.resetQueries();
    navigate("/sign-in");
  };

  return {
    profile: () => profileQuery.data,
    logout,
  };
}
