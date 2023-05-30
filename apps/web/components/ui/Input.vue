<script setup lang="ts">
const props = defineProps<{
  type?: 'text' | 'password'
  autocomplete?: string
}>()

const { modelValue } = defineModels<{
  modelValue?: string
}>()
</script>

<template>
  <input
    v-model="modelValue"
    :autocomplete="props.autocomplete"
    :type="props.type"
    class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  />
</template>

<style scoped></style>
