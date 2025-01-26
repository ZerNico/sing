import { client } from "@nokijs/client";
import type { App } from "api";
import { useLobbyStore } from "~/stores/lobby";

const api = client<App>(import.meta.env.VITE_API_URL, {
  fetch: async (url, init) => {
    const lobbyStore = useLobbyStore();
    const lobbyToken = lobbyStore.lobby()?.token;

    const modifiedInit = {
      ...init,
    };

    if (lobbyToken) {
      modifiedInit.headers = {
        ...modifiedInit.headers,
        Authorization: `Bearer ${lobbyToken}`,
      };
    }

    return fetch(url, modifiedInit);
  },
});

export const v1 = api["v1.0"];
