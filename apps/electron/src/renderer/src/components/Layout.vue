<script setup lang="ts">
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

// prevent tab button from focusing on the next element
useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    e.preventDefault()
  }
  // prevent arrow keys from scrolling the page
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault()
  }
})
</script>

<template>
  <div class="w-full h-full flex items-center justify-center" @mouseup="onClick">
    <div class="layout flex flex-col py-7cqh">
      <div class="px-5cqw">
        <slot name="header" />
      </div>
      <div class="flex-grow overflow-y-auto scrollbar children:(h-full w-full)">
        <slot />
      </div>
      <div class="px-5cqw">
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
