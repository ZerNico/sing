<script setup lang="ts">
import type { Note } from '@renderer/logic/song/note'
import type { Sentence } from '@renderer/logic/song/sentence'
import type { LocalSong } from '@renderer/logic/song/song'
import type { Microphone } from '@renderer/stores/settings'

const props = defineProps<{
  song: LocalSong
  sentence?: Sentence
  position: 'top' | 'bottom'
  microphone: Microphone
}>()

const rowCount = 16
const noteFieldEl = ref<HTMLDivElement>()
const noteFieldSize = useElementSize(noteFieldEl)

const rowHeight = computed(() => {
  return noteFieldSize.height.value / rowCount - 1
})

const columnWidth = computed(() => {
  if (!props.sentence) return 0
  return noteFieldSize.width.value / props.sentence.length
})

const averageMidiNote = computed(() => {
  const sentence = props.sentence
  if (!sentence) return 0
  const average = Math.round(
    sentence.notes.map(notes => notes.midiNote).reduce((a, b) => a + b, 0)
      / sentence.notes.length,
  )
  return average
})

const calculateNoteRow = (midiNote: number): number => {
  let wrappedMidiNote: number = midiNote

  const minNoteRowMidiNote = Math.floor(averageMidiNote.value - rowCount / 2)
  const maxNoteRowMidiNote = minNoteRowMidiNote + rowCount - 1

  // move by octave to fit on screen
  while (wrappedMidiNote > maxNoteRowMidiNote && wrappedMidiNote > 0)
    wrappedMidiNote -= 12

  while (wrappedMidiNote < minNoteRowMidiNote && wrappedMidiNote < 127)
    wrappedMidiNote += 12

  const offset: number = wrappedMidiNote - averageMidiNote.value
  let noteRow = Math.ceil(rowCount / 2 + offset)
  noteRow = Math.abs(noteRow - rowCount) - 1

  return noteRow
}

const calculateGap = (note: Note, prevNote: Note): number => {
  if (!prevNote) return 0
  return note.startBeat - (prevNote.startBeat + prevNote.length)
}
</script>

<template>
  <div
    class="px-12cqw"
    :class="[props.position === 'top' ? 'pt-2cqh pb-8cqh' : 'pt-8cqh pb-2cqh']"
  >
    <div class="relative w-full h-full">
      <div v-if="props.sentence" ref="noteFieldEl" class="absolute w-full h-full flex">
        <PitchNote
          v-for="(note, index) in props.sentence.notes"
          :key="index"
          :row-height="rowHeight"
          :row="calculateNoteRow(note.midiNote)"
          :column-width="columnWidth"
          :length="note.length"
          :midi-note="note.midiNote"
          :note-type="note.type"
          :gap="
            calculateGap(note, props.sentence.notes[index - 1] || null)
          "
        />
      </div>
    </div>
  </div>
</template>
