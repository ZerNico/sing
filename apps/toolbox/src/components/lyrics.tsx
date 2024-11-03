import { Textarea } from "./textarea";

interface LyricsProps {
  lyrics: string;
}

export default function Lyrics(props: LyricsProps) {
  return (
    <div class="flex h-full flex-col gap-2">
      Lyrics
      <Textarea class="flex-grow resize-none" />
    </div>
  );
}
