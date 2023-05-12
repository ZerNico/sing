<script setup lang="ts">
import type { NoteType } from '~/logic/song/note'

const props = defineProps<{
  row: number
  rowHeight: number
  columnWidth: number
  length: number
  midiNote: number
  gap: number
  noteType: NoteType
}>()

const topMargin = computed(() => {
  return props.row * props.rowHeight
})

const noteWidth = computed(() => {
  return props.columnWidth * props.length
})

const gapWidth = computed(() => {
  return props.columnWidth * props.gap
})
</script>

<template>
  <div class="spacer" />
  <div class="wrapper" :class="{ 'opacity-0': props.noteType === 'Freestyle' }">
    <div
      class="rounded-full shadow-md h-full pitch-border"
      :class="[props.noteType === 'Golden' ? 'border-yellow-400 bg-yellow-400/20' : 'bg-black/20']"
    />
  </div>
</template>

<style scoped>
.wrapper {
  margin-top: v-bind('`${topMargin}px`');
  height: v-bind('`${props.rowHeight * 2}px`');
  width: v-bind('`${noteWidth}px`');
}

.spacer {
  width: v-bind('`${gapWidth}px`');
}

.pitch-border {
  border-width: 0.15cqw;
}
</style>
