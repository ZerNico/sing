import { Show } from "solid-js";
import { createPlayer } from "~/lib/game/player";
import Avatar from "../ui/avatar";
import Lyrics from "./lyrics";
import Pitch from "./pitch";
import Score from "./score";

interface HalfProps {
  index: number;
}

export default function Half(props: HalfProps) {
  const { PlayerProvider, player } = createPlayer(() => ({
    index: props.index,
  }));

  return (
    <PlayerProvider>
      <div
        class="relative flex"
        classList={{
          "flex-col": props.index === 0,
          "flex-col-reverse": props.index === 1,
        }}
      >
        <Lyrics />
        <Pitch />
        <div
          class="absolute right-0 left-0 flex items-center justify-between px-20 py-4"
          classList={{
            "top-0": props.index === 1,
            "bottom-0": props.index === 0,
          }}
        >
          <div class="flex items-center gap-4">
            <Show when={player()}>
              {(player) => (
                <>
                  <Avatar user={player()} />
                  <span>{player()?.username}</span>
                </>
              )}
            </Show>
          </div>
          <Score />
        </div>
      </div>
    </PlayerProvider>
  );
}
