<script setup lang="ts">
const props = defineProps<{
  bottom?: boolean
}>()
</script>

<template>
  <div
    :class="{ 'border-t': props.bottom, 'border-b': !props.bottom }"
    class="flex justify-between flex-shrink-0 h-16 px-6 md:px-10 items-center bg-background/30 backdrop-blur"
  >
    <slot />
  </div>
</template>
