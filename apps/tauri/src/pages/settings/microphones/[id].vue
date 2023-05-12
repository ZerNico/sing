<script setup lang="ts">
import { invoke } from '@tauri-apps/api/tauri'
import RangeInput from '~/components/menu/RangeInput.vue'
import ListInput from '~/components/menu/ListInput.vue'
import WideButton from '~/components/menu/WideButton.vue'
import type { MenuNavigationEvent } from '~/composables/useMenuNavigation'
import type { Microphone } from '~/stores/settings'

const router = useRouter()
const route = useRoute('/settings/microphones/[id]')
const settingsStore = useSettingsStore()

const back = () => {
  router.push({ name: '/settings/microphones/' })
}

const id = computed(() => {
  return parseInt(route.params.id)
})

const deleteMicrophone = () => {
  if (id.value === undefined) return
  settingsStore.deleteMicrophone(id.value)
  back()
}

const saveMicrophone = () => {
  if (id.value === undefined) return

  const mic: Microphone = {
    delay: delay.value,
    gain: gain.value,
    color: color.value,
    channel: channel.value,
    name: name.value,
    threshold: threshold.value,
  }

  settingsStore.saveMicrophone(id.value, mic)
  back()
}

const name = ref('')
const color = ref('#00B5FF')
const channel = ref(1)
const delay = ref(250)
const gain = ref(1)
const threshold = ref(2)

const loading = ref(true)

watch(
  id,
  (newId) => {
    const microphone = settingsStore.microphones.at(newId)

    if (!microphone) return
    delay.value = microphone.delay
    gain.value = microphone.gain
    color.value = microphone.color
    channel.value = microphone.channel
    name.value = microphone.name
    threshold.value = microphone.threshold
  },
  { immediate: true }
)

interface Device {
  name: string
  channels: number
}

const mediaDevices = ref<Device[]>([])

const micOptions = computed(() => {
  const options = mediaDevices.value.map((device) => device.name)
  return options
})

const buttons = [
  { type: 'list', label: 'Microphone', value: name, options: micOptions, displayType: 'text' },
  { type: 'list', label: 'Color', value: color, options: ref(['#00B5FF', '#FF2E0E']), displayType: 'color' },
  { type: 'list', label: 'Channel', value: channel, options: ref([1, 2, 3]), displayType: 'text' },
  { type: 'range', label: 'Delay', value: delay, min: 0, max: 600, step: 1, clickStep: 10 },
  { type: 'range', label: 'Gain', value: gain, min: 0.5, max: 2, step: 0.1, clickStep: 0.1 },
  { type: 'range', label: 'Threshold', value: threshold, min: 0, max: 5, step: 0.1, clickStep: 0.1 },
  { type: 'button', label: 'Delete', action: deleteMicrophone },
  { type: 'button', label: 'Save', action: saveMicrophone },
] as const

const { position, increment, decrement } = useLoop(buttons.length - 1)

useMenuNavigation(useRepeatThrottleFn((e) => onNavigate(e), 150))
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
  loading.value = true
  const res = await invoke<Device[]>('get_devices')
  mediaDevices.value = res
  loading.value = false

  if (name.value === '') {
    name.value = micOptions.value[0] ?? ''
  }
})

const gradient = { start: '#36D1DC', end: '#5B86E5' }

const buttonRefs = ref<any[]>([])
const setRefs = (ref: any, index: any) => {
  buttonRefs.value[index] = ref
}

const select = useSoundEffect('select')
watch(position, () => select.play())

const confirm = useSoundEffect('confirm')

onBeforeUnmount(() => {
  confirm.play()
})
</script>

<template>
  <Layout class="gradient-bg-secondary" @back="back">
    <template #header>
      <TitleBar title="Settings" :description="name" @back="back" />
    </template>

    <div>
      <template v-for="(button, index) in buttons">
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
    <template #footer>
      <KeyHints :hints="['back', 'confirm']" />
    </template>
  </Layout>
</template>
