import { createSignal } from "solid-js";
import { commands } from "~/bindings";
import { Card } from "~/components/card";
import { ImageSearch } from "~/components/image-search";
import Lyrics from "~/components/lyrics";
import { YouTubeSearch } from "~/components/youtube-search";

export default function Home() {
  const [searchTerm, setSearchTerm] = createSignal("");

  const search = async (e: SubmitEvent) => {
    e.preventDefault();

    console.log("searching for", searchTerm());

    const results = await commands.searchYoutube(searchTerm());
    console.log(results);
  };

  return (
    <main class="grid h-full grid-cols-2 grid-rows-2 gap-2 p-2">
      <Card class="min-w-0">
        <Lyrics lyrics="Hello, world!" />
      </Card>
      <Card class="min-w-0">
        <YouTubeSearch onSelected={() => {}} selected="" />
      </Card>
      <Card class="min-w-0">
        <ImageSearch onSelected={() => {}} selected="" />
      </Card>
    </main>
  );
}
