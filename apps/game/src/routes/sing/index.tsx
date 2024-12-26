import { useNavigate } from "@solidjs/router";
import { For, Show, createMemo, createSignal, onMount } from "solid-js";
import { Transition } from "solid-transition-group";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import SongPlayer from "~/components/song-player";
import TitleBar from "~/components/title-bar";
import { useNavigation } from "~/hooks/navigation";
import type { LocalSong } from "~/lib/ultrastar/parser/local";
import { localSongs } from "~/stores/songs";

export default function Sing() {
  const navigate = useNavigate();
  const onBack = () => navigate("/home");
  const [currentSong, setCurrentSong] = createSignal<LocalSong | null>(null);

  useNavigation(() => ({
    layer: 0,
    onKeydown(event) {
      if (event.action === "back") {
        onBack();
      }
    },
    onKeyup(event) {},
  }));

  return (
    <Layout
      intent="secondary"
      footer={<KeyHints hints={["back", "navigate", "confirm"]} />}
      header={<TitleBar title="Songs" onBack={onBack} />}
      background={
        <Transition
          onExit={(el, done) => {
            const element = el as HTMLElement;
            element.style.position = "absolute";
            element.style.top = "0";
            element.style.left = "0";

            const a = el.animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 250,
            });
            a.finished.then(done);
          }}
          onEnter={(el) => {
            const element = el as HTMLElement;

            element.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: 250,
            });
          }}
        >
          <Show when={currentSong()} keyed>
            {(currentSong) => (
              <div class="relative h-full w-full">
                <SongPlayer class="h-full w-full opacity-40" playing song={currentSong} />
              </div>
            )}
          </Show>
        </Transition>
      }
    >
      <div class="flex flex-grow flex-col">
        <div class="flex-grow">213</div>
        <div>
          <SongScroller onSongChange={setCurrentSong} songs={localSongs} />
        </div>
      </div>
    </Layout>
  );
}

interface SongScrollerProps {
  songs: LocalSong[];
  onSongChange?: (song: LocalSong) => void;
}

const DISPLAYED_SONGS = 11;
const MIDDLE_SONG_INDEX = Math.floor(DISPLAYED_SONGS / 2);

function SongScroller(props: SongScrollerProps) {
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [animating, setAnimating] = createSignal<null | "left" | "right">(null);

  onMount(() => {
    const song = props.songs.at(currentIndex() % props.songs.length);
    if (song) {
      props.onSongChange?.(song);
    }
  });

  const displayedSongs = createMemo(() => {
    const songs = [];
    const index = currentIndex();
    const offset = Math.floor(DISPLAYED_SONGS / 2);
    for (let i = index - offset; i < index + offset + 1; i++) {
      const index = i % props.songs.length;

      const song = props.songs.at(index);
      if (song) {
        songs.push(song);
      }
    }
    return songs;
  });

  useNavigation(() => ({
    layer: 0,
    onKeydown(event) {
      if (event.action === "left") {
        animateTo("left");
      } else if (event.action === "right") {
        animateTo("right");
      }
    },
  }));

  const animateTo = (direction: "left" | "right") => {
    if (animating()) {
      return;
    }

    setAnimating(direction);
  };

  const onTransitionEnd = () => {
    if (animating() === "left") {
      setCurrentIndex(currentIndex() - 1);
    } else if (animating() === "right") {
      setCurrentIndex(currentIndex() + 1);
    }

    setAnimating(null);
    const currentSong = props.songs.at(currentIndex() % props.songs.length);
    if (currentSong) {
      props.onSongChange?.(currentSong);
    }
  };

  const isActive = (index: number, animating: "left" | "right" | null) => {
    return (
      (animating === "right" && index === MIDDLE_SONG_INDEX + 1) ||
      (!animating && index === MIDDLE_SONG_INDEX) ||
      (animating === "left" && index === MIDDLE_SONG_INDEX - 1)
    );
  };

  const isNext = (index: number, animating: "left" | "right" | null) => {
    return (animating === "right" && index === MIDDLE_SONG_INDEX + 1) || (animating === "left" && index === MIDDLE_SONG_INDEX - 1);
  };

  const getSongTransform = (index: number, animating: "left" | "right" | null) => {
    // Translate the middle song to the left or right depending on the direction of the animation
    if (index === MIDDLE_SONG_INDEX) {
      return animating === "right" ? "translate-x--2cqw" : animating === "left" ? "translate-x-2cqw" : "";
    }

    // Translate the previous song to the left if it's not the next song and the animation
    if (index < MIDDLE_SONG_INDEX && !isNext(index, animating)) {
      return "translate-x--2cqw";
    }

    // Translate the next song to the right if it's not the previous song and the animation
    if (index > MIDDLE_SONG_INDEX && !isNext(index, animating)) {
      return "translate-x-2cqw";
    }

    return "";
  };

  return (
    <div class="flex w-full flex-col items-center justify-center">
      <div
        class="flex w-11/7 transform-gpu ease-in-out"
        classList={{
          "translate-x-0": animating() === null,
          "translate-x-1/11 transition-transform duration-250": animating() === "left",
          "translate-x--1/11 transition-transform duration-250": animating() === "right",
        }}
        onTransitionEnd={onTransitionEnd}
      >
        <For each={displayedSongs()}>
          {(song, index) => (
            <div
              class="w-1/7 transform-gpu p-0.5cqw transition-transform duration-250"
              classList={{
                [getSongTransform(index(), animating())]: true,
              }}
              onTransitionEnd={(e) => e.stopPropagation()}
            >
              <SongCard song={song} active={isActive(index(), animating())} />
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

interface SongCardProps {
  song: LocalSong;
  class?: string;
  classList?: Record<string, boolean>;
  active?: boolean;
}
function SongCard(props: SongCardProps) {
  return (
    <div
      class="relative aspect-square transform-gpu overflow-hidden rounded-lg shadow-xl transition-transform duration-250"
      classList={{
        [props.class || ""]: true,
        "scale-130": props.active,
      }}
    >
      <img
        class="relative z-1 h-full w-full object-cover transition-opacity duration-250"
        classList={{
          "opacity-60": !props.active,
          "opacity-100": props.active,
        }}
        src={props.song.coverUrl}
        alt={props.song.title}
      />
      <div class="absolute inset-0 bg-black" />
    </div>
  );
}
