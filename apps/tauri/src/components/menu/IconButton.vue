<script setup lang="ts">
import type * as icons from '~/logic/ui/icons'

const props = defineProps<{
  active: boolean
  label: string
  icon: keyof typeof icons
  gradient: { start: string; end: string }
  loading?: boolean
}>()
</script>

<template>
  <div class="flex flex-col gap-2" role="button">
    <div
      class="text-neutral-400 truncate text-ellipsis font-bold uppercase transition-opacity duration-200 leading-relaxed text-1cqw"
    >
      {{ label }}
    </div>

    <div
      class="flex-grow flex flex-col outline outline-3 rounded-0.5cqw transition-all duration-300"
      :class="[props.active ? 'outline-white' : 'outline-white/0']"
    >
      <div
        class="banner flex justify-center items-center rounded-0.4cqw transition-all duration-300"
      >
        <Icon
          v-if="!loading"
          class="text-white !w-1/2 !h-1/2 block"
          :icon="icon"
        />
        <Icon
          v-else
          class="text-white !w-1/2 !h-1/2 block animate-spin"
          icon="Spinner"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.banner {
  aspect-ratio: 4 / 5;
  background: linear-gradient(
    180deg,
    v-bind('props.gradient.start') 0%,
    v-bind('props.gradient.end') 100%
  );
}
</style>
