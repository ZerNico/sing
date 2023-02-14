<script setup lang="ts">
import type { Note } from '@renderer/logic/song/note'
import type { Microphone } from '@renderer/stores/settings'
import { clamp } from '@vueuse/core'

const props = defineProps<{
  note: Note
  microphone: Microphone
}>()

const percentage = ref(0)

const update = (beat: number) => {
  if (beat < props.note.startBeat) return
  const per = ((beat - props.note.startBeat) * 100) / props.note.length
  percentage.value = clamp(per, 0, 100)
}

defineExpose({
  update,
})
</script>

<template>
  <div
    class="gradient whitespace-pre bg-clip-text text-transparent text-2.0cqw leading-relaxed"
    :class="{ italic: ['Freestyle', 'Rap', 'RapGolden'].includes(props.note.type) }"
  >
    {{ props.note.text }}
  </div>
</template>

<style scoped>
.gradient {
  background-image: linear-gradient(
    90deg,
    v-bind('props.microphone.color') v-bind('`${percentage}%`'),
    white v-bind('`${percentage}%`')
  );
}
</style>
