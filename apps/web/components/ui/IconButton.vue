<script setup lang="ts">
const props = defineProps<{
  type?: 'button' | 'submit' | 'reset'
}>()
</script>

<template>
  <button
    :type="props.type"
    class="h-8 w-8 transition-colors hover:bg-accent text-xl rounded-full flex items-center justify-center"
  >
    <slot />
  </button>
</template>
