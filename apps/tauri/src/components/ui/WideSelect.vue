<script setup lang="ts" generic="T extends string | number">
const props = defineProps<{
  active: boolean
  label: string
  values: T[]
}>()

const modelValue: Ref<T | undefined> = defineModel({ required: true })

const onClick = (direction: 'left' | 'right') => {
  if (!modelValue.value) {
    modelValue.value = props.values.at(0)
    return
  }
  const index = props.values.indexOf(modelValue.value)
  if (index === -1) {
    modelValue.value = props.values.at(0)
    return
  }

  const newIndex = direction === 'left' ? index - 1 : index + 1
  const newValue = props.values.at(newIndex % props.values.length)
  if (newValue !== undefined) modelValue.value = newValue
}
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
        <div class="relative h-2.8cqh flex flex-grow items-center justify-center">
          <slot :value="modelValue"></slot>
        </div>
        <button class="i-sing-arrow-right block h-2.8cqh" @click="onClick('right')" />
      </div>
    </div>
  </button>
</template>
