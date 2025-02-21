import { mergeRefs } from "@solid-primitives/refs";
import { useNavigate } from "@solidjs/router";
import { For, type Ref, Show, createMemo, createSignal } from "solid-js";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import SongPlayer from "~/components/song-player";
import TitleBar from "~/components/title-bar";
import { useNavigation } from "~/hooks/navigation";
import type { LocalSong } from "~/lib/ultrastar/parser/local";
import { settingsStore } from "~/stores/settings";
import { songsStore } from "~/stores/songs";
import IconDices from "~icons/lucide/dices";
import IconSearch from "~icons/lucide/search";
import IconF3Key from "~icons/sing/f3-key";

const [currentSong, setCurrentSong] = createSignal<LocalSong | null>();

export default function Sing() {
  if (!currentSong()) {
    setCurrentSong(songsStore.songs()[0] || null);
  }

  const navigate = useNavigate();
  const onBack = () => navigate("/home");
  const [sort, setSort] = createSignal<"artist" | "title" | "year">("artist");
  const [animationsDisabled, setAnimationsDisabled] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [searchFocused, setSearchFocused] = createSignal(false);
  let searchRef!: HTMLInputElement;

  const startGame = (song: LocalSong) => {
    navigate(`/sing/${song.hash}`);
  };

  useNavigation(() => ({
    onKeydown(event) {
      if (event.action === "back") {
        onBack();
      } else if (event.action === "search") {
        searchRef.focus();
      }
    },
    onKeyup(event) {
      if (event.action === "confirm") {
        const song = currentSong();
        if (song) {
          startGame(song);
        }
      }
    },
  }));

  const selectRandomSong = () => {
    setAnimationsDisabled(true);

    const songs = songsStore.songs();
    const randomIndex = Math.floor(Math.random() * songs.length);
    const randomSong = songs[randomIndex];
    if (randomSong) {
      setCurrentSong(randomSong);
    }

    setTimeout(() => {
      setAnimationsDisabled(false);
    }, 0);
  };

  return (
    <Layout
      intent="secondary"
      footer={
        <div class="flex justify-between">
          <KeyHints hints={["back", "navigate", "confirm"]} />
          <div class="flex items-center gap-8">
            <button type="button" class="text-2xl transition-all hover:opacity-75 active:scale-95" onClick={selectRandomSong}>
              <IconDices />
            </button>
            <div class="flex gap-2">
              <For each={["artist", "title", "year"] as const}>
                {(sortKey) => (
                  <button
                    type="button"
                    class="gradient-sing rounded-full px-2 text-md text-white capitalize"
                    classList={{
                      "gradient-sing bg-gradient-to-b": sortKey.toLowerCase() === sort(),
                    }}
                    onClick={() => setSort(sortKey)}
                  >
                    {sortKey}
                  </button>
                )}
              </For>
            </div>
          </div>
        </div>
      }
      header={
        <div class="flex gap-20">
          <TitleBar title="Songs" onBack={onBack} />
          <SearchBar
            ref={searchRef}
            onSearch={setSearchQuery}
            onFocus={() => {
              setSearchFocused(true);
              setAnimationsDisabled(true);
            }}
            onBlur={() => {
              setSearchFocused(false);
              setAnimationsDisabled(false);
            }}
          />
        </div>
      }
      background={
        <Show when={currentSong()}>
          {(currentSong) => (
            <div class="relative h-full w-full">
              <SongPlayer volume={settingsStore.getVolume("preview")} class="h-full w-full opacity-40" playing song={currentSong()} />
            </div>
          )}
        </Show>
      }
    >
      <div class="flex flex-grow flex-col">
        <div class="flex flex-grow flex-col justify-center">
          <p class="text-xl">{currentSong()?.artist}</p>
          <div class="max-w-200">
            <span class="gradient-sing bg-gradient-to-b bg-clip-text font-bold text-6xl text-transparent ">{currentSong()?.title}</span>
          </div>
        </div>
        <div>
          <SongScroller
            searchQuery={searchQuery()}
            onSongChange={setCurrentSong}
            onSelect={startGame}
            songs={songsStore.songs()}
            sort={sort()}
            currentSong={currentSong() || null}
            animationsDisabled={animationsDisabled()}
          />
        </div>
      </div>
    </Layout>
  );
}

