<script setup lang="ts"></script>

<template>
  <main class="font-primary font-primary h-screen w-screen text-1cqw text-white">
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
