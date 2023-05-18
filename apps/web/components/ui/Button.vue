<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'gradient'
    size?: 'default' | 'sm' | 'lg'
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    variant: 'default',
    size: 'default',
    disabled: false,
    loading: false,
  }
)

const variants = new Map([
  ['default', 'bg-primary text-primary-foreground hover:bg-foreground/90'],
  ['gradient', 'bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-500/90 hover:to-blue-500/90 '],
])
const sizes = new Map([
  ['default', 'h-9 py-2 px-4'],
  ['sm', 'h-9 px-3 rounded-md'],
  ['lg', 'h-12 py-3 px-6'],
])

const classes = computed(() => {
  const variant = variants.get(props.variant) ?? variants.get('default')
  const size = sizes.get(props.size) ?? sizes.get('default')
  return `${variant} ${size}`
})
</script>

<template>
  <button
    :disabled="props.disabled"
    class="relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
    :class="classes"
  >
    <div :class="{ 'opacity-0': props.loading }"><slot /></div>
    <div
      v-if="props.loading"
      class="absolute mx-auto my-auto i-svg-spinners-180-ring-with-bg text-xl"
      aria-hidden="true"
    />
  </button>
</template>
