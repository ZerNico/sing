<script setup lang="ts">
import { Notification } from '~/lib/types'

const props = defineProps<{
  notification: Notification
}>()

const emit = defineEmits(['remove'])

const notificationEl = ref<HTMLDivElement | null>(null)

const height = ref<number>()
const opacity = ref<number>(100)

const fadeOut = async () => {
  opacity.value = 0

  setTimeout(() => {
    animateOut()
  }, 600)
}

const animateOut = async () => {
  height.value = notificationEl.value?.offsetHeight
  setTimeout(() => {
    height.value = 0
  }, 10)
  setTimeout(() => {
    emit('remove')
  }, 1000)
}

const { pause, resume } = usePausableTimeoutFn(() => {
  fadeOut()
}, 4000)

const dragOpacity = ref<number>(100)
const dragX = ref<number>(0)
const initialX = ref<number>(0)

const drag = (e: MouseEvent) => {
  // ignore last drag event to prevent jumping
  if (e.screenX === 0) {
    if (dragOpacity.value <= 0) {
      animateOut()
    } else {
      dragOpacity.value = 100
      dragX.value = 0
    }
    return
  }

  const diff = e.clientX - initialX.value
  dragX.value = diff
  if (Math.abs(diff) > 100) {
    dragOpacity.value = 100 - (Math.abs(diff) - 100) * 2
  }
}

const onDragStart = (e: DragEvent) => {
  initialX.value = e.clientX
}

const icon = computed(() => {
  if (props.notification.type === 'error') {
    return 'i-carbon-error'
  } else if (props.notification.type === 'success') {
    return 'i-carbon-checkmark'
  } else if (props.notification.type === 'warning') {
    return 'i-carbon-warning'
  } else {
    return 'i-carbon-information'
  }
})
</script>

<template>
  <div ref="notificationEl" class="w-full max-w-100 notification" @mouseenter="pause" @mouseleave="resume">
    <div class="max-w-100 w-full h-full overflow-hidden relative dragged-notification">
      <div
        class="border bg-background rounded-md p-6 w-full mb-2 flex gap-2"
        :class="{ 'border-destructive text-destructive': notification.type === 'error' }"
      >
        <div class="text-xl" :class="icon"></div>
        <div class="flex flex-col gap-1">
          <p class="text-sm font-semibold">{{ props.notification.title }}</p>
          <p class="text-sm opacity-90">{{ props.notification.message }}</p>
        </div>
      </div>
      <div
        class="notification-dragger pointer-events-auto absolute w-full inset-0 h-full opacity-0"
        draggable="true"
        @dragstart="onDragStart"
        @drag="drag"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.notification {
  height: v-bind(height + 'px');
  opacity: v-bind(opacity / 100);
  transition: height 0.5s ease-in-out, opacity 0.5s ease-in-out;
}

.dragged-notification {
  opacity: v-bind(dragOpacity / 100);
  transform: translateX(v-bind(dragX + 'px'));
}
</style>
