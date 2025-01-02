import { useNavigate } from "@solidjs/router";
import { For, Show, createMemo, createSignal, onMount } from "solid-js";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import SongPlayer from "~/components/song-player";
import TitleBar from "~/components/title-bar";
import { useNavigation } from "~/hooks/navigation";
import type { LocalSong } from "~/lib/ultrastar/parser/local";
import { useRoundStore } from "~/stores/round";
import { songsStore } from "~/stores/songs";

export default function Sing() {
  const navigate = useNavigate();
  const onBack = () => navigate("/home");
  const [currentSong, setCurrentSong] = createSignal<LocalSong | null>(null);
  const roundStore = useRoundStore();

  useNavigation(() => ({
    layer: 0,
    onKeydown(event) {
      if (event.action === "back") {
        onBack();
      }
    },
    onKeyup(event) {
      if (event.action === "confirm") {
        const song = currentSong();
        if (song) {
          roundStore.startRound({ song });
        }
      }
    },
  }));

  return (
    <Layout
      intent="secondary"
      footer={<KeyHints hints={["back", "navigate", "confirm"]} />}
      header={<TitleBar title="Songs" onBack={onBack} />}
      background={
        <Show when={currentSong()}>
          {(currentSong) => (
            <div class="relative h-full w-full">
              <SongPlayer class="h-full w-full opacity-40" autoplay song={currentSong()} />
            </div>
          )}
        </Show>
      }
    >
      <div class="flex flex-grow flex-col">
        <div class="flex flex-grow flex-col justify-center">
          <p class="text-xl">{currentSong()?.artist}</p>
          <div class="max-w-50cqw">
            <span class="gradient-sing bg-gradient-to-b bg-clip-text font-semibold text-6xl text-transparent ">{currentSong()?.title}</span>
          </div>
        </div>
        <div>
          <SongScroller onSongChange={setCurrentSong} songs={songsStore.songs()} />
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
  const [isPressed, setIsPressed] = createSignal(false);
  const [isHeld, setIsHeld] = createSignal(false);
  const [isFastScrolling, setIsFastScrolling] = createSignal(false);
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
      } else if (event.action === "confirm") {
        setIsPressed(true);
      }
    },

    onKeyup(event) {
      if (event.action === "confirm") {
        setIsPressed(false);
      } else if (event.action === "left" || event.action === "right") {
        setIsHeld(false);
      }
    },

    onHold(event) {
      if (event.action === "left") {
        setIsHeld(true);
        animateTo("left");
      } else if (event.action === "right") {
        setIsHeld(true);
        animateTo("right");
      }
    },
  }));

  const animateTo = (direction: "left" | "right") => {
    if (animating()) {
      return;
    }

    if (isHeld()) {
      setIsFastScrolling(true);
    }

    setAnimating(direction);
  };

  const onTransitionEnd = () => {
    const direction = animating();

    if (!direction) {
      return;
    }

    if (direction === "left") {
      setCurrentIndex(currentIndex() - 1);
    } else if (direction === "right") {
      setCurrentIndex(currentIndex() + 1);
    }

    setAnimating(null);
    const currentSong = props.songs.at(currentIndex() % props.songs.length);
    if (currentSong) {
      props.onSongChange?.(currentSong);
    }

    if (isHeld()) {
      setIsFastScrolling(true);
      setTimeout(() => animateTo(direction), 0);
    } else {
      setIsFastScrolling(false);
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
        class="flex w-11/7 transform-gpu ease-in-out will-change-transform"
        classList={{
          "translate-x-0": animating() === null,
          "translate-x-1/11 transition-transform duration-250": animating() === "left",
          "translate-x--1/11 transition-transform duration-250": animating() === "right",
          "duration-150! ease-linear!": isFastScrolling() && !!animating(),
        }}
        onTransitionEnd={onTransitionEnd}
      >
        <For each={displayedSongs()}>
          {(song, index) => (
            <div
              class="w-1/7 transform-gpu p-0.5cqw transition-transform duration-250 will-change-transform"
              classList={{
                [getSongTransform(index(), animating())]: true,
                "scale-90": isActive(index(), animating()) && isPressed(),
                "duration-150! ease-linear!": isFastScrolling() && !!animating(),
              }}
              onTransitionEnd={(e) => e.stopPropagation()}
            >
              <SongCard fastScrolling={isFastScrolling() && !!animating()} song={song} active={isActive(index(), animating())} />
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
  fastScrolling?: boolean;
}
function SongCard(props: SongCardProps) {
  return (
    <div
      class="relative aspect-square transform-gpu overflow-hidden rounded-lg shadow-xl transition-transform duration-250 will-change-transform"
      classList={{
        [props.class || ""]: true,
        "scale-130": props.active,
        "duration-150! ease-linear!": props.fastScrolling,
      }}
    >
      <img
        class="relative z-1 h-full w-full object-cover transition-opacity duration-250 will-change-opacity"
        classList={{
          "opacity-60": !props.active,
          "opacity-100": props.active,
          "duration-150! ease-linear!": props.fastScrolling,
        }}
        src={props.song.coverUrl}
        alt={props.song.title}
      />
      <div class="absolute inset-0 bg-black" />
    </div>
  );
}