interface SongScrollerProps {
  songs: LocalSong[];
  sort: "artist" | "title" | "year";
  currentSong: LocalSong | null;
  animationsDisabled: boolean;
  searchQuery: string;
  onSongChange?: (song: LocalSong | null) => void;
  onSelect?: (song: LocalSong) => void;
}

const DISPLAYED_SONGS = 11;
const MIDDLE_SONG_INDEX = Math.floor(DISPLAYED_SONGS / 2);

function SongScroller(props: SongScrollerProps) {
  const [isPressed, setIsPressed] = createSignal(false);
  const [isHeld, setIsHeld] = createSignal(false);
  const [isFastScrolling, setIsFastScrolling] = createSignal(false);
  const [animating, setAnimating] = createSignal<null | "left" | "right">(null);

  const sortedSongs = createMemo(() => {
    let songs = props.songs;

    if (props.searchQuery.trim()) {
      const query = props.searchQuery.toLowerCase().trim();
      songs = songs.filter((song) => song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query));
    }

    if (songs.length === 0) {
      return [];
    }

    if (props.sort === "title") {
      return songs.toSorted((a, b) => a.title.localeCompare(b.title));
    }
    if (props.sort === "year") {
      return songs.toSorted((a, b) => {
        if (a.year === undefined) {
          return -1;
        }
        if (b.year === undefined) {
          return 1;
        }

        return a.year - b.year;
      });
    }

    return songs.toSorted((a, b) => a.artist.localeCompare(b.artist));
  });

  const currentIndex = createMemo(() => {
    const songs = sortedSongs();
    if (songs.length === 0) {
      props.onSongChange?.(null);
      return 0;
    }

    const currentSong = props.currentSong;
    if (!currentSong) {
      const firstSong = songs[0];
      if (firstSong) {
        props.onSongChange?.(firstSong);
      }
      return 0;
    }

    const index = songs.findIndex((song) => song === currentSong);

    if (index === -1) {
      const firstSong = songs[0];
      if (firstSong) {
        props.onSongChange?.(firstSong);
      }
      return 0;
    }

    return index;
  });

  const displayedSongs = createMemo(() => {
    const songs = [];
    const index = currentIndex();
    const offset = Math.floor(DISPLAYED_SONGS / 2);
    for (let i = index - offset; i < index + offset + 1; i++) {
      const index = i % sortedSongs().length;
      const song = sortedSongs().at(index);
      if (song) {
        songs.push(song);
      }
    }

    return songs;
  });

  useNavigation(() => ({
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

    const index = currentIndex();
    let nextIndex: number;

    if (direction === "left") {
      nextIndex = (index - 1 + sortedSongs().length) % sortedSongs().length;
    } else {
      nextIndex = (index + 1) % sortedSongs().length;
    }

    const nextSong = sortedSongs()[nextIndex];
    if (nextSong) {
      props.onSongChange?.(nextSong);
    }

    setAnimating(null);

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
      return animating === "right" ? "-translate-x-8" : animating === "left" ? "translate-x-8" : "";
    }

    // Translate the previous song to the left if it's not the next song and the animation
    if (index < MIDDLE_SONG_INDEX && !isNext(index, animating)) {
      return "-translate-x-8";
    }

    // Translate the next song to the right if it's not the previous song and the animation
    if (index > MIDDLE_SONG_INDEX && !isNext(index, animating)) {
      return "translate-x-8";
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
          "-translate-x-1/11 transition-transform duration-250": animating() === "right",
          "duration-150! ease-linear!": isFastScrolling() && !!animating(),
          "duration-0! ease-linear!": props.animationsDisabled,
        }}
        onTransitionEnd={onTransitionEnd}
      >
        <For each={displayedSongs()}>
          {(song, index) => (
            <button
              type="button"
              class="w-1/7 transform-gpu p-2 transition-all duration-250 will-change-transform"
              classList={{
                [getSongTransform(index(), animating())]: true,
                "hover:opacity-50 active:scale-90": isActive(index(), animating()),
                "scale-90": isActive(index(), animating()) && isPressed(),
                "duration-150! ease-linear!": isFastScrolling() && !!animating(),
                "duration-0! ease-linear!": props.animationsDisabled,
              }}
              onTransitionEnd={(e) => e.stopPropagation()}
              onClick={() => {
                if (index() !== MIDDLE_SONG_INDEX) {
                  animateTo(index() > MIDDLE_SONG_INDEX ? "right" : "left");
                } else {
                  props.onSelect?.(song);
                }
              }}
            >
              <SongCard
                fastScrolling={isFastScrolling() && !!animating()}
                song={song}
                active={isActive(index(), animating())}
                animationsDisabled={props.animationsDisabled}
              />
            </button>
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
  animationsDisabled?: boolean;
}
function SongCard(props: SongCardProps) {
  return (
    <div
      class="relative aspect-square transform-gpu overflow-hidden rounded-lg shadow-xl transition-transform duration-250 will-change-transform"
      classList={{
        [props.class || ""]: true,
        "scale-130": props.active,
        "duration-150! ease-linear!": props.fastScrolling,
        "duration-0! ease-linear!": props.animationsDisabled,
      }}
    >
      <img
        class="relative z-1 h-full w-full object-cover transition-opacity duration-250 will-change-opacity"
        classList={{
          "opacity-60": !props.active,
          "opacity-100": props.active,
          "duration-150! ease-linear!": props.fastScrolling,
          "duration-0! ease-linear!": props.animationsDisabled,
        }}
        src={props.song.coverUrl}
        alt={props.song.title}
      />
      <div class="absolute inset-0 bg-black" />
    </div>
  );
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  ref?: Ref<HTMLInputElement>;
}

function SearchBar(props: SearchBarProps) {
  const [focused, setFocused] = createSignal(false);
  let searchRef!: HTMLInputElement;

  const onFocus = () => {
    setFocused(true);
    props.onFocus?.();
  };

  const onBlur = () => {
    setFocused(false);
    props.onBlur?.();
  };

  const onChange = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
    props.onSearch?.(e.currentTarget.value);
  };

  const moveCursor = (direction: "left" | "right") => {
    const start = searchRef.selectionStart ?? 0;
    searchRef.setSelectionRange(Math.max(0, start + (direction === "left" ? -1 : 1)), Math.max(0, start + (direction === "left" ? -1 : 1)));
  };

  useNavigation(() => ({
    layer: 1,
    enabled: focused(),
    onKeydown(event) {
      if (event.action === "back") {
        onBlur();
      }

      if (event.origin === "keyboard") {
        if (event.action === "left") {
          moveCursor("left");
        } else if (event.action === "right") {
          moveCursor("right");
        }
      }
    },

    onRepeat(event) {
      if (event.origin !== "keyboard") {
        return;
      }

      if (event.action === "left") {
        moveCursor("left");
      } else if (event.action === "right") {
        moveCursor("right");
      }
    },
  }));

  return (
    <div class="flex items-center gap-1 rounded-full border-[0.12cqw] border-white px-1 py-0.5 text-sm">
      <IconSearch />
      <input
        onFocus={onFocus}
        onBlur={onBlur}
        onInput={onChange}
        ref={mergeRefs(props.ref, (el) => {
          searchRef = el;
        })}
        type="text"
        placeholder="Search"
        class="bg-transparent text-white focus:outline-none"
      />
      <IconF3Key class="transition-opacity" classList={{ "opacity-0": focused() }} />
    </div>
  );
}
