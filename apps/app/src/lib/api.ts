import { client } from "@nokijs/client";
import type { App } from "api";

const api = client<App>(import.meta.env.VITE_API_URL, {
  onResponse: async ({ response, url, options }) => {
    if (url.endsWith("/v1.0/auth/refresh")) {
      return response;
    }

    if (response.status === 401) {
      await v1.auth.refresh.post();

      return fetch(url, options);
    }

    return response;
  },
});

export const v1 = api["v1.0"];
