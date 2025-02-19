import { createSignal } from "solid-js";

type LobbyStore = {
  token: string;
  lobby: {
    id: string;
  };
};

function createLobbyStore() {
  const [lobby, setLobby] = createSignal<LobbyStore>();

  const clearLobby = () => {
    setLobby(undefined);
  };

  return {
    lobby,
    setLobby,
    clearLobby,
  };
}

export const lobbyStore = createLobbyStore();
