<script setup lang="ts">
import { TransitionPresets } from '@vueuse/core'
import type { LocalSong } from '~/logic/song/song'
import type { Voice } from '~/logic/song/voice'
import type { User } from '~/logic/types'
import type { Score } from '~/stores/round'
import type { Microphone } from '~/stores/settings'

const props = defineProps<{
  song: LocalSong
  player: User
  score: Score
  totalScore: number
  microphone: Microphone
  voice: Voice
}>()

const textVisible = ref(false)
const ready = ref(false)

onMounted(() => {
  setTimeout(() => {
    ready.value = true
  }, 300)
  setTimeout(() => {
    textVisible.value = true
  }, 2500)
})

const score = computed(() => {
  if (!ready.value) return 0
  return props.totalScore
})

const inTuneNotePercentage = computed(() => {
  if (!ready.value) return 0
  const noteScore = props.score.score
  const maxNoteScore = props.voice.getMaxScore().noteScore
  return Math.round((noteScore / maxNoteScore) * 100)
})

const inTuneGoldenNotePercentage = computed(() => {
  if (!ready.value) return 0
  const goldenNoteScore = props.score.goldenScore
  const maxGoldenNoteScore = props.voice.getMaxScore().goldenScore
  if (maxGoldenNoteScore === 0) return 100
  return Math.round((goldenNoteScore / maxGoldenNoteScore) * 100)
})

const bonusPercentage = computed(() => {
  if (!ready.value) return 0
  const bonusScore = props.score.bonusScore
  const maxBonusScore = props.voice.getMaxScore().bonusScore
  return Math.round((bonusScore / maxBonusScore) * 100)
})

const transitionOptions = {
  duration: 2000,
  transition: TransitionPresets.easeOutCubic,
}
const scoreOutput = useTransition(score, transitionOptions)
const inTuneNotePercentageOutput = useTransition(inTuneNotePercentage, transitionOptions)
const inTuneGoldenNotePercentageOutput = useTransition(inTuneGoldenNotePercentage, transitionOptions)
const bonusPercentageOutput = useTransition(bonusPercentage, transitionOptions)

const text = computed(() => {
  const totalScore = props.totalScore
  if (totalScore < 1000) return 'Tone-Deaf'
  if (totalScore < 2000) return 'Off-Key'
  if (totalScore < 3000) return 'Amateur'
  if (totalScore < 4000) return 'Almost there'
  if (totalScore < 5000) return 'Solid'
  if (totalScore < 6000) return 'In-Tune'
  if (totalScore < 7000) return 'Singer'
  if (totalScore < 8000) return 'Legend'
  if (totalScore < 9000) return 'Superstar'
  return 'Pitch-Perfect'
})
</script>

<template>
  <div class="w-20cqw rounded-0.45cqw bg-black overflow-hidden">
    <div class="w-full h-full card flex flex-col items-center py-2cqw px-2.5cqw gap-1.5cqw">
      <div class="flex flex-col items-center gap-0.3cqw max-w-full">
        <Avatar
          :username="player.username"
          :src="player.picture || undefined"
          class="w-3cqw! h-3cqw! text-1.5cqw! border outline outline-0.2cqw"
        />
        <div class="font-semibold text-1.9cqw truncate text-ellipsis max-w-full">
          {{ player.username }}
        </div>
      </div>
      <div class="w-full rounded-0.45cqw overflow-hidden text-center min-h-0">
        <div class="bg-white/30">
          <span
            class="transition-opacity duration-500 leading-loose text-1.2cqw font-semibold"
            :class="{ 'opacity-0': !textVisible }"
          >
            {{ text }}
          </span>
        </div>
        <div class="bg-black/30 text-3cqw font-bold">
          {{ Math.round(scoreOutput) }}
        </div>
      </div>
      <div class="w-full flex flex-col gap-1cqw">
        <div>
          <div class="flex justify-between items-center">
            <div class="text-0.8cqw uppercase">In-Tune Notes</div>
            <div class="text-1cqw">{{ Math.round(inTuneNotePercentageOutput) }}%</div>
          </div>
          <div class="h-1cqw w-full rounded-0.3cqw border border-0.15cqw in-tune-progress" />
        </div>
        <div>
          <div class="flex justify-between items-center">
            <div class="text-0.8cqw uppercase">Golden Notes</div>
            <div class="text-1cqw">{{ Math.round(inTuneGoldenNotePercentageOutput) }}%</div>
          </div>
          <div class="h-1cqw w-full rounded-0.3cqw border border-0.15cqw golden-progress" />
        </div>
        <div>
          <div class="flex justify-between items-center">
            <div class="text-0.8cqw uppercase">Perfect Singing</div>
            <div class="text-1cqw">{{ Math.round(bonusPercentageOutput) }}%</div>
          </div>
          <div class="h-1cqw w-full rounded-0.3cqw border border-0.15cqw perfect-progress" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: linear-gradient(180deg, v-bind('`${microphone.color}`') 0%, v-bind('`${microphone.color}B0`') 100%);
}

.banner {
  background: linear-gradient(90deg, #facc1530 0%, #facc15d0 50%, #facc1530 100%);
}

.score {
  background-color: v-bind('microphone.color');
}

.in-tune-progress {
  background: linear-gradient(
    90deg,
    #fff v-bind('`${inTuneNotePercentageOutput}%`'),
    #fff5 v-bind('`${inTuneNotePercentageOutput}%`')
  );
}

.golden-progress {
  background: linear-gradient(
    90deg,
    #fff v-bind('`${inTuneGoldenNotePercentageOutput}%`'),
    #fff5 v-bind('`${inTuneGoldenNotePercentageOutput}%`')
  );
}

.perfect-progress {
  background: linear-gradient(
    90deg,
    #fff v-bind('`${bonusPercentageOutput}%`'),
    #fff5 v-bind('`${bonusPercentageOutput}%`')
  );
}
</style>
