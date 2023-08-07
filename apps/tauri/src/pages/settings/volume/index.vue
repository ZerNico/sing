<script setup lang="ts">
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
    value: settingsStore.volume.master,
    setter: (value: number) => (settingsStore.volume.master = value),
  },
  {
    label: t('settings.volume.game'),
    value: settingsStore.volume.game,
    setter: (value: number) => (settingsStore.volume.game = value),
  },
  {
    label: t('settings.volume.preview'),
    value: settingsStore.volume.preview,
    setter: (value: number) => (settingsStore.volume.preview = value),
  },
  {
    label: t('settings.volume.menu'),
    value: settingsStore.volume.menu,
    setter: (value: number) => (settingsStore.volume.menu = value),
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
        :model-value="slider.value"
        :label="slider.label"
        class="from-settings-start to-settings-end"
        :active="position === i"
        @mouseenter="() => (position = i)"
        @update:model-value="slider.setter"
      ></WideSlider>
    </div>
    <template #footer>
      <KeyHints :hints="['back', 'navigate', 'confirm']" />
    </template>
  </Layout>
</template>

<style scoped></style>
