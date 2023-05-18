<script setup lang="ts">
const props = defineProps<{
  src?: string | null
  fallback?: string
}>()

const imgUrl = ref<string | undefined>()

watch(
  () => props.src,
  (src) => {
    imgUrl.value = src || undefined
  }
)

onMounted(() => {
  if (props.src) {
    imgUrl.value = props.src
  }
})

const imageEl = ref<HTMLImageElement | null>(null)

const onError = () => {
  imgUrl.value = undefined
}
</script>

<template>
  <div class="w-10 h-10 relative flex overflow-hidden rounded-full">
    <div class="absolute w-full h-full flex items-center justify-center bg-muted">
      <p>{{ props.fallback }}</p>
    </div>
    <img
      v-if="!!imgUrl"
      ref="imageEl"
      class="relative w-full h-full object-cover rounded-full"
      :src="props.src || undefined"
      alt=""
      @error="onError"
    />
  </div>
</template>
