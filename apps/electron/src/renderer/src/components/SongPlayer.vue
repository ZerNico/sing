<script setup lang="ts">
import type { LocalSong } from '@renderer/logic/song/song'
import placeholder from '@renderer/assets/images/cover-placeholder.png?url'

const props = withDefaults(
  defineProps<{
    song?: LocalSong
    volume?: number
  }>(),
  {
    volume: 100,
    autoplay: false,
  },
)

const emit = defineEmits<{
  (event: 'started'): void
  (event: 'ended'): void
  (event: 'error'): void
}>()

const videoEl = ref<HTMLVideoElement>()
const audioEl = ref<HTMLAudioElement>()

const playing = ref(false)

watch(
  () => props.song,
  () => {
    playing.value = false
    videoError.value = false
    backgroundError.value = false
    coverError.value = false
    videoGapTimeout && clearTimeout(videoGapTimeout)
    isSynced = false
    playbackStarted = false
    if (videoEl.value) videoEl.value.currentTime = 0
    if (audioEl.value) audioEl.value.currentTime = 0
  },
)

const play = () => {
  playing.value = true
  startPlayback()
}

const pause = () => {
  playing.value = false
  videoEl.value?.pause()
  audioEl.value?.pause()
  videoGapTimeout && clearTimeout(videoGapTimeout)
  playbackStarted = false
}

const canPlay = () => {
  if (!props.song) {
    return false
  }

  // check if audio el status is ready to play
  if (!audioEl.value || audioEl.value.readyState < 3) {
    return false
  }

  // check if video exists and is ready to play
  if (videoEl.value && props.song?.urls.video && !videoEl.value?.error && videoEl.value.readyState < 3) {
    return false
  }

  return true
}

let videoGapTimeout: NodeJS.Timeout | null = null
let isSynced = false
let playbackStarted = false

const startPlayback = () => {
  if (!playing.value) {
    return
  }

  if (playbackStarted) {
    return
  }

  if (!canPlay() || !props.song || !audioEl.value) {
    return
  }

  if (!videoEl.value) {
    audioEl.value?.play()
    return
  }

  playbackStarted = true
  emit('started')

  // check if for video gap and if audio and video are already synced (need for pausing)
  if (props.song?.meta.videoGap > 0 && !isSynced) {
    videoEl.value?.play()

    let waitTime = props.song?.meta.videoGap * 1000

    // reduce wait time for how long the video is already playing
    if (videoEl.value.currentTime > 0) {
      waitTime -= videoEl.value.currentTime * 1000
    }

    // start audio after video gap time
    videoGapTimeout = setTimeout(() => {
      audioEl.value?.play()
      isSynced = true
    }, waitTime)
  } else if (props.song?.meta.videoGap < 0 && !isSynced) {
    audioEl.value?.play()

    let waitTime = Math.abs(props.song?.meta.videoGap) * 1000

    // reduce wait time for how long the audio is already playing
    if (audioEl.value.currentTime > 0) {
      waitTime -= audioEl.value.currentTime * 1000
    }

    // start video after video gap time
    videoGapTimeout = setTimeout(() => {
      videoEl.value?.play()
      isSynced = true
    }, waitTime)
  } else {
    audioEl.value?.play()
    videoEl.value?.play()
  }
}

const videoError = ref(false)
const backgroundError = ref(false)
const coverError = ref(false)

const coverUrl = computed(() => {
  if (props.song?.urls.cover && !coverError.value) {
    return props.song.urls.cover
  }
  return placeholder
})

const onEnded = () => {
  emit('ended')
}

const onError = () => {
  pause()
  emit('error')
}

const getAudioTime = () => {
  if (!audioEl.value) return 0
  return audioEl.value.currentTime
}

const getAudioDuration = () => {
  if (!audioEl.value) return 0
  return audioEl.value.duration
}

defineExpose({
  play,
  pause,
  getAudioTime,
  getAudioDuration,
})
</script>

<template>
  <div>
    <div v-if="!props.song" class="h-full w-full" />
    <video
      v-if="props.song?.urls.video && !videoError"
      ref="videoEl"
      :src="props.song?.urls.video"
      class="w-full h-full object-cover"
      muted
      @canplay="startPlayback"
      @error="videoError = true"
    />
    <img
      v-else-if="props.song?.urls.background && !backgroundError"
      :src="props.song?.urls.background"
      class="w-full h-full object-cover"
      @error="backgroundError = true"
    >
    <div v-else class="w-full h-full relative overflow-hidden">
      <img :src="coverUrl" class="w-full h-full object-cover absolute blur-xl transform scale-110" @error="coverError = true">
      <img :src="coverUrl" class="w-full h-full object-contain relative" @error="coverError = true">
    </div>

    <audio ref="audioEl" :src="song?.urls.mp3" @canplay="startPlayback" @ended="onEnded" @error="onError" />
  </div>
</template>
