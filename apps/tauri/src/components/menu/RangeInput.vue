<script setup lang="ts">
import { clamp } from '~/logic/utils/math.utils'

const props = withDefaults(defineProps<{
  active: boolean
  label: string
  gradient: { start: string; end: string }
  min?: number
  max?: number
  step?: number
  clickStep?: number
}>(), {
  min: 0,
  max: 100,
  step: 1,
  clickStep: 1,
})

const { modelValue } = defineModel<{
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
  <div class="relative py-2.1cqh select-none">
    <div class="relative z-1 flex items-center gap-1cqh px-10cqw">
      <div class="text-white h-full font-bold text-1.5cqw flex items-center justify-center flex-grow">
        {{ label }}
      </div>
      <div class="flex items-center gap-2cqh">
        <Icon
          role="button"
          icon="TriangleArrow"
          class="rotate-90 transform h-2.8cqh w-auto"
          @click="onClick('left')"
        />
        <div class="relative h-2.8cqh w-50cqw">
          <input
            type="range"
            :min="props.min"
            :max="props.max"
            :step="props.step"
            :value="modelValue"
            class="w-full h-full cursor-pointer slider focus:outline-none focus:ring-0 focus:shadow-none"
            @input="onInput"
            @keydown="onFocus"
          >
          <div class="absolute inset-0 bg-black/40 pointer-events-none rounded-0.3cqw flex items-center justify-center font-semibold text-2cqh">
            {{ modelValue }}
          </div>
          <div class="absolute inset-0 bg-white pointer-events-none rounded-0.3cqw bar flex items-center justify-center font-semibold text-2cqh text-black">
            {{ modelValue }}
          </div>
        </div>
        <Icon
          role="button"
          icon="TriangleArrow"
          class="rotate-270 transform h-2.8cqh w-auto"
          @click="onClick('right')"
        />
      </div>
    </div>
    <div
      class="absolute w-full h-full transition-all duration-300 bg top-0 left-0"
      :class="!active && 'opacity-0'"
    />
  </div>
</template>

<style scoped>
.bg {
  background: linear-gradient(
    90deg,
    v-bind('props.gradient.start') 0%,
    v-bind('props.gradient.end') 100%
  );
}

.bar {
  clip-path: polygon(
    0 0,
    v-bind(fillPercentage) 0,
    v-bind(fillPercentage) 100%,
    0% 100%
  );
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
