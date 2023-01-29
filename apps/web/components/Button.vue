<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
}>()
</script>

<template>
  <button
    :disabled="props.disabled"
    class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:(ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-700)"
    :class="{ 'opacity-50 cursor-not-allowed': props.disabled }"
  >
    <slot />
  </button>
</template>
