<script setup lang="ts">
import placeholder from '@renderer/assets/images/cover-placeholder.png?url'
import type { MenuNavigationEvent } from '@renderer/composables/useMenuNavigation'
import type { LocalSong } from '@renderer/logic/song/song'

const router = useRouter()
const roundStore = useRoundStore()
const settingsStore = useSettingsStore()

const song = computed(() => roundStore.song as LocalSong | undefined)

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
    e.preventDefault()
  }
}

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

useMenuNavigation(useRepeatThrottleFn(e => onNavigate(e), 150))

const onNavigate = (event: MenuNavigationEvent) => {
  if (event.action === 'confirm') {
    next()
  }
}

const next = () => {
  router.push('/songs')
}

const confirm = useSoundEffect('confirm')

onBeforeUnmount(() => {
  confirm.play()
})
</script>

<template>
  <div class="w-full h-full flex items-center justify-center gradient-bg-secondary" @mouseup="onClick">
    <div class="layout relative overflow-hidden">
      <div class="absolute h-full w-full bg-black">
        <img :src="coverUrl" class="w-full h-full object-cover absolute blur-xl transform scale-110 opacity-60" @error="coverError = true">
      </div>
      <div class="w-full h-full relative py-7cqh flex flex-col">
        <div class="px-5cqw">
          <TitleBar title="Score" class="text-white!" :back-arrow="false" />
        </div>
        <div class="flex-grow px-5cqw flex items-center justify-center gap-3cqw">
          <ScoreCard
            v-if="roundStore.player1 && song && settingsStore.microphones.at(0) && song?.voices.at(0)"
            :score="roundStore.score1"
            :total-score="score1"
            :song="song"
            :player="roundStore.player1"
            :microphone="settingsStore.microphones.at(0)!"
            :voice="song?.voices.at(0)!"
          />
          <ScoreCard
            v-if="roundStore.player2 && song && settingsStore.microphones.at(1) && song?.voices.at(song.isDuet() ? 1 : 0)"
            :score="roundStore.score1"
            :total-score="score2"
            :song="song"
            :player="roundStore.player2"
            :microphone="settingsStore.microphones.at(1)!"
            :voice="song?.voices.at(song.isDuet() ? 1 : 0)!"
          />
        </div>
        <div class="px-5cqw flex justify-between">
          <KeyHints :hints="['confirm']" class="text-white!" />
          <Button :active="true" :gradient="{ start: '#11998ec5', end: '#38ef7dc5' }" @click="next">
            Continue
          </Button>
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
</style>
