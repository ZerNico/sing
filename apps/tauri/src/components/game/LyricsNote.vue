<script setup lang="ts">
import { clamp } from '@vueuse/core'
import type { Note } from '~/logic/song/note'
import type { Microphone } from '~/stores/settings'

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

const isItalic = computed(() => {
  return props.note.type === 'Freestyle'
})

defineExpose({
  update,
})
</script>

<template>
  <div
    class="gradient whitespace-pre bg-clip-text text-transparent text-2.0cqw leading-relaxed"
    :class="[isItalic ? 'italic' : '']"
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
