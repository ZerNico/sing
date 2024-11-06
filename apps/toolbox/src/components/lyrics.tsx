import { Textarea } from "./textarea";

interface LyricsProps {
  lyrics: string;
  onLyricsChange?: (lyrics: string) => void;
}

export default function Lyrics(props: LyricsProps) {
  return (
    <div class="flex h-full flex-col gap-2">
      Lyrics
      <Textarea class="flex-grow resize-none" value={props.lyrics} onInput={props.onLyricsChange} />
    </div>
  );
}
