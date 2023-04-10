<script setup lang="ts">
import type { MenuNavigationEvent } from '~/composables/useMenuNavigation'

const router = useRouter()
const settingsStore = useSettingsStore()

const back = () => {
  router.push({ name: '/settings/' })
}

const maxPosition = computed(() => {
  const length = settingsStore.microphones.length
  if (length >= 2) {
    return length - 1
  }
  return length
})

const { position, increment, decrement } = useLoop(maxPosition)

useMenuNavigation(useRepeatThrottleFn(e => onNavigate(e), 150))

const onNavigate = (event: MenuNavigationEvent) => {
  if (event.action === 'back') {
    back()
  } else if (event.action === 'confirm') {
    toPath(position.value)
  } else if (event.action === 'left') {
    decrement()
  } else if (event.action === 'right') {
    increment()
  }
}

const toPath = (index: number) => {
  router.push({ name: '/settings/microphones/[id]', params: { id: index } })
}

const gradient = { start: '#36D1DC', end: '#5B86E5' }

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
      <TitleBar title="Settings" description="Microphones" @back="back" />
    </template>
    <div class="flex flex justify-center items-center gap-1cqw">
      <IconButton
        v-for="microphone, index in settingsStore.microphones"
        :key="microphone.name + microphone.channel"
        :active="index === position"
        :label="microphone.name"
        icon="Folder"
        :gradient="gradient"
        class="w-1/11"
        @mouseenter="() => (position = index)"
        @click="toPath(index)"
      />
      <IconButton
        v-if="settingsStore.microphones.length < 2"
        :active="position === maxPosition"
        label="Add"
        icon="Plus"
        :gradient="gradient"
        class="w-1/11"
        @mouseenter="() => (position = maxPosition)"
        @click="toPath(maxPosition)"
      />
    </div>
    <template #footer>
      <KeyHints :hints="['back', 'navigate', 'confirm']" />
    </template>
  </Layout>
</template>
