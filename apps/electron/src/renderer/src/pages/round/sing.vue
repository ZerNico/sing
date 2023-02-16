<script setup lang="ts">
import type { LocalSong } from '@renderer/logic/song/song'
import SongPlayer from '@renderer/components/SongPlayer.vue'
import Half from '@renderer/components/game/Half.vue'
import HUD from '@renderer/components/game/HUD.vue'
import { millisecondInSongToBeat } from '@renderer/logic/utils/bpm.utils'
import { PitchProcessorFactory } from '@renderer/logic/voice/pitch-processor-factory'
import type { PitchProcessor } from '@renderer/logic/voice/pitch-processor'
import type { Ref } from 'vue'
import placeholder from '@renderer/assets/images/cover-placeholder.png?url'
import type { Note } from '@renderer/logic/song/note'

const roundStore = useRoundStore()
const settingsStore = useSettingsStore()
const router = useRouter()
let pFactory: PitchProcessorFactory
const pitchProcessors: Ref<PitchProcessor[]> = ref([])

const back = () => {
  router.back()
}

const songPlayerEl = ref<InstanceType<typeof SongPlayer>>()
const halfEls = useTemplateRefsList<InstanceType<typeof Half>>()
const HUDEl = ref<InstanceType<typeof HUD>>()

const song = computed(() => roundStore.song as LocalSong | undefined)

const gameLoop = () => {
  if (!songPlayerEl.value || !song.value) return
  const time = songPlayerEl.value?.getAudioTime()
  const duration = songPlayerEl.value?.getAudioDuration()
  const beat = millisecondInSongToBeat(song.value, time * 1000)
  halfEls.value.forEach(half => half.update(beat))
  HUDEl.value?.update(time, duration)
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

const initPitch = async () => {
  if (!song.value) return
  pFactory = new PitchProcessorFactory(song.value)
  for (const microphone of settingsStore.microphones) {
    pitchProcessors.value.push(await pFactory.createPitchProcessor(microphone))
  }
}

onMounted(async () => {
  if (!song.value) {
    back()
    return
  }
  roundStore.resetScore()
  await initPitch()
  setTimeout(() => {
    ready.value = true
  }, 2000)

  setTimeout(() => {
    songPlayerEl.value?.play()
    resume()
  }, 3000)
})

onBeforeUnmount(async () => {
  await pFactory.stopStreams()
})

const ready = ref(false)
const coverError = ref(false)

const coverUrl = computed(() => {
  if (song.value && !coverError.value) {
    return song.value.urls.cover
  }
  return placeholder
})

const onClick = (e: MouseEvent) => {
  if (e.button === 4) {
    e.preventDefault()
  } else if (e.button === 3) {
    back()
    e.preventDefault()
  }
}

const onScore = (index: 1 | 2, note: Note) => {
  roundStore.addScore(index, note)
}

const onBonus = (index: 1 | 2, beatCount: number) => {
  roundStore.addBonus(index, beatCount)
}
</script>

<template>
  <div class="w-full h-full flex items-center justify-center gradient-bg-secondary" @mouseup="onClick">
    <div v-if="song" class="layout relative">
      <SongPlayer ref="songPlayerEl" :song="song" class="w-full h-full absolute" @error="back" />
      <div class="absolute h-full w-full">
        <Half
          v-if="roundStore.player1 && settingsStore.microphones.at(0) && pitchProcessors.at(0)"
          :ref="halfEls.set"
          class="h-50cqh w-full"
          :song="song" position="top"
          :voice-index="0"
          :microphone="settingsStore.microphones.at(0)!"
          :pitch-processor="pitchProcessors.at(0)!"
          @score="(note) => onScore(1, note)"
          @bonus="(beatCount) => onBonus(1, beatCount)"
        />
        <Half
          v-if="roundStore.player2 && settingsStore.microphones.at(1) && pitchProcessors.at(1)"
          :ref="halfEls.set"
          class="h-50cqh w-full"
          :song="song" position="bottom"
          :voice-index="song.isDuet() ? 1 : 0"
          :microphone="settingsStore.microphones.at(1)!"
          :pitch-processor="pitchProcessors.at(1)!"
          @score="(note) => onScore(2, note)"
          @bonus="(beatCount) => onBonus(2, beatCount)"
        />
      </div>
      <HUD
        ref="HUDEl"
        :player1="roundStore.player1"
        :player2="roundStore.player2"
        :microphones="settingsStore.microphones"
        :score1="roundStore.totalScore1"
        :score2="roundStore.totalScore2"
        class="absolute w-full h-full"
      />
      <div
        class="absolute h-full w-full overflow-hidden transition-opacity duration-1000"
        :class="{ 'opacity-0': ready }"
      >
        <div class="h-full w-full relative bg-black flex items-center justify-center">
          <img :src="coverUrl" class="w-full h-full object-cover absolute blur-xl transform scale-110 opacity-70" @error="coverError = true">
          <div class=" relative min-w-0 text-center">
            <div class="truncate text-1.5cqw font-semibold">
              {{ song.meta.artist }}
            </div>
            <div class="truncate font-bold bg-clip-text text-transparent gradient-title text-6.0cqw">
              {{ song.meta.title }}
            </div>
          </div>
        </div>
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

.gradient-title {
  background-image: linear-gradient(180deg, #11998e 0%, #38ef7d 100%);
}
</style>
