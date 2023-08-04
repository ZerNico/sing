<script setup lang="ts">
const props = defineProps<{
  active: boolean
}>()
</script>

<template>
  <button class="grid grid-cols-[1fr] overflow-hidden rounded-lg text-1.8cqw font-bold">
    <div
      class="col-start-1 row-start-1 h-full bg-gradient-to-r transition-opacity"
      :class="{ 'opacity-0': !props.active }"
    ></div>
    <div class="z-2 col-start-1 row-start-1 pb-1cqh pt-1cqh"><slot /></div>
  </button>
</template>
