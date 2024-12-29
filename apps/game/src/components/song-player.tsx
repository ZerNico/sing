import { type Accessor, Match, type Ref, Show, Switch, createEffect, createSignal, on } from "solid-js";
import type { LocalSong } from "~/lib/ultrastar/parser/local";
import { createRefContent } from "~/lib/utils/ref";

export interface SongPlayerRef {
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  playing: Accessor<boolean>;
  ready: Accessor<boolean>;
}

interface SongPlayerProps {
  song: LocalSong;
  autoplay?: boolean;
  playerRef?: Ref<SongPlayerRef>;
  class?: string;
}

export default function SongPlayer(props: SongPlayerProps) {
  const [playing, setPlaying] = createSignal(props.autoplay ?? false);
  const [ready, setReady] = createSignal(false);
  const [synced, setSynced] = createSignal(false);
  const [videoGapTimer, setVideoGapTimer] = createSignal<number | undefined>(undefined);
  let audioRef: HTMLAudioElement | undefined;
  let videoRef: HTMLVideoElement | undefined;

  const onAudioReady = () => {
    updatePlaybackState();
  };

  const onVideoReady = () => {
    updatePlaybackState();
  };

  const updatePlaybackState = () => {
    const isMediaReady = (element: HTMLMediaElement | undefined, url?: string) => {
      if (!element) return false;
      if (url && element.readyState < 3) return false;
      return document.body.contains(element);
    };

    if (!isMediaReady(audioRef, props.song.audioUrl)) {
      setReady(false);
      return;
    }

    if (!isMediaReady(videoRef, props.song.videoUrl)) {
      setReady(false);
      return;
    }

    setReady(true);

    if (playing()) {
      startPlayback();
    } else {
      audioRef?.pause();
      videoRef?.pause();
    }
  };

  const startPlayback = () => {
    if (!playing()) {
      return;
    }

    if (props.song.videoGap > 0 && !synced()) {
      videoRef?.play();

      let waitTime = props.song.videoGap * 1000;
      if (videoRef && videoRef?.currentTime > 0) {
        waitTime -= videoRef.currentTime * 1000;
      }

      setVideoGapTimer(
        setTimeout(() => {
          setSynced(true);
          audioRef?.play();
        }, waitTime)
      );
    } else if (props.song.videoGap < 0 && !synced()) {
      audioRef?.play();

      let waitTime = Math.abs(props.song?.videoGap || 0) * 1000;

      if (audioRef && audioRef.currentTime > 0) {
        waitTime -= audioRef.currentTime * 1000;
      }

      setVideoGapTimer(
        setTimeout(() => {
          setSynced(true);
          videoRef?.play();
        }, waitTime)
      );
    } else {
      audioRef?.play();
      videoRef?.play();
    }
  };

  const play = () => {
    setPlaying(true);
    updatePlaybackState();
  };

  const pause = () => {
    setPlaying(false);
    updatePlaybackState();
  };

  createEffect(
    on([() => props.song.videoUrl, () => props.song.audioUrl], () => {
      setReady(false);
      setSynced(false);
      if (videoRef) {
        videoRef.currentTime = 0;
      }
      if (audioRef) {
        audioRef.currentTime = 0;
      }

      clearTimeout(videoGapTimer());
    })
  );

  createRefContent(
    () => props.playerRef,
    () => ({
      playing,
      ready,
      play,
      pause,
      getCurrentTime: () => audioRef?.currentTime || videoRef?.currentTime || 0,
      getDuration: () => audioRef?.duration || videoRef?.duration || 0,
    })
  );

  return (
    <div
      class="relative h-full w-full bg-black"
      classList={{
        [props.class || ""]: true,
      }}
    >
      <Switch>
        <Match when={props.song.videoUrl}>
          {(videoUrl) => (
            <video
              muted={!!props.song.audioUrl}
              class="h-full w-full object-cover"
              ref={videoRef}
              preload="auto"
              on:canplaythrough={onVideoReady}
              src={videoUrl()}
            />
          )}
        </Match>
        <Match when={props.song.backgroundUrl}>
          {(backgroundUrl) => <img alt="" class="h-full w-full object-contain" src={backgroundUrl()} />}
        </Match>
      </Switch>

      <Show when={props.song.audioUrl}>
        {/* biome-ignore lint/a11y/useMediaCaption: Not needed for this game */}
        {(audioUrl) => <audio ref={audioRef} preload="auto" on:canplaythrough={onAudioReady} src={audioUrl()} />}
      </Show>
    </div>
  );
}
