<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    backArrow?: boolean
  }>(),
  {
    backArrow: true,
    description: undefined,
  }
)

const emit = defineEmits<{
  (e: 'back'): void
}>()
</script>
<template>
  <div class="flex flex-row items-center gap-0.5cqw font-semibold uppercase text-neutral-400">
    <button v-if="props.backArrow" class="i-sing-chevron-left text-2cqw" @click="emit('back')"></button>
    <div class="text-1.3cqw -mt-0.15cqw">
      {{ props.title }}
    </div>
    <div v-if="props.description" class="mt-0.25cqw text-0.8cqw">/ {{ props.description }}</div>
  </div>
</template>

<style scoped></style>
