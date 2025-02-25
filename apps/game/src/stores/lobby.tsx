import { makePersisted } from "@solid-primitives/storage";
import { createSignal } from "solid-js";
import { v1 } from "~/lib/api";

type LobbyStore = {
  token: string;
  lobby: {
    id: string;
  };
};

function createLobbyStore() {
  const [lobby, setLobby] = makePersisted(createSignal<LobbyStore | undefined>(undefined), {
    name: "lobbyStore.lobby",
  });

  const clearLobby = async () => {
    if (!lobby()) {
      return;
    }

    try {
      await v1.lobbies.current.delete();
    } catch (_) {
    } finally {
      setLobby(undefined);
    }
  };

  return {
    lobby,
    setLobby,
    clearLobby,
  };
}

export const lobbyStore = createLobbyStore();
