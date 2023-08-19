<script setup lang="ts">
import { clamp } from '~/lib/utils/math'

const router = useRouter()
const { t } = useI18n()
const settingsStore = useSettingsStore()
const select = useSoundEffect('select')
const confirm = useSoundEffect('confirm')

const back = () => {
  router.push({ name: '/settings/' })
}

const sliders = [
  {
    label: t('settings.volume.master'),
    ref: computed({
      get() {
        return settingsStore.volume.master
      },
      set(newValue: number) {
        settingsStore.volume.master = clamp(newValue, 0, 100)
      },
    }),
  },
  {
    label: t('settings.volume.game'),
    ref: computed({
      get() {
        return settingsStore.volume.game
      },
      set(newValue: number) {
        settingsStore.volume.game = clamp(newValue, 0, 100)
      },
    }),
  },
  {
    label: t('settings.volume.preview'),
    ref: computed({
      get() {
        return settingsStore.volume.preview
      },
      set(newValue: number) {
        settingsStore.volume.preview = clamp(newValue, 0, 100)
      },
    }),
  },
  {
    label: t('settings.volume.menu'),
    ref: computed({
      get() {
        return settingsStore.volume.menu
      },
      set(newValue: number) {
        settingsStore.volume.menu = clamp(newValue, 0, 100)
      },
    }),
  },
]

const { position, increment, decrement } = useLoop(sliders.length - 1)

useMenuNavigation((e) => {
  if (e.action === 'down') {
    increment()
  } else if (e.action === 'up') {
    decrement()
  } else if (e.action === 'back') {
    back()
  } else if (e.action === 'left') {
    const slider = sliders.at(position.value)
    if (slider) {
      slider.ref.value -= 5
    }
  } else if (e.action === 'right') {
    const slider = sliders.at(position.value)
    if (slider) {
      slider.ref.value += 5
    }
  }
})

watch(position, () => select.play())

onBeforeUnmount(() => {
  confirm.play()
})
</script>

<template>
  <Layout class="gradient-bg-secondary" @back="back">
    <template #header>
      <TitleBar :title="t('settings.title')" :description="t('settings.volume.title')" @back="back" />
    </template>
    <div class="flex flex-col gap-0.5cqh">
      <WideSlider
        v-for="(slider, i) in sliders"
        :key="slider.label"
        v-model="slider.ref.value"
        :label="slider.label"
        class="from-settings-start to-settings-end"
        :active="position === i"
        :click-step="5"
        @mouseenter="() => (position = i)"
      ></WideSlider>
    </div>
    <template #footer>
      <KeyHints :hints="['back', 'navigate', 'confirm']" />
    </template>
  </Layout>
</template>

<style scoped></style>
