<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    margin?: boolean
  }>(),
  {
    margin: true,
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
  <div class="w-full h-full flex items-center justify-center" @mouseup="onClick">
    <div class="layout grid grid-rows-[min-content_1fr_min-content]">
      <div class="absolute w-full h-full">
        <slot name="background" />
      </div>
      <div class="px-5cqw pt-7cqh pb-1cqh relative">
        <slot name="header" />
      </div>

      <div
        class="relative overflow-y-auto scrollbar grid place-items-center children:w-full"
        :class="{ 'px-5cqw': props.margin }"
      >
        <slot />
      </div>
      <div class="px-5cqw pb-7cqh pt-1cqh relative">
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
