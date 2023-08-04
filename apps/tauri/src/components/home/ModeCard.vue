<script setup lang="ts">
const props = defineProps<{
  active: boolean
  title: string
  description: string
  icon: string
  animation: string
}>()
</script>

<template>
  <div class="flex flex-col gap-0.5cqh py-1cqh">
    <div class="grid grid-cols-[1fr]">
      <div class="col-start-1 row-start-1">
        <span
          :class="{ 'opacity-0': !props.active }"
          class="bg-gradient-to-r bg-clip-text text-1.5cqw font-semibold text-transparent transition-opacity"
          >{{ props.title }}</span
        >
      </div>
      <div class="col-start-1 row-start-1 mt-auto">
        <h1
          :class="{ 'opacity-0': props.active }"
          class="col-start-1 row-start-1 text-0.8cqw font-semibold uppercase text-neutral transition-opacity"
        >
          {{ props.title }}
        </h1>
      </div>
    </div>
    <button
      class="transition-outline-color flex flex-grow flex-col overflow-hidden rounded-lg outline-md outline duration-200 -outline-offset-1px"
      :class="[props.active ? 'outline-white/100' : 'outline-white/0']"
    >
      <div
        class="w-full flex flex-grow items-center justify-center bg-gradient-to-b transition-border-radius"
        :class="{ 'rounded-b-lg': !props.active }"
      >
        <div
          class="block h-full max-h-1/2 max-w-1/2 w-full"
          :class="[props.icon, props.active && props.animation]"
        ></div>
      </div>
      <div
        :class="{ 'opacity-0': !props.active }"
        class="h-6cqw flex items-center bg-white px-2cqw text-start text-1cqw font-semibold text-black transition-opacity"
      >
        {{ props.description }}
      </div>
    </button>
  </div>
</template>

<style scoped>
.animate-scale {
  animation: scale 3s ease-in-out infinite;
}
@keyframes scale {
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
