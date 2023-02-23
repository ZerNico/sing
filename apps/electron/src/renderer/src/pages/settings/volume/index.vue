<script setup lang="ts">
import type { MenuNavigationEvent } from '@renderer/composables/useMenuNavigation'
import { clamp } from '@renderer/logic/utils/math.utils'

const router = useRouter()
const settingsStore = useSettingsStore()

const back = () => {
  router.back()
}

const sliders = [
  {
    label: 'Master Volume',
    value: computed(() => settingsStore.volume.master),
    setter: (value: number) => (settingsStore.volume.master = value),
  },
  {
    label: 'Game Volume',
    value: computed(() => settingsStore.volume.game),
    setter: (value: number) => (settingsStore.volume.game = value),
  },

  {
    label: 'Preview Volume',
    value: computed(() => settingsStore.volume.preview),
    setter: (value: number) => (settingsStore.volume.preview = value),
  },
  {
    label: 'Menu Volume',
    value: computed(() => settingsStore.volume.menu),
    setter: (value: number) => (settingsStore.volume.menu = value),
  },
]

const { position, increment, decrement } = useLoop(sliders.length - 1)

useMenuNavigation(useRepeatThrottleFn(e => onNavigate(e), 150))
const onNavigate = (event: MenuNavigationEvent) => {
  if (event.action === 'back') {
    router.back()
  } else if (event.action === 'left' || event.action === 'right') {
    const button = sliders.at(position.value)
    if (button) {
      const newValue = button.value.value + (event.action === 'left' ? -5 : 5)
      button.setter(clamp(newValue, 0, 100))
    }
  } else if (event.action === 'down') {
    increment()
  } else if (event.action === 'up') {
    decrement()
  }
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
      <TitleBar title="Settings" description="Volume" @back="back" />
    </template>
    <div>
      <RangeInput
        v-for="(slider, i) in sliders"
        :key="slider.label"
        :model-value="slider.value.value"
        :label="slider.label"
        :gradient="{ start: '#36D1DC', end: '#5B86E5' }"
        :active="position === i"
        :click-step="5"
        @mouseenter="() => (position = i)"
        @update:model-value="slider.setter"
      />
    </div>
    <template #footer>
      <KeyHints :hints="['back', 'navigate']" />
    </template>
  </Layout>
</template>
