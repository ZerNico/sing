<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    backArrow?: boolean
  }>(),
  {
    backArrow: true,
  },
)

const emit = defineEmits<{
  (e: 'back'): void
}>()
</script>

<template>
  <div class="flex flex-row items-center gap-0.5cqw text-neutral-400 font-semibold uppercase">
    <Icon v-if="props.backArrow" icon="ChevronLeft" role="button" class="text-2cqw" @click="emit('back')" />
    <div class="text-1.3cqw -mt-0.15cqw">
      {{ props.title }}
    </div>
    <div v-if="props.description" class="text-0.8cqw mt-0.25cqw">
      / {{ props.description }}
    </div>
  </div>
</template>
