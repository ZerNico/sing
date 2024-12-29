import { createPlayer } from "~/lib/game/player";
import Lyrics from "./lyrics";
import Pitch from "./pitch";

interface HalfProps {
  index: number;
}

export default function Half(props: HalfProps) {
  const { PlayerProvider } = createPlayer(() => ({
    index: props.index,
  }));

  return (
    <PlayerProvider>
      <div class="flex"
        classList={{
          "flex-col": props.index === 0,
          "flex-col-reverse": props.index === 1,
        }}
      >
        <Lyrics />
        <Pitch />
      </div>
    </PlayerProvider>
  );
}
