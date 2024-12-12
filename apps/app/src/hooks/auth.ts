import { createAsync, query, redirect } from "@solidjs/router";
import type { User } from "api/types";
import { createResource, createSignal } from "solid-js";
import { v1 } from "~/lib/api";
import { getUser } from "~/lib/auth";

export function useGoogleOAuth() {
  const signIn = async (redirect?: string) => {
    const response = await v1.auth.google.get({ credentials: "include", query: { redirect } });

    if (response.ok) {
      window.location.href = response.data.url;
    }
  };

  return {
    signIn,
  };
}

export function useAuth() {
  const [user, { refetch }] = createResource(() => getUser());

  return {
    user,
    refetch,
  };
}
