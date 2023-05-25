<script setup lang="ts">
const props = defineProps<{
  active: boolean
  label: string
  gradient: { start: string; end: string }
}>()
</script>

<template>
  <div class="relative cursor-pointer pt-1.7cqh pb-1.8cqh">
    <div class="text-center text-white font-bold relative z-1 text-1.8cqw">
      {{ label }}
    </div>
    <div
      class="absolute w-full h-full transition-all duration-300 bg top-0 left-0 rounded-0.45cqw"
      :class="!active && 'opacity-0'"
    />
  </div>
</template>

<style scoped>
.bg {
  background: linear-gradient(90deg, v-bind('props.gradient.start') 0%, v-bind('props.gradient.end') 100%);
}
</style>
