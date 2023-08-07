<script setup lang="ts">
import { clamp } from '~/lib/utils/math'

const props = withDefaults(
  defineProps<{
    active: boolean
    label: string
    min?: number
    max?: number
    step?: number
    clickStep?: number
  }>(),
  {
    min: 0,
    max: 100,
    step: 1,
    clickStep: 1,
  }
)

const { modelValue } = defineModels<{
  modelValue: number
}>()

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  modelValue.value = target.valueAsNumber
}

const fillPercentage = computed(() => {
  const { min, max } = props
  const value = modelValue.value
  return `${((value - min) / (max - min)) * 100}%`
})

const onClick = (direction: 'left' | 'right') => {
  const newValue = modelValue.value + (direction === 'left' ? -props.clickStep : props.clickStep)
  modelValue.value = clamp(newValue, props.min, props.max)
}

const onFocus = (e: Event) => {
  e.preventDefault()
  return false
}

const next = () => onClick('right')
const prev = () => onClick('left')

defineExpose({
  next,
  prev,
})
</script>

<template>
  <button class="grid grid-cols-[1fr] overflow-hidden rounded-lg text-1.8cqw font-bold">
    <div
      class="col-start-1 row-start-1 h-full bg-gradient-to-r transition-opacity"
      :class="{ 'opacity-0': !props.active }"
    ></div>
    <div class="z-2 col-start-1 row-start-1 flex items-center gap-3cqw px-10cqw py-2.1cqh pb-1cqh pt-1cqh">
      <div class="w-2/7 text-end">{{ props.label }}</div>
      <div class="flex flex-grow items-center gap-1cqw">
        <button class="i-sing-arrow-left block h-2.8cqh" @click="onClick('left')" />
        <div class="relative h-2.8cqh flex-grow">
          <input
            type="range"
            :min="props.min"
            :max="props.max"
            :step="props.step"
            :value="modelValue"
            class="slider h-full w-full cursor-pointer focus:shadow-none focus:outline-none focus:ring-0"
            @input="onInput"
            @keydown="onFocus"
          />
          <div
            class="pointer-events-none absolute inset-0 flex items-center justify-center rounded-0.3cqw bg-black/40 text-2cqh font-semibold"
          >
            {{ modelValue }}
          </div>
          <div
            class="bar pointer-events-none absolute inset-0 flex items-center justify-center rounded-0.3cqw bg-white text-2cqh font-semibold text-black"
          >
            {{ modelValue }}
          </div>
        </div>
        <button class="i-sing-arrow-right block h-2.8cqh" @click="onClick('right')" />
      </div>
    </div>
  </button>
</template>

<style scoped>
.bar {
  clip-path: polygon(0 0, v-bind(fillPercentage) 0, v-bind(fillPercentage) 100%, 0% 100%);
}

.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100% !important;
  height: 100% !important;
  background: transparent;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 0;
  height: 100%;
}

.slider::-webkit-slider-runnable-track {
  height: 100%;
}
</style>
