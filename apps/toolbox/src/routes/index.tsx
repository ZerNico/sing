import { ReactiveMap } from "@solid-primitives/map";
import { open } from "@tauri-apps/plugin-dialog";
import { For, Show, createMemo, createSignal } from "solid-js";
import { effect } from "solid-js/web";
import { commands } from "~/bindings";
import { Button } from "~/components/button";
import { Card } from "~/components/card";
import ImageSearch from "~/components/image-search";
import Lyrics from "~/components/lyrics";
import Tooltip from "~/components/tooltip";
import YouTubeSearch from "~/components/youtube-search";

type QueueItem = {
  status: "downloading" | "completed" | "error";
  error?: string;
  data: {
    lyrics: string;
    video: { title: string; url: string };
    image: string;
    youtubeSearchTerm: string;
    imageSearchTerm: string;
  };
};

export default function Home() {
  const [lyrics, setLyrics] = createSignal("");
  const [youtubeSearchTerm, setYoutubeSearchTerm] = createSignal("");
  const [imageSearchTerm, setImageSearchTerm] = createSignal("");

  const [outputPath, setOutputPath] = createSignal("");
  const [songName, setSongName] = createSignal("");

  const [selectedYoutubeVideo, setSelectedYoutubeVideo] = createSignal<{ title: string; url: string } | null>(null);
  const [selectedImage, setSelectedImage] = createSignal("");

  const [queue, setQueue] = createSignal<ReactiveMap<string, QueueItem>>(new ReactiveMap());

  const selectOutputPath = async () => {
    const result = await open({
      directory: true,
    });

    if (result) {
      setOutputPath(result);
    }
  };

  effect(() => {
    const artist = lyrics()
      .split("\n")
      .find((line) => line.startsWith("#ARTIST:"))
      ?.split(":")[1]
      ?.trim();
    const title = lyrics()
      .split("\n")
      .find((line) => line.startsWith("#TITLE:"))
      ?.split(":")[1]
      ?.trim();

    const newSongName = `${artist} - ${title}`;

    if (!artist || !title) {
      setSongName("");
      return;
    }

    if (newSongName === songName()) {
      return;
    }

    setSongName(newSongName);

    if (artist && title) {
      setYoutubeSearchTerm(`${songName()}`);
      setImageSearchTerm(`${songName()}`);
    }
  });

  const clearForm = () => {
    setLyrics("");
    setSelectedYoutubeVideo(null);
    setSelectedImage("");
    setSongName("");
    setYoutubeSearchTerm("");
    setImageSearchTerm("");
  };

  const loadFromQueue = (songName: string) => {
    const item = queue().get(songName);
    if (!item) return;

    setLyrics(item.data.lyrics);
    setSelectedYoutubeVideo(item.data.video);
    setSelectedImage(item.data.image);
    setYoutubeSearchTerm(item.data.youtubeSearchTerm);
    setImageSearchTerm(item.data.imageSearchTerm);
  };

  const downloadSong = async () => {
    const video = selectedYoutubeVideo();
    if (!outputPath() || !songName() || !video || !selectedImage()) {
      return;
    }

    const existingItem = queue().get(songName());
    if (existingItem && existingItem.status !== "error") {
      return;
    }

    if (existingItem?.status === "error") {
      queue().delete(songName());
    }

    const currentSongName = songName();

    const data = {
      lyrics: lyrics(),
      video: video,
      image: selectedImage(),
      youtubeSearchTerm: youtubeSearchTerm(),
      imageSearchTerm: imageSearchTerm(),
    }

    queue().set(currentSongName, {
      status: "downloading",
      data,
    });

    clearForm();

    const response = await commands.downloadSong(currentSongName, outputPath(), data.lyrics, data.video.url, data.image);

    if (response.status === "ok") {
      queue().set(currentSongName, {
        status: "completed",
        data,
      });
    } else {
      queue().set(currentSongName, {
        status: "error",
        error: `${response.error.type}: ${response.error.data}`,
        data,
      });
    }
  };

  return (
    <main class="grid h-full grid-cols-[2fr_2fr_2fr] grid-rows-2 gap-2 p-2">
      <Card class="min-w-0">
        <Lyrics lyrics={lyrics()} onLyricsChange={setLyrics} />
      </Card>
      <Card class="min-w-0">
        <ImageSearch
          onSelected={setSelectedImage}
          selected={selectedImage()}
          onSearchTermChange={setImageSearchTerm}
          searchTerm={imageSearchTerm()}
        />
      </Card>

      <Card class="flex min-w-0 flex-col gap-2">
        <Button onClick={selectOutputPath}>Select Output Path</Button>
        <div>
          <p class="font-semibold">Output Path:</p>
          <p class="truncate">{outputPath() || "None"}</p>
        </div>
        <div>
          <p class="font-semibold">Video:</p>
          <p class="truncate">{selectedYoutubeVideo()?.title || "None"}</p>
        </div>
        <div>
          <p class="font-semibold">Image:</p>
          <Show when={selectedImage()} fallback={<div class="flex h-24 w-24 items-center justify-center rounded-lg bg-gray-200">None</div>}>
            <img src={selectedImage()} alt="Selected" class="h-24 w-24 rounded-lg object-cover" />
          </Show>
        </div>
        <div class="flex-grow" />
        <Button disabled={!outputPath() || !selectedYoutubeVideo() || !selectedImage() || !songName()} onClick={downloadSong}>
          Download
        </Button>
      </Card>

      <Card class="col-span-2 min-w-0">
        <YouTubeSearch
          onSelected={setSelectedYoutubeVideo}
          selected={selectedYoutubeVideo()?.url}
          onSearchTermChange={setYoutubeSearchTerm}
          searchTerm={youtubeSearchTerm()}
        />
      </Card>

      <Card class="min-w-0">
        <div class="flex h-full flex-col gap-2">
          <h2>Queue</h2>
          <div class="flex-grow overflow-y-auto">
            <div class="flex flex-col gap-2">
              <For each={[...queue().entries()]}>
                {([songName, queueItem], index) => (
                  <button
                    type="button"
                    class="flex cursor-pointer items-center gap-2 rounded-md p-2 transition-colors hover:bg-gray-100"
                    onClick={() => loadFromQueue(songName)}
                  >
                    {queueItem.status === "error" ? (
                      <Tooltip text={queueItem.error || "Unknown Error"}>
                        <Tooltip.Trigger class="i-lucide-x text-red-500" />
                      </Tooltip>
                    ) : (
                      <div
                        classList={{
                          "i-lucide-loader-circle animate-spin": queueItem.status === "downloading",
                          "i-lucide-check": queueItem.status === "completed",
                        }}
                      />
                    )}
                    <p>{songName}</p>
                  </button>
                )}
              </For>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
