<script setup lang="ts">
import type { Ref } from 'vue'
import type { LocalSong } from '~/logic/song/song'
import SongPlayer from '~/components/SongPlayer.vue'
import Half from '~/components/game/Half.vue'
import HUD from '~/components/game/HUD.vue'
import { millisecondInSongToBeat } from '~/logic/utils/bpm.utils'
import { initPitchProcessors, stopPitchProcessors } from '~/logic/voice/pitch-processor-init.js'
import type { PitchProcessor } from '~/logic/voice/pitch-processor'
import placeholder from '~/assets/images/cover-placeholder.png?url'
import type { Note } from '~/logic/song/note'
import type { MenuNavigationEvent } from '~/composables/useMenuNavigation'

const roundStore = useRoundStore()
const settingsStore = useSettingsStore()
const router = useRouter()
const pitchProcessors: Ref<PitchProcessor[]> = ref([])

const back = () => {
  router.back()
}

const exit = () => {
  router.push({ name: '/round/score' })
}

const songPlayerEl = ref<InstanceType<typeof SongPlayer>>()
const halfEls = useTemplateRefsList<InstanceType<typeof Half>>()
const HUDEl = ref<InstanceType<typeof HUD>>()

const song = computed(() => roundStore.song as LocalSong | undefined)

const ready = ref(false)
const paused = ref(false)

const gameLoop = () => {
  if (!songPlayerEl.value || !song.value || paused.value) return
  const time = songPlayerEl.value?.getAudioTime()
  const duration = songPlayerEl.value?.getAudioDuration()
  const beat = millisecondInSongToBeat(song.value, time * 1000)
  for (const halfEl of halfEls.value) {
    halfEl.update(beat)
  }
  HUDEl.value?.update(time, duration)
}

const { resume } = useRafFn(() => {
  update()
  gameLoop()
})

const { update } = useMenuNavigation(
  useRepeatThrottleFn((e) => onNavigate(e), 150),
  { immediate: false }
)
const onNavigate = (event: MenuNavigationEvent) => {
  if (!ready.value) return

  if (event.action === 'back' || event.action === 'menu') {
    paused.value = !paused.value
  }
  if (paused.value) {
    if (event.action === 'confirm') {
      buttons.at(position.value)?.action()
    } else if (event.action === 'down') {
      increment()
    } else if (event.action === 'up') {
      decrement()
    }
  }
}

watch(paused, (isPaused) => {
  if (isPaused) {
    songPlayerEl.value?.pause()
  } else {
    songPlayerEl.value?.play()
  }
})

const initPitch = async () => {
  if (!song.value) return
  pitchProcessors.value = await initPitchProcessors(song.value, settingsStore.microphones)
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
  await stopPitchProcessors()
})

const coverError = ref(false)

const coverUrl = computed(() => {
  if (song.value && !coverError.value && song.value.urls.cover) {
    return song.value.urls.cover
  }
  return placeholder
})

const onClick = (e: MouseEvent) => {
  if (e.button === 4) {
    e.preventDefault()
  } else if (e.button === 3) {
    e.preventDefault()
  }
}

const onScore = (index: 1 | 2, note: Note) => {
  roundStore.addScore(index, note)
}

const onBonus = (index: 1 | 2, beatCount: number) => {
  roundStore.addBonus(index, beatCount)
}

const buttons = [
  { label: 'Resume', action: () => (paused.value = false) },
  { label: 'Exit', action: exit },
]
const { position, increment, decrement } = useLoop(buttons.length - 1)

const score1 = computed(() => {
  const voice = song.value?.voices.at(0)
  if (!voice) return 0
  return roundStore.totalScore1(voice.getMaxScore().totalScore)
})

const score2 = computed(() => {
  if (!song.value) return 0
  const voice = song.value?.voices.at(song.value.isDuet() ? 1 : 0)
  if (!voice) return 0
  return roundStore.totalScore2(voice.getMaxScore().totalScore)
})

const volume = computed(() => {
  const volume = settingsStore.getPreviewVolume / 100
  return volume
})

const select = useSoundEffect('select')
watch(position, () => select.play())
</script>

<template>
  <div class="w-full h-full flex items-center justify-center gradient-bg-secondary" @mouseup="onClick">
    <div v-if="song" class="layout relative">
      <div :class="{ 'opacity-0': paused }">
        <SongPlayer
          ref="songPlayerEl"
          :volume="volume"
          :song="song"
          class="w-full h-full absolute opacity-80"
          @error="back"
          @ended="exit"
        />
        <div class="absolute h-full w-full">
          <Half
            v-if="roundStore.player1 && settingsStore.microphones.at(0) && pitchProcessors.at(0)"
            :ref="halfEls.set"
            class="h-50cqh w-full"
            :song="song"
            position="top"
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
            :song="song"
            position="bottom"
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
          :score1="score1"
          :score2="score2"
          class="absolute w-full h-full"
        />
        <div
          class="absolute h-full w-full overflow-hidden transition-opacity duration-1000"
          :class="{ 'opacity-0': ready }"
        >
          <div class="h-full w-full relative bg-black flex items-center justify-center">
            <img
              :src="coverUrl"
              class="w-full h-full object-cover absolute blur-xl transform scale-110 opacity-70"
              @error="coverError = true"
            />
            <div class="relative min-w-0 text-center">
              <div class="truncate text-1.5cqw font-semibold">
                {{ song.meta.artist }}
              </div>
              <div
                class="truncate font-bold bg-clip-text text-transparent text-6.0cqw"
                :class="[roundStore.type === 'sing' ? 'gradient-title-sing' : 'gradient-title-versus']"
              >
                {{ song.meta.title }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="paused" class="flex flex-col justify-center absolute h-full w-full px-5cqw">
        <WideButton
          v-for="(button, i) in buttons"
          :key="button.label"
          :label="button.label"
          :gradient="{ start: '#36D1DC', end: '#5B86E5' }"
          :active="position === i"
          @mouseenter="() => (position = i)"
          @click="button.action"
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

.gradient-title-sing {
  background-image: linear-gradient(180deg, #11998e 0%, #38ef7d 100%);
}

.gradient-title-versus {
  background-image: linear-gradient(180deg, #7420fb 0%, #cf56e3 100%);
}
</style>
