<script setup lang="ts">
const props = defineProps<{
  src?: string
  alt?: string
  username?: string
}>()

const error = ref(false)

const onError = () => {
  error.value = true
}

watch(() => props.src, (src) => {
  // set error to true if no src is provided or if src is empty
  error.value = !src || src === ''
}, { immediate: true })

const initials = computed(() => {
  if (props.username) {
    return props.username[0].toUpperCase()
  }
  return '?'
})
</script>

<template>
  <img v-if="!error" class="h-8 w-8 rounded-full" :src="props.src" @error="onError">
  <div v-else class="inline-block h-8 w-8 bg-blue-500 rounded-full text-white flex items-center justify-center text-md overflow-hidden">
    {{ initials }}
  </div>
</template>
