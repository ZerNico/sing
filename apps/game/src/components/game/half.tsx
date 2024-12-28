import { useGame } from "~/lib/game/game";
import { createPlayer } from "~/lib/game/player";
import Lyrics from "./lyrics";

interface HalfProps {
  index: number;
}

export default function Half(props: HalfProps) {
  const game = useGame();
  const { PlayerProvider, phrase, nextPhrase, phraseIndex } = createPlayer(() => ({
    index: props.index,
  }));

  return (
    <div>
      <PlayerProvider>
        <Lyrics />
      </PlayerProvider>
    </div>
  );
}
