<script setup lang="ts">
import { keyMode } from '~/logic/ui/keys'

const emit = defineEmits<{
  (e: 'focusin'): void
  (e: 'focusout'): void
}>()

const { modelValue } = defineModel<{
  modelValue: string
}>()

const inputEl = ref<HTMLInputElement>()

const isFocused = ref(false)

const showPlaceholder = computed(() => {
  return !isFocused.value && modelValue.value === ''
})

const onFocusIn = () => {
  isFocused.value = true
  emit('focusin')
}

const onFocusOut = () => {
  isFocused.value = false
  emit('focusout')
}

const focus = () => {
  if (inputEl.value) {
    inputEl.value.focus()
  }
}
const blur = () => {
  if (inputEl.value) {
    inputEl.value.blur()
  }
}

const getInputEl = () => inputEl.value

defineExpose({ focus, blur, getInputEl })
</script>

<template>
  <div class="rounded-full border-black border-0.2cqw px-0.6cqw py-0.2cqw flex items-center text-black">
    <Icon icon="Search" class="text-1cqw mr-0.3cqw" />
    <div class="relative flex items-center flex-grow">
      <input
        ref="inputEl"
        v-model="modelValue"
        class="focus:outline-none outline-none bg-white/0 w-full min-w-0 text-0.9cqw leading-tight flex-grow"
        name="search"
        @focusin="onFocusIn"
        @focusout="onFocusOut"
      />
      <div
        class="absolute inset-0 flex items-center pointer-events-none justify-between"
        :class="{ 'opacity-0': !showPlaceholder }"
      >
        <div class="text-0.9cqw">Search</div>
        <Icon :icon="keyMode === 'keyboard' ? 'KeyF3' : 'XboxMenu'" class="text-1cqw ml-0.3cqw" />
      </div>
    </div>
  </div>
</template>
