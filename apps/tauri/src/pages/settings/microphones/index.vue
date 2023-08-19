<script setup lang="ts">
const router = useRouter()
const settingsStore = useSettingsStore()
const select = useSoundEffect('select')
const confirm = useSoundEffect('confirm')
const { t } = useI18n()

const back = () => {
  router.push({ name: '/settings/' })
}

const MAX_MICROPHONES = 2

const maxPosition = computed(() => {
  const length = settingsStore.microphones.length
  if (length >= MAX_MICROPHONES) {
    return length - 1
  }
  return length
})

const { position, increment, decrement } = useLoop(maxPosition)

useMenuNavigation((e) => {
  if (e.action === 'confirm') {
    toMic(position.value)
  } else if (e.action === 'down') {
    increment()
  } else if (e.action === 'up') {
    decrement()
  } else if (e.action === 'back') {
    back()
  }
})

const toMic = (index: number) => {
  router.push({ name: '/settings/microphones/[id]', params: { id: index } })
}

watch(position, () => select.play())

onBeforeUnmount(() => {
  confirm.play()
})
</script>

<template>
  <Layout class="gradient-bg-secondary" @back="back">
    <template #header>
      <TitleBar :title="t('settings.title')" :description="t('settings.microphones.title')" @back="back" />
    </template>
    <div class="flex items-center justify-center gap-1cqw">
      <IconButton
        v-for="(microphone, index) in settingsStore.microphones"
        :key="index"
        :active="index === position"
        :label="microphone.name"
        icon="i-sing-folder"
        :loading="false"
        class="w-1/11 from-settings-start to-settings-end"
        @mouseenter="() => (position = index)"
        @click="toMic(index)"
      />
      <IconButton
        v-if="settingsStore.microphones.length < MAX_MICROPHONES"
        :active="position === maxPosition"
        :label="t('settings.songs.add')"
        icon="i-sing-add"
        class="w-1/11 from-settings-start to-settings-end"
        @mouseenter="() => (position = maxPosition)"
        @click="toMic(maxPosition)"
      />
    </div>
    <template #footer>
      <KeyHints :hints="['back', 'navigate', 'confirm']" />
    </template>
  </Layout>
</template>

<style scoped></style>
