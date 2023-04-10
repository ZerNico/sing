<script setup lang="ts">
import { Note } from '~/logic/song/note'
import type { Sentence } from '~/logic/song/sentence'
import type { LocalSong } from '~/logic/song/song'
import { millisecondInSongToBeatWithoutGap } from '~/logic/utils/bpm.utils'
import type { Microphone } from '~/stores/settings'
import LyricsNote from './LyricsNote.vue'

const props = defineProps<{
  song: LocalSong
  sentence?: Sentence
  nextSentence?: Sentence
  microphone: Microphone
  position: 'top' | 'bottom'
}>()

const lyricsNoteEls = useTemplateRefsList<InstanceType<typeof LyricsNote>>()
const emptyNote = ref(new Note('Normal', 0, 0, 0, ' '))
const nextSentence = computed(() => {
  const notes = props.nextSentence?.notes.map((note) => {
    return { text: note.text, italic: note.type === 'Freestyle' }
  })
  if (!notes) return [{ text: ' ', italic: false }]
  return notes
})

const leadInStartPercentage = ref(0)
const leadInEndPercentage = ref(0)

const calculateLeadIn = (beat: number) => {
  if (props.sentence) {
    const percentage = ((beat - props.sentence.minBeat) * -100) / millisecondInSongToBeatWithoutGap(props.song, 3000)
    leadInEndPercentage.value = percentage
    leadInStartPercentage.value = percentage + 30
  }
}

const update = (beat: number) => {
  lyricsNoteEls.value.forEach(el => el.update(beat))
  calculateLeadIn(beat)
}

defineExpose({
  update,
})
</script>

<template>
  <div class="w-full bg-black/70" :class="[props.position === 'top' ? 'pt-1.2cqh pb-0.8cqh' : 'pb-1.8cqh']">
    <div class="flex w-full">
      <div class="flex-grow pt-0.8cqw pb-0.6cqw pr-0.3cqw">
        <div v-if="props.sentence" class="lead-in h-full" />
      </div>
      <template v-if="props.sentence">
        <LyricsNote
          v-for="note in props.sentence.notes"
          :key="note.startBeat"
          :ref="lyricsNoteEls.set"
          :note="note"
          :microphone="props.microphone"
        />
      </template>
      <LyricsNote
        v-else
        :ref="lyricsNoteEls.set"
        :note="emptyNote"
        :microphone="props.microphone"
      />
      <div class="flex-grow" />
    </div>
    <div class="text-white/50 text-center text-1.7cqw -mt-0.5cqw">
      <span
        v-for="note, index in nextSentence"
        :key="index"
        class="whitespace-pre-wrap"
        :class="[note.italic ? 'italic' : '']"
      >
        {{ note.text }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.lead-in {
  background: linear-gradient(
    270deg,
    rgba(0, 0, 0, 0) v-bind('`${leadInEndPercentage}%`'),
    v-bind('props.microphone.color') v-bind('`${leadInEndPercentage}%`'),
    rgba(0, 0, 0, 0) v-bind('`${leadInStartPercentage}%`')
  );
}
</style>
