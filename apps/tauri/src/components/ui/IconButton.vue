<script setup lang="ts">
const props = defineProps<{
  active: boolean
  icon: string
  label: string
  loading?: boolean
}>()

const icon = computed(() => {
  return props.loading ? 'i-sing-spinner animate-spin' : props.icon
})
</script>

<template>
  <button>
    <div
      class="truncate text-ellipsis text-left text-1cqw font-bold leading-relaxed uppercase text-neutral transition-opacity duration-200"
    >
      {{ label }}
    </div>
    <div
      class="transition-outline-color aspect-4/5 flex items-center justify-center rounded-lg bg-gradient-to-b outline-md outline-md outline duration-200 -outline-offset-1px"
      :class="[props.active ? 'outline-white/100' : 'outline-white/0']"
    >
      <div class="block h-full max-h-1/2 max-w-1/2 w-full" :class="icon"></div>
    </div>
  </button>
</template>
