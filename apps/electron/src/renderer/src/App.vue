<script setup lang="ts">
useEventListener('keydown', (e: KeyboardEvent) => {
  // prevent tab button from focusing on the next element
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
  <main class="h-screen w-screen text-white">
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
