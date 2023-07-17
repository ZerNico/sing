<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    margin?: boolean
    scrolling?: boolean
  }>(),
  {
    margin: true,
    scrolling: true,
  }
)

const emit = defineEmits<{
  (event: 'back'): void
  (event: 'forward'): void
}>()

const onClick = (e: MouseEvent) => {
  if (e.button === 4) {
    emit('forward')
    e.preventDefault()
  } else if (e.button === 3) {
    emit('back')
    e.preventDefault()
  }
}
</script>

<template>
  <div class="h-full w-full flex items-center justify-center" @mouseup="onClick">
    <div class="layout relative grid grid-rows-[min-content_1fr_min-content]">
      <NotificationHandler class="absolute right-0 top-0 z-10 px-5cqw pb-1cqh pt-7cqh" />
      <div class="absolute h-full w-full">
        <slot name="background" />
      </div>
      <div class="relative px-5cqw pb-1cqh pt-7cqh">
        <slot name="header" />
      </div>

      <div
        class="scrollbar relative grid place-items-center children:w-full"
        :class="{ 'px-5cqw': props.margin, 'overflow-y-auto': props.scrolling }"
      >
        <slot />
      </div>
      <div class="relative px-5cqw pb-7cqh pt-1cqh">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout {
  height: 100%;
  width: 100%;
  container-type: size;
}

@media (min-aspect-ratio: 21/9) {
  .layout {
    aspect-ratio: 21 / 9;
    height: 100%;
    width: auto;
  }
}

@media (max-aspect-ratio: 1/1) {
  .layout {
    aspect-ratio: 1 / 1;
    height: auto;
    width: 100%;
  }
}

.scrollbar::-webkit-scrollbar {
  width: 5px;
}

.scrollbar::-webkit-scrollbar-track {
  background: #666;
}

.scrollbar::-webkit-scrollbar-thumb {
  background: #ddd;
  height: 10px;
}
</style>
