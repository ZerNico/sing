import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import type { LocalSong } from "~/lib/ultrastar/parser/local";

type RoundSettings = {
  song: LocalSong;
};

const [settings, setSettings] = createSignal<RoundSettings>();

export function useRoundStore() {
  const navigate = useNavigate();

  const startRound = (settings: RoundSettings) => {
    setSettings(settings);
    navigate("/game");
  };

  return {
    settings,
    startRound,
  };
}