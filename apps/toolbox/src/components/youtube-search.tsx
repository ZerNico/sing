import { For, Show, createResource, createSignal } from "solid-js";
import { type YoutubeSearchResult, commands } from "~/bindings";
import { Button } from "./button";
import { Input } from "./input";

interface YouTubeSearchProps {
  onSelected: (url?: string) => void;
  selected?: string;
}

export function YouTubeSearch(props: YouTubeSearchProps) {
  const [searchTerm, setSearchTerm] = createSignal("");
  const [searchResults, setSearchResults] = createSignal<YoutubeSearchResult[]>();
  const [loading, setLoading] = createSignal(false);

  const search = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await commands.searchYoutube(searchTerm());

    if (response.status === "error") {
      console.error(response.error);
      setSearchResults([]);
      setLoading(false);
      return;
    }

    setSearchResults(response.data);
    setLoading(false);
  };

  return (
    <div class="flex h-full flex-col gap-2">
      <h2>YouTube</h2>
      <form onSubmit={search} class="flex gap-2">
        <Input value={searchTerm()} onInput={setSearchTerm} class="flex-grow" />
        <Button loading={loading()} type="submit">
          <div class="i-lucide-search" />
        </Button>
      </form>
      <div class="flex-grow overflow-y-auto">
        <div class="flex flex-col gap-2">
          <For each={searchResults()}>
            {(result) => (
              <div class="flex items-center gap-2">
                <img src={result.thumbnail} alt={result.title} class="h-16 w-16 rounded-lg object-cover" />
                <div class="flex-grow">
                  <div class="font-semibold">{result.title}</div>
                </div>
                <Button onClick={() => props.onSelected(result.url)} disabled={props.selected === result.url}>
                  <Show when={props.selected === result.url} fallback={<div class="i-lucide-plus" />}>
                    <div class="i-lucide-check" />
                  </Show>
                </Button>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
