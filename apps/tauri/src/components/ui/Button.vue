<script setup lang="ts">
type Variant = 'sing' | 'party'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    active?: boolean
  }>(),
  {
    variant: 'sing',
    active: false,
  }
)

const variantMap = new Map<Variant, string>([
  ['sing', 'bg-gradient-to-r from-sing-start to-sing-end'],
  ['party', 'bg-gradient-to-r from-party-start to-party-end'],
])

const classes = computed(() => {
  return [
    variantMap.get(props.variant),
    {
      'outline outline-md': props.active,
    },
  ]
})
</script>

<template>
  <button class="rounded-md px-1cqw py-0.3cqw text-1.2cqw font-semibold" :class="classes"><slot /></button>
</template>

<style scoped></style>
