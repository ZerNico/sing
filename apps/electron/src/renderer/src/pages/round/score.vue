<script setup lang="ts">
import placeholder from '@renderer/assets/images/cover-placeholder.png?url'
import type { MenuNavigationEvent } from '@renderer/composables/useMenuNavigation'
import type { LocalSong } from '@renderer/logic/song/song'

const router = useRouter()
const roundStore = useRoundStore()
const settingsStore = useSettingsStore()
const versusStore = useVersusStore()
const { client } = useTRPC()

const song = computed(() => roundStore.song as LocalSong | undefined)

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
  if (isLoading.value) return
  if (roundStore.type === 'sing') {
    router.push('/songs')
  } else if (roundStore.type === 'versus') {
    addVersusScore()
    router.push('/party/versus')
  }
}

const addVersusScore = () => {
  // if both scores are 0, skip
  if (score1.value === 0 && score2.value === 0) return

  // remove first matchup
  const matchup = versusStore.matchups.shift()
  if (!matchup) return
  // find players in score and add score, increase rounds and if won, increase wins
  const p1 = versusStore.scores.find(s => s.player.id === matchup.player1.id)
  const p2 = versusStore.scores.find(s => s.player.id === matchup.player2.id)
  if (!p1 || !p2) return
  p1.score += score1.value
  p2.score += score2.value
  p1.rounds++
  p2.rounds++
  if (score1.value > score2.value) {
    p1.wins++
  } else if (score2.value > score1.value) {
    p2.wins++
  } else {
    p1.wins += 1
    p2.wins += 1
  }
}

const confirm = useSoundEffect('confirm')

onBeforeUnmount(() => {
  confirm.play()
})

const uploadHighscore = async () => {
  if (!song.value) return

  if (roundStore.player1 && roundStore.player1.id !== 'guest') {
    await client.highscore.create.mutate({
      userId: roundStore.player1.id,
      score: score1.value,
      hash: song.value.meta.hash,
    })
  }

  if (roundStore.player2 && roundStore.player2.id !== 'guest') {
    await client.highscore.create.mutate({
      userId: roundStore.player2.id,
      score: score2.value,
      hash: song.value.meta.hash,
    })
  }
}

const fallback = useOfflineFallbackFn(uploadHighscore, async () => {})

const { isLoading, mutate } = useMutation({
  mutationFn: fallback,
  retry: 1,
  retryDelay: 0,
})

mutate()
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
          <div class="relative">
            <Button :class="{ 'opacity-0 pointer-events-none': isLoading }" :active="true" :gradient="{ start: '#11998ec5', end: '#38ef7dc5' }" @click="next">
              Continue
            </Button>
            <Icon icon="Spinner" :class="{ 'opacity-0': !isLoading }" class="animate-spin text-2.5cqw absolute right-0 bottom-0 pointer-events-none" />
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
</style>
