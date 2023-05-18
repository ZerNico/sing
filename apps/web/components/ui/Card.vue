<script setup lang="ts">
const props = defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
    <div v-if="props.title || props.description" class="flex flex-col space-y-1.5 px-6 pt-6">
      <h3 v-if="props.title" class="text-lg font-semibold leading-none tracking-tight">{{ props.title }}</h3>
      <p v-if="props.description" class="text-sm text-muted-foreground">{{ props.description }}</p>
    </div>
    <div v-if="$slots.default" class="p-6 grid gap-4">
      <slot />
    </div>
    <div v-else class="py-3"></div>
    <div v-if="$slots.footer" class="px-6 pb-6">
      <slot name="footer" />
    </div>
  </div>
</template>
