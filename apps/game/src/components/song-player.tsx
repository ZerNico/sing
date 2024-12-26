import { type Ref, mergeRefs } from "@solid-primitives/refs";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import type { LocalSong } from "~/lib/ultrastar/parser/local";

interface SongPlayerProps {
  song: LocalSong;
  playing?: boolean;
  audioRef?: Ref<HTMLAudioElement>;
  videoRef?: Ref<HTMLVideoElement>;
  class?: string;
}

export default function SongPlayer(props: SongPlayerProps) {
  const [audioReady, setAudioReady] = createSignal(false);
  const [videoReady, setVideoReady] = createSignal(false);
  let audioRef: HTMLAudioElement | undefined;
  let videoRef: HTMLVideoElement | undefined;

  onMount(() => {
    console.log("song player mounted");
  });

  const onAudioReady = () => {
    console.log("audio ready");

    setAudioReady(true);
    handleMediaReady();
  };

  const onVideoReady = () => {
    console.log("video ready");
    setVideoReady(true);
    handleMediaReady();
  };

  createEffect(() => {
    props.song;
    setAudioReady(false);
    setVideoReady(false);
    audioRef?.load();
    videoRef?.load();
  });

  const handleMediaReady = () => {
    if (!props.song.audioUrl || audioReady()) {
      if (!props.song.videoUrl || videoReady()) {
        if (props.playing) {
          audioRef?.play();
          videoRef?.play();
        }
      }
    }
  };

  createEffect(() => {
    if (props.playing) {
      handleMediaReady();
    } else {
      audioRef?.pause();
      videoRef?.pause();
    }
  });

  onCleanup(() => {
    audioRef?.pause();
    videoRef?.pause();
  });

  return (
    <div
      class="relative h-full w-full bg-black"
      classList={{
        [props.class || ""]: true,
      }}
    >
      {props.song.audioUrl && (
        // biome-ignore lint/a11y/useMediaCaption: Is not necessary for this use case
        <audio
          ref={mergeRefs(props.audioRef, (el) => {
            audioRef = el;
          })}
          src={props.song.audioUrl}
          onCanPlayThrough={onAudioReady}
          preload="auto"
        />
      )}
      {props.song.videoUrl ? (
        <video
          ref={mergeRefs(props.videoRef, (el) => {
            videoRef = el;
          })}
          src={props.song.videoUrl}
          onCanPlayThrough={onVideoReady}
          muted={!!props.song.audioUrl}
          preload="auto"
          class="h-full w-full object-cover"
        />
      ) : (
        props.song.backgroundUrl && <img src={props.song.backgroundUrl} alt="Song background" class="h-full w-full object-contain" />
      )}
    </div>
  );
}
