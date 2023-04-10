<script setup lang="ts">
import type { User } from '~/logic/types'
import type { Microphone } from '~/stores/settings'

const props = defineProps<{
  player1: User | undefined
  player2: User | undefined
  score1: number
  score2: number
  microphones: Microphone[]
}>()

const progress = ref(0)
const leader = ref(-1)

const leaderColor = computed(() => {
  if (leader.value === -1) return '#FFF'
  if (leader.value === 0) return props.microphones.at(0)?.color ?? '#FFF'
  return props.microphones.at(1)?.color ?? '#FFF'
})

const scoreToString = (score: number) => {
  const locale = navigator?.language || 'en-US'
  return score.toLocaleString(locale)
}

const color = computed(() => {
  return (index: number) => {
    const color = props.microphones?.at(index)?.color ?? '#FFF0'
    return color
  }
})

const update = (currentTime: number, duration: number) => {
  progress.value = (currentTime / duration) * 100
}

useIntervalFn(() => {
  if (!props.player1 && !props.player2) return

  if (!props.player2) leader.value = 0
  else if (!props.player1) leader.value = 1
  else if (props.score1 > props.score2) leader.value = 0
  else if (props.score2 > props.score1) leader.value = 1
  else leader.value = -1
}, 1000, { immediate: true })

defineExpose({
  update,
})
</script>

<template>
  <div class="flex flex-col justify-center">
    <div
      class="w-full flex justify-between px-5cqw items-end"
      :class="{ 'opacity-0': !player1 }"
    >
      <div class="flex items-center gap-0.5cqw pb-1.5cqh">
        <Avatar :src="props.player1?.picture || undefined" :username="props.player1?.username" />
        <div class="font-semibold text-1cqw">
          {{ props.player1?.username || '' }}
        </div>
      </div>
      <div class="text-3cqw pb-0.5cqw pt-0.2cqw" :style="`color: ${color(0)}`">
        {{ scoreToString(props.score1) }}
      </div>
    </div>
    <div class="w-full px-5cqw">
      <div class="progress h-0.5cqh rounded-full" />
    </div>
    <div
      class="w-full flex justify-between px-5cqw items-start"
      :class="{ 'opacity-0': !player2 }"
    >
      <div class="flex items-center gap-0.5cqw pt-1.5cqh">
        <Avatar :src="props.player2?.picture || undefined" :username="props.player2?.username" />
        <div class="font-semibold text-1cqw">
          {{ props.player2?.username || '' }}
        </div>
      </div>
      <div class="text-3cqw pt-0.2cqw pb-0.5cqw" :style="`color: ${color(1)}`">
        {{ scoreToString(props.score2) }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress {
  background: linear-gradient(
    90deg,
    v-bind(leaderColor) v-bind('`${progress}%`'),
    #fff2 v-bind('`${progress}%`')
  );
}
</style>
