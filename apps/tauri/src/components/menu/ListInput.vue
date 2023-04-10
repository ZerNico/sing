<script setup lang="ts">
const props = withDefaults(defineProps<{
  active: boolean
  label: string
  gradient: { start: string; end: string }
  options: (string | number)[]
  displayType?: 'text' | 'color'
}>(), {
  displayType: 'text',
})

const { modelValue } = defineModel<{
  modelValue: string | number
}>()

const onClick = (direction: 'left' | 'right') => {
  const index = props.options.indexOf(modelValue.value)
  if (index === -1) {
    modelValue.value = props.options[0]
    return
  }
  const newIndex = direction === 'left' ? index - 1 : index + 1
  const newValue = props.options.at(newIndex % props.options.length)
  if (newValue !== undefined) modelValue.value = newValue
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
        <div v-if="props.displayType === 'color'" class="w-50cqw flex items-center justify-center">
          <div
            class="w-2.5cqh h-2.5cqh rounded-full outline outline-2 outline-white"
            :style="`background-color: ${modelValue};`"
          />
        </div>
        <div v-else class="text-center justify-center font-semibold text-2.5cqh w-50cqw truncate text-ellipsis">
          {{ modelValue }}
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
</style>
