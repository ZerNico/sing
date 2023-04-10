<script setup lang="ts">
import type * as icons from '~/logic/ui/icons'

const props = defineProps<{
  active: boolean
  gradient: { start: string; end: string }
  title: string
  icon: keyof typeof icons
  description: string
  animation?: 'spin' | 'pulse'
}>()
</script>

<template>
  <div role="button" class="flex flex-col gap-0.7cqh">
    <div class="relative">
      <span
        class="absolute bottom-0 left-0 text-1cqw text-neutral-400 font-bold uppercase transition-opacity duration-200 leading-loose"
        :class="{ 'opacity-0': props.active }"
      >
        {{ props.title }}
      </span>
      <span
        class="text-1.5cqw font-bold bg-clip-text text-transparent gradient-title transition-opacity duration-200"
        :class="{ 'opacity-0': !props.active }"
      >
        {{ props.title }}
      </span>
    </div>
    <div
      class="flex-grow flex flex-col min-h-0 transition-all duration-300 outline outline-0.35cqh rounded-0.45cqw"
      :class="[props.active ? 'outline-white' : 'outline-white/0']"
    >
      <div
        class="flex-grow min-w-0 gradient-bg flex items-center justify-center rounded-t-0.4cqw transition-all duration-300"
        :class="{ 'rounded-b-0.4cqw': !props.active }"
      >
        <Icon
          :icon="props.icon" class="block w-1/2 h-1/2"
          :class="{
            'animate-spin-10000': props.animation === 'spin' && props.active,
            'animate-pulse': props.animation === 'pulse' && props.active,
          }"
        />
      </div>
      <div
        class="h-5cqw text-1cqw flex items-center justify-center px-2cqw text-black font-semibold bg-white transition-opacity duration-300 rounded-b-0.4cqw"
        :class="{ 'opacity-0': !props.active }"
      >
        {{ props.description }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.gradient-bg {
  aspect-ratio: 7 / 4;
  background: linear-gradient(
    180deg,
    v-bind('props.gradient.start') 0%,
    v-bind('props.gradient.end') 100%
  );
}

.gradient-title {
  background-image: linear-gradient(
    90deg,
    v-bind('props.gradient.start') 0%,
    v-bind('props.gradient.end') 100%
  );
}

.animate-pulse {
  animation: pulse 3s ease-in-out infinite;
}
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
