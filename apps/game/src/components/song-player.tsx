import type { Ref } from "@solid-primitives/refs";
import { createEffect, createSignal } from "solid-js";
import type { LocalSong } from "~/lib/ultrastar/parser/local";
import { createRefContent } from "~/lib/utils/ref";

export interface SongPlayerRef {
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

interface SongPlayerProps {
  song: LocalSong;
  autoplay?: boolean;
  playerRef?: Ref<SongPlayerRef>;
  class?: string;
}

export default function SongPlayer(props: SongPlayerProps) {
  const [audioReady, setAudioReady] = createSignal(false);
  const [videoReady, setVideoReady] = createSignal(false);
  let audioRef: HTMLAudioElement | undefined;
  let videoRef: HTMLVideoElement | undefined;

  const onAudioReady = () => {
    setAudioReady(true);
    handleMediaReady();
  };

  const onVideoReady = () => {
    setVideoReady(true);
    handleMediaReady();
  };

  createEffect(() => {
    props.song;
    setAudioReady(false);
    setVideoReady(false);
    audioRef?.load();
    videoRef?.load();
    videoRef?.currentTime;
  });

  const handleMediaReady = () => {
    if (!props.song.audioUrl || audioReady()) {
      if (!props.song.videoUrl || videoReady()) {
        if (props.autoplay) {
          audioRef?.play();
          videoRef?.play();
        }
      }
    }
  };

  const play = () => {
    audioRef?.play();
    videoRef?.play();
  };

  const pause = () => {
    audioRef?.pause();
    videoRef?.pause();
  };

  createRefContent(
    () => props.playerRef,
    () => ({
      play,
      pause,
      getCurrentTime: () => audioRef?.currentTime || videoRef?.currentTime || 0,
      getDuration: () => audioRef?.duration || videoRef?.duration || 0,
    })
  );

  createEffect(() => {
    if (props.autoplay) {
      handleMediaReady();
    } else {
      audioRef?.pause();
      videoRef?.pause();
    }
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
          ref={audioRef}
          src={props.song.audioUrl}
          onCanPlayThrough={onAudioReady}
          preload="auto"
        />
      )}
      {props.song.videoUrl ? (
        <video
          ref={videoRef}
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
