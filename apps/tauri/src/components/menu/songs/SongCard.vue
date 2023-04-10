<script setup lang="ts">
import type { LocalSong } from '~/logic/song/song'
import placeholder from '~/assets/images/cover-placeholder.png?url'

const props = defineProps<{
  song: LocalSong
  active: boolean
  sortTag?: string
  disableAnimation?: boolean
}>()

const coverError = ref(false)

const coverUrl = computed(() => {
  if (props.song?.urls.cover && !coverError.value && props.song.urls.cover) {
    return props.song.urls.cover
  }
  return placeholder
})

watch(
  () => props.song.urls.cover,
  () => {
    coverError.value = false
  },
)

const onTransitionEnd = (e: TransitionEvent) => {
  e.stopPropagation()
}

const onError = (e: Event) => {
  console.log(e)
}
</script>

<template>
  <div class="h-full aspect-square">
    <div
      class="w-full h-full relative"
      :class="{
        'transform-gpu -translate-x-1/3': props.active,
        'transition-transform duration-150': !props.disableAnimation,
      }"
    >
      <div class="w-full h-full bg-black relative">
        <img
          class="object-cover w-full h-full backface-hidden"
          :src="placeholder"
        >
        <img
          class="object-cover w-full h-full backface-hidden absolute inset-0"
          :src="coverUrl"
          @error="onError"
          @transitionend="onTransitionEnd"
        >
      </div>
      <div
        v-if="props.sortTag"
        class="absolute top-0 left-0 transform -translate-x-1/2 z-2 tag rounded-full px-2cqh pt-0.5cqh pb-0.4cqh text-1.7cqh text-white mt-1/15"
      >
        {{ props.sortTag }}
      </div>
      <div
        class="flex flex-col justify-center items-center absolute top-0 left-0 w-full h-full gradient-bg outline-white outline outline-0.4cqh outline-offset--0.38cqh text-white gap-1cqh font-500 px-1/6 pointer-events-none"
        :class="{
          'opacity-0': !props.active,
          'transition-opacity duration-250': !props.disableAnimation,
        }"
      >
        <p class="text-1.8cqh">
          {{ props.song.meta.title }}
        </p>
        <div class="border-white border-b-2 w-4 mt-2 mb-1" />
        <p class="text-1.3cqh">
          {{ props.song.meta.artist }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gradient-bg {
  background: linear-gradient(
    180deg,
    rgba(15, 133, 123, 0.9) 0%,
    rgba(46, 196, 104, 0.9) 100%
  );
}

.tag {
  background-color: rgba(46, 196, 104, 1);
}
</style>
