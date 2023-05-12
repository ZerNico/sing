<script setup lang="ts">
import SungPitchNote from './SungPitchNote.vue'
import type { Note } from '~/logic/song/note'
import type { Sentence } from '~/logic/song/sentence'
import type { LocalSong } from '~/logic/song/song'
import { millisecondInSongToBeatWithoutGap } from '~/logic/utils/bpm.utils'
import type { Beat, PitchProcessor, ProcessedBeat } from '~/logic/voice/pitch-processor'
import type { Microphone } from '~/stores/settings'

const props = defineProps<{
  song: LocalSong
  sentence?: Sentence
  position: 'top' | 'bottom'
  microphone: Microphone
  pitchProcessor: PitchProcessor
}>()

const emit = defineEmits<{
  (event: 'score', note: Note): void
  (event: 'bonus', beatCount: number): void
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
    sentence.notes.map((notes) => notes.midiNote).reduce((a, b) => a + b, 0) / sentence.notes.length
  )
  return average
})

const calculateNoteRow = (midiNote: number): number => {
  let wrappedMidiNote: number = midiNote

  const minNoteRowMidiNote = Math.floor(averageMidiNote.value - rowCount / 2)
  const maxNoteRowMidiNote = minNoteRowMidiNote + rowCount - 1

  // move by octave to fit on screen
  while (wrappedMidiNote > maxNoteRowMidiNote && wrappedMidiNote > 0) wrappedMidiNote -= 12

  while (wrappedMidiNote < minNoteRowMidiNote && wrappedMidiNote < 127) wrappedMidiNote += 12

  const offset: number = wrappedMidiNote - averageMidiNote.value
  let noteRow = Math.ceil(rowCount / 2 + offset)
  noteRow = Math.abs(noteRow - rowCount) - 1

  return noteRow
}

// display the sung pitch in the closer octave to the actual midi note for better user experience
const calculateSungNoteRow = (processedBeat: ProcessedBeat) => {
  if (processedBeat.sungNote === processedBeat.note.midiNote) return calculateNoteRow(processedBeat.sungNote)

  const noteRow = calculateNoteRow(processedBeat.sungNote)
  const alternativeNoteRow = noteRow - 12

  // check if alternative note row is inside rows
  if (alternativeNoteRow >= 0 && alternativeNoteRow < rowCount) {
    const correctNoteRow = calculateNoteRow(processedBeat.note.midiNote)

    // check what is closer to correctNoteRow
    if (Math.abs(correctNoteRow - noteRow) < Math.abs(correctNoteRow - alternativeNoteRow)) return noteRow
    else return alternativeNoteRow
  }

  return calculateNoteRow(processedBeat.sungNote)
}

const calculateGap = (note: Note, prevNote: Note): number => {
  if (!prevNote) return 0
  return note.startBeat - (prevNote.startBeat + prevNote.length)
}

const calculateGapProcessed = (note: ProcessedBeat, prevNote: ProcessedBeat): number => {
  const prevEnd = prevNote ? prevNote.beat + prevNote.length : props.sentence?.minBeat || 0
  return note.beat - prevEnd
}

const sungNoteEls = useTemplateRefsList<InstanceType<typeof SungPitchNote>>()

const processableBeats: Beat[] = []
const processedBeats = ref<ProcessedBeat[]>([])

watch(
  () => props.sentence,
  (sentence) => {
    processedBeats.value.length = 0

    sentence?.notes.forEach((note) => {
      for (let beat = 0; beat < note.length; beat++) {
        const processableBeat: Beat = {
          note,
          beat: note.startBeat + beat,
          isFirstBeat: beat === 0,
          isLastBeat: note.startBeat + beat === sentence.maxBeat - 1,
        }
        processableBeats.push(processableBeat)
      }
    })
  },
  { immediate: true }
)

const delayInBeats = computed(() => {
  return millisecondInSongToBeatWithoutGap(props.song, props.microphone.delay)
})

const update = async (currentBeat: number) => {
  // use delayed beat to adjust to microphone delay
  const delayedBeat = currentBeat - delayInBeats.value

  for (const el of sungNoteEls.value) {
    el.update(delayedBeat)
  }

  if (processableBeats.length === 0) return

  if (delayedBeat > processableBeats[0].beat + 1) {
    const beat = processableBeats.shift()
    if (props.pitchProcessor && beat) {
      props.pitchProcessor
        .process(beat)
        .then((processedBeat) => {
          handleProcessedBeat(processedBeat)
          handleScore(processedBeat)
          return
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }
}

let lastBeatWasValid = false
const handleProcessedBeat = (processedBeat: ProcessedBeat) => {
  if (processedBeat.sungNote > 0 && props.sentence && processedBeat.beat >= props.sentence.minBeat) {
    const prevNote = processedBeats.value.at(-1)
    // extend previous note if new beat is part of same note and the singing was continuous
    if (lastBeatWasValid && !processedBeat.isFirstBeat && prevNote && processedBeat.sungNote === prevNote.sungNote) {
      prevNote.length++
      // else create new displayed note
    } else {
      processedBeats.value.push(processedBeat)
    }
  }

  lastBeatWasValid = processedBeat.sungNote > 0
}

let successBeats = 0
let totalBeats = 0
const handleScore = (processedBeat: ProcessedBeat) => {
  if (processedBeat.note.type !== 'Freestyle') {
    totalBeats++
    if (processedBeat.sungNote > 0 && processedBeat.sungNote === processedBeat.note.midiNote) {
      successBeats++
      emit('score', processedBeat.note)
    }
  }

  if (processedBeat.isLastBeat) {
    if (successBeats / totalBeats >= 0.9) {
      emit('bonus', totalBeats)
    }
    successBeats = 0
    totalBeats = 0
  }
}

defineExpose({
  update,
})
</script>

<template>
  <div class="px-12cqw" :class="[props.position === 'top' ? 'pt-2cqh pb-8cqh' : 'pt-8cqh pb-2cqh']">
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
          :gap="calculateGap(note, props.sentence.notes[index - 1] || null)"
        />
      </div>
      <div v-if="props.sentence" class="absolute w-full h-full flex">
        <SungPitchNote
          v-for="(beat, index) in processedBeats"
          :key="index"
          :ref="sungNoteEls.set"
          :microphone="props.microphone"
          :row-height="rowHeight"
          :row="calculateSungNoteRow(beat)"
          :column-width="columnWidth"
          :length="beat.length"
          :midi-note="beat.sungNote"
          :gap="calculateGapProcessed(beat, processedBeats[index - 1] || null)"
          :note-type="beat.note.type"
        />
      </div>
    </div>
  </div>
</template>
