<script setup lang="ts">
import RangeInput from '@renderer/components/menu/RangeInput.vue'
import ListInput from '@renderer/components/menu/ListInput.vue'
import WideButton from '@renderer/components/menu/WideButton.vue'
import type { MenuNavigationEvent } from '@renderer/composables/useMenuNavigation'
import type { Microphone } from '@renderer/stores/settings'

const router = useRouter()
const route = useRoute()
const settingsStore = useSettingsStore()

const back = () => {
  router.back()
}

const id = computed(() => {
  return parseInt(route.params.id as string)
})

const deleteMicrophone = () => {
  if (id.value === undefined) return
  settingsStore.deleteMicrophone(id.value)
  back()
}

const saveMicrophone = () => {
  if (id.value === undefined) return

  // find id of microphone by label from mediaDevices
  const microphone = mediaDevices.value.find(device => device.label === label.value)

  if (!microphone) return

  const mic: Microphone = {
    delay: delay.value,
    gain: gain.value,
    color: color.value,
    channel: channel.value,
    label: label.value,
    id: microphone?.deviceId,
  }

  settingsStore.saveMicrophone(id.value, mic)
  back()
}

const label = ref('')
const color = ref('#00B5FF')
const channel = ref(1)
const delay = ref(250)
const gain = ref(1)

const loading = ref(true)

watch(id, (newId) => {
  const microphone = settingsStore.microphones.at(newId)

  if (!microphone) return
  delay.value = microphone.delay
  gain.value = microphone.gain
  color.value = microphone.color
  channel.value = microphone.channel
  label.value = microphone.label
}, { immediate: true })

const mediaDevices = ref<MediaDeviceInfo[]>([])

const micOptions = computed(() => {
  const options = mediaDevices.value.map(device => device.label)
  return options
})

const buttons = [
  { type: 'list', label: 'Microphone', value: label, options: micOptions, displayType: 'text' },
  { type: 'list', label: 'Color', value: color, options: ref(['#00B5FF', '#FF2E0E']), displayType: 'color' },
  { type: 'list', label: 'Channel', value: channel, options: ref([1, 2, 3]), displayType: 'text' },
  { type: 'range', label: 'Delay', value: delay, min: 0, max: 600, step: 1, clickStep: 10 },
  { type: 'range', label: 'Gain', value: gain, min: 0.5, max: 2, step: 0.1, clickStep: 0.1 },
  { type: 'button', label: 'Delete', action: deleteMicrophone },
  { type: 'button', label: 'Save', action: saveMicrophone },
] as const

const { position, increment, decrement } = useLoop(buttons.length - 1)

useMenuNavigation(useRepeatThrottleFn(e => onNavigate(e), 150))
const onNavigate = (event: MenuNavigationEvent) => {
  if (event.action === 'confirm') {
    const button = buttons.at(position.value)
    if (button?.type === 'button') button.action()
  } else if (event.action === 'back') {
    back()
  } else if (event.action === 'up') {
    decrement()
    scrollIntoView(position.value)
  } else if (event.action === 'down') {
    increment()
    scrollIntoView(position.value)
  } else if (event.action === 'right') {
    const next = buttonRefs.value.at(position.value)?.next
    if (next) next()
  } else if (event.action === 'left') {
    const prev = buttonRefs.value.at(position.value)?.prev
    if (prev) prev()
  }
}

const scrollIntoView = (index: number) => {
  const el = buttonRefs.value[index]
  if (!el) return
  setTimeout(() => {
    unrefElement<HTMLDivElement>(el)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, 5)
}

onMounted(async () => {
  const devices = await navigator.mediaDevices.enumerateDevices()
  mediaDevices.value = devices.filter(device => device.kind === 'audioinput')
  loading.value = false

  if (label.value === '') {
    label.value = micOptions.value[0] ?? ''
  }
})

const gradient = { start: '#36D1DC', end: '#5B86E5' }

const buttonRefs = ref<any[]>([])
const setRefs = (ref: any, index) => {
  buttonRefs.value[index] = ref
}
</script>

<template>
  <Layout class="gradient-bg-secondary" @back="back">
    <template #header>
      <TitleBar title="Settings" :description="label" @back="back" />
    </template>

    <div class="flex items-center">
      <div class="max-h-full w-full">
        <template v-for="button, index in buttons">
          <RangeInput
            v-if="button.type === 'range'"
            :key="`range${button.label}`"
            :ref="(el) => setRefs(el, index)"
            v-model="button.value.value"
            :active="index === position"
            :label="button.label"
            :gradient="gradient"
            :min="button.min"
            :max="button.max"
            :step="button.step"
            :click-step="button.clickStep"
            class="w-full"
            @mouseenter="position = index"
          />
          <ListInput
            v-else-if="button.type === 'list'"
            :key="`list${button.label}`"
            :ref="(el) => setRefs(el, index)"
            v-model="button.value.value"
            :active="index === position"
            :label="button.label"
            :gradient="gradient"
            :options="button.options.value"
            :display-type="button.displayType"
            class="w-full"
            @mouseenter="position = index"
          />
          <WideButton
            v-else-if="button.type === 'button'"
            :key="`button${button.label}`"
            :ref="(el) => setRefs(el, index)"
            :label="button.label"
            :gradient="gradient"
            :active="index === position"
            class="w-full"
            @click="button.action"
            @mouseenter="position = index"
          />
        </template>
      </div>
    </div>
    <template #footer>
      <KeyHints :hints="['back', 'confirm']" />
    </template>
  </Layout>
</template>
