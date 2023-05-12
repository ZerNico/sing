<script setup lang="ts">
const props = defineProps<{
  active: boolean
  gradient: { start: string; end: string }
}>()
</script>

<template>
  <button
    class="bg rounded-0.4cqw px-1cqw py-0.3cqw text-1.2cqw font-semibold"
    :class="{ 'outline outline-0.15cqw': props.active }"
  >
    <slot />
  </button>
</template>

<style scoped>
.bg {
  background: linear-gradient(180deg, v-bind('props.gradient.start') 0%, v-bind('props.gradient.end') 100%);
}
</style>
