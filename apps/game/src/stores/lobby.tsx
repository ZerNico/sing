import { createSignal } from "solid-js";

type LobbyStore = {
  token: string;
  lobby: {
    id: string;
  };
};

const [lobby, setLobby] = createSignal<LobbyStore>();

export function useLobbyStore() {
  return {
    lobby,
    setLobby,
  };
}
