<script setup lang="ts">
import type { NoteType } from '@renderer/logic/song/note'
import { clamp } from '@renderer/logic/utils/math.utils'
import type { Microphone } from '@renderer/stores/settings'

const props = defineProps<{
  row: number
  rowHeight: number
  columnWidth: number
  length: number
  midiNote: number
  gap: number
  microphone: Microphone
  noteType: NoteType
}>()

const fillPercentage = ref(0)

const topMargin = computed(() => {
  return props.row * props.rowHeight
})

const noteWidth = computed(() => {
  return clamp(fillPercentage.value, 1, props.length) * props.columnWidth
})

const gapWidth = computed(() => {
  return props.columnWidth * props.gap
})

let firstBeat: number

const gradientPercentage = computed(() => {
  return Math.min(fillPercentage.value, 100) * 100
})

const update = (delayedBeat: number) => {
  if (firstBeat === undefined) firstBeat = delayedBeat
  fillPercentage.value = delayedBeat - firstBeat
}

defineExpose({
  update,
})
</script>

<template>
  <div class="spacer" />
  <div class="wrapper py-0.35cqw" :class="{ 'opacity-0': props.noteType === 'Freestyle' }">
    <div class="note rounded-full h-full mx-0.35cqw" />
  </div>
</template>

<style scoped>
.wrapper {
  margin-top: v-bind('`${topMargin}px`');
  height: v-bind('`${props.rowHeight * 2}px`');
  width: v-bind('`${noteWidth}px`');
}

.note {
  background: linear-gradient(
    90deg,
    v-bind('props.microphone.color') v-bind('`${gradientPercentage}%`'),
    #0000 v-bind('`${gradientPercentage}%`')
  );
}

.spacer {
  width: v-bind('`${gapWidth}px`');
}
</style>
