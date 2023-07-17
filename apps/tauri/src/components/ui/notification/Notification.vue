<script setup lang="ts">
import { Notification } from '~/composables/useNotification'

const props = defineProps<{
  notification: Notification
}>()

const emit = defineEmits<{
  (e: 'remove'): void
}>()

const faded = ref(true)
const height = ref('auto')
const notificationEl = ref<HTMLDivElement>()

const animateOut = () => {
  faded.value = true
  height.value = `${notificationEl.value?.offsetHeight}px`

  setTimeout(() => {
    height.value = '0px'
  }, 500)
  setTimeout(() => {
    emit('remove')
  }, 1000)
}

const { pause, resume } = usePausableTimeoutFn(() => {
  animateOut()
}, 4000)

const classMap = new Map<Notification['type'], { icon: string; bg: string }>([
  ['info', { icon: 'i-sing-info', bg: 'bg-info' }],
  ['success', { icon: 'i-sing-success', bg: 'bg-success' }],
  ['error', { icon: 'i-sing-error', bg: 'bg-error' }],
  ['warning', { icon: 'i-sing-warning', bg: 'bg-warning' }],
])

const classes = computed(() => {
  return classMap.get(props.notification.type) ?? classMap.get('info')
})

onMounted(() => {
  setTimeout(() => {
    faded.value = false
  }, 10)
})
</script>

<template>
  <div ref="notificationEl" class="notification overflow-hidden transition-height duration-500">
    <div
      class="pointer-events-auto mb-2cqh w-25cqw flex gap-0.5cqw rounded-md p-1cqw transition-opacity duration-500"
      :class="[{ 'opacity-0': faded }, classes?.bg]"
      @click="animateOut"
      @mouseenter="pause"
      @mouseleave="resume"
    >
      <div class="flex-shrink-0"><div :class="classes?.icon" class="text-1.8cqw"></div></div>
      <div>
        <h1 class="text-1.2cqw font-semibold">{{ props.notification.title }}</h1>
        <p class="text-1.2cqw">{{ props.notification.message }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification {
  height: v-bind(height);
}
</style>
