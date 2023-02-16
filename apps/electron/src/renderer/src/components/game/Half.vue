<script setup lang="ts">
import type { Note } from '@renderer/logic/song/note'
import type { LocalSong } from '@renderer/logic/song/song'
import type { PitchProcessor } from '@renderer/logic/voice/pitch-processor'
import type { Microphone } from '@renderer/stores/settings'
import Lyrics from './Lyrics.vue'
import Pitch from './Pitch.vue'

const props = defineProps<{
  song: LocalSong
  position: 'top' | 'bottom'
  voiceIndex: number
  microphone: Microphone
  pitchProcessor: PitchProcessor
}>()

const emit = defineEmits<{
  (event: 'score', note: Note): void
  (event: 'bonus', beatCount: number): void
}>()

const lyricsEl = ref<InstanceType<typeof Lyrics>>()
const pitchEl = ref<InstanceType<typeof Pitch>>()

const voice = computed(() => props.song.voices.at(props.voiceIndex)!)
const sentenceIndex = ref(0)
const sentence = computed(() => voice.value.sentences.at(sentenceIndex.value))
const nextSentence = computed(() => voice.value.sentences.at(sentenceIndex.value + 1))

const update = (beat: number) => {
  // check if sentence is over and update sentenceIndex
  if (!sentence.value) return
  if (beat >= sentence.value.linebreakBeat) {
    sentenceIndex.value++
  }
  lyricsEl.value?.update(beat)
  pitchEl.value?.update(beat)
}

defineExpose({
  update,
})
</script>

<template>
  <div
    class="flex"
    :class="[props.position === 'top' ? 'flex-col' : 'flex-col-reverse']"
  >
    <Lyrics
      ref="lyricsEl"
      :song="props.song"
      :microphone="props.microphone"
      :sentence="sentence"
      :next-sentence="nextSentence"
      :position="props.position"
    />
    <Pitch
      ref="pitchEl"
      :song="props.song"
      :sentence="sentence"
      :microphone="props.microphone"
      :position="props.position"
      class="flex-grow w-full"
      :pitch-processor="props.pitchProcessor"
      @score="(note) => emit('score', note)"
      @bonus="(beatCount) => emit('bonus', beatCount)"
    />
  </div>
</template>
