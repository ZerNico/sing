<script setup lang="ts">
import { appWindow } from '@tauri-apps/api/window'
import '@fontsource/open-sans/latin.css'

const { client } = useTRPC()

useEventListener('keydown', async (e: KeyboardEvent) => {
  // prevent tab button from focusing on the next element
  if (e.key === 'Tab') {
    e.preventDefault()
  }
  // prevent arrow keys from scrolling the page
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault()
  }

  // full screen on alt or command + enter
  if (e.key === 'Enter' && (e.altKey || e.metaKey)) {
    e.preventDefault()
    const isFullscreen = await appWindow.isFullscreen()
    if (isFullscreen) {
      appWindow.setFullscreen(false)
    } else {
      appWindow.setFullscreen(true)
    }
  }
})

// hide the mouse cursor when idle

const mouseHidden = ref(false)
const hideMouseFn = useDebounceFn(() => {
  mouseHidden.value = true
}, 1000)

useEventListener('mousemove', () => {
  mouseHidden.value = false
  hideMouseFn()
})

useEventListener('beforeunload', async () => {
  await client.lobby.delete.mutate()
  return true
})
</script>

<template>
  <main class="h-screen w-screen text-white font-primary" :class="{ 'cursor-none': mouseHidden }">
    <RouterView v-slot="{ Component }">
      <transition name="fade">
        <component :is="Component" />
      </transition>
    </RouterView>
  </main>
</template>

<style lang="scss">
@import './assets/css/styles.scss';

.fade-leave-active {
  transition: opacity 0.3s ease-out;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  z-index: 999;
}
</style>
