<script setup lang="ts">
import type { LocalSong } from '@renderer/logic/song/song'
import SongPlayer from '@renderer/components/SongPlayer.vue'
import Half from '@renderer/components/game/Half.vue'
import { millisecondInSongToBeat } from '@renderer/logic/utils/bpm.utils'

const roundStore = useRoundStore()
const settingsStore = useSettingsStore()
const router = useRouter()

const back = () => {
  router.back()
}

const songPlayerEl = ref<InstanceType<typeof SongPlayer>>()
const halfEls = useTemplateRefsList<InstanceType<typeof Half>>()

const song = computed(() => roundStore.song as LocalSong | undefined)

const gameLoop = () => {
  if (!songPlayerEl.value || !song.value) return
  const time = songPlayerEl.value?.getAudioTime()
  const beat = millisecondInSongToBeat(song.value, time * 1000)
  halfEls.value.forEach(half => half.update(beat))
}

const { pause, resume, isActive } = useRafFn(() => {
  gameLoop()
})

// useEventListener for space bar to pause and resume
useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.code === 'Space') {
    if (isActive.value) {
      pause()
      songPlayerEl.value?.pause()
    } else {
      resume()
      songPlayerEl.value?.play()
    }
  }
})

onMounted(() => {
  if (!song.value) {
    back()
    return
  }
  songPlayerEl.value?.play()
  resume()
})
</script>

<template>
  <div class="w-full h-full flex items-center justify-center gradient-bg-secondary">
    <div v-if="song" class="layout relative">
      <SongPlayer ref="songPlayerEl" :song="song" class="w-full h-full absolute" @error="back" />
      <div class="absolute h-full w-full">
        <Half
          v-if="roundStore.player1 && settingsStore.microphones.at(0)"
          :ref="halfEls.set"
          class="h-50cqh w-full"
          :song="song" position="top"
          :voice-index="0"
          :microphone="settingsStore.microphones.at(0)!"
        />
        <Half
          v-if="roundStore.player2 && settingsStore.microphones.at(1)"
          :ref="halfEls.set"
          class="h-50cqh w-full"
          :song="song" position="bottom"
          :voice-index="song.isDuet() ? 1 : 0"
          :microphone="settingsStore.microphones.at(1)!"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout {
  height: 100%;
  width: 100%;
  container-type: size;
}

@media (min-aspect-ratio: 21/9) {
  .layout {
    aspect-ratio: 21 / 9;
    height: 100%;
    width: auto;
  }
}

@media (max-aspect-ratio: 1/1) {
  .layout {
    aspect-ratio: 1 / 1;
    height: auto;
    width: 100%;
  }
}
</style>
