<script setup lang="ts">
const props = defineProps<{
  to?: string
  active?: boolean
  icon: string
}>()
</script>

<template>
  <div class="h-full relative flex items-center">
    <NuxtLink
      :to="to"
      class="w-full rounded-md px-3 py-2 flex items-center text-sm md:text-base md:gap-2 md:flex-row flex-col transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <div class="text-2xl" :class="props.icon"></div>
      <slot />
    </NuxtLink>
    <div v-if="props.active" class="absolute w-full bottom-0 px-2">
      <div class="h-1 w-full bg-primary rounded-full"></div>
    </div>
  </div>
</template>
