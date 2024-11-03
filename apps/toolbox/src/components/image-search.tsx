import { For, Show, createResource, createSignal } from "solid-js";
import { type ImageSearchResult, type YoutubeSearchResult, commands } from "~/bindings";
import { Button } from "./button";
import { Input } from "./input";

interface ImageSearchProps {
  onSelected: (url?: string) => void;
  selected?: string;
}

export function ImageSearch(props: ImageSearchProps) {
  const [searchTerm, setSearchTerm] = createSignal("");
  const [searchResults, setSearchResults] = createSignal<ImageSearchResult[]>();
  const [loading, setLoading] = createSignal(false);

  const search = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await commands.searchImage(searchTerm());

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
      <h2>Image</h2>
      <form onSubmit={search} class="flex gap-2">
        <Input value={searchTerm()} onInput={setSearchTerm} class="flex-grow" />
        <Button loading={loading()} type="submit">
          <div class="i-lucide-search" />
        </Button>
      </form>
      <div class="flex-grow overflow-y-auto">
        <div class="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2">
          <For each={searchResults()}>
            {(result) => (
              <button type="button" class="relative aspect-square h-full w-full overflow-hidden rounded-lg">
                <img src={result.url} alt="" class="h-full w-full object-cover" />
                <div class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity hover:opacity-100 ">
                  <Show when={props.selected === result.url} fallback={<div class="i-lucide-plus text-4xl text-white" />}>
                    <div class="i-lucide-check text-4xl text-white" />
                  </Show>
                </div>
              </button>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
