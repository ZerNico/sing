<script setup lang="ts">
const mouseHidden = ref(false)
const hideMouseFn = useDebounceFn(() => {
  mouseHidden.value = true
}, 1000)

useEventListener('mousemove', () => {
  mouseHidden.value = false
  hideMouseFn()
})
</script>

<template>
  <main
    class="font-primary font-primary h-screen w-screen text-1cqw text-white"
    :class="{ 'cursor-none': mouseHidden }"
  >
    <RouterView v-slot="{ Component }">
      <transition name="fade">
        <component :is="Component" />
      </transition>
    </RouterView>
  </main>
</template>

<style scoped>
.fade-leave-active {
  transition: opacity 0.3s ease-out;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  z-index: 999;
}
</style>
