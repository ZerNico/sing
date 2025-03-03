import { client } from "@nokijs/client";
import type { App } from "api";
import { lobbyStore } from "~/stores/lobby";

export function joinHeaders(...headers: (HeadersInit | undefined)[]): Headers {
  const result = new Headers();

  for (const header of headers) {
    for (const [key, value] of new Headers(header)) {
      result.append(key, value);
    }
  }

  return result;
}

const api = client<App>(import.meta.env.VITE_API_URL, {
  fetch: async (url, init) => {
    const lobbyToken = lobbyStore.lobby()?.token;
    
    // Create authorization headers if token exists
    const authHeaders = lobbyToken 
      ? { Authorization: `Bearer ${lobbyToken}` }
      : undefined;
    
    // Join the original headers with auth headers
    const headers = joinHeaders(init?.headers, authHeaders);
    
    return fetch(url, {
      ...init,
      headers,
    });
  },
});

export const v1 = api["v1.0"];
