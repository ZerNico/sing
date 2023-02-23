<script setup lang="ts">
import type { MenuNavigationEvent } from '@renderer/composables/useMenuNavigation'

const router = useRouter()

const back = () => {
  router.back()
}

const buttons = [
  { label: 'Volume', action: () => router.push('/settings/volume') },
  { label: 'Microphones', action: () => router.push('/settings/microphones') },
  { label: 'Songs', action: () => router.push('/settings/songs') },
]

const { position, increment, decrement } = useLoop(buttons.length - 1)

useMenuNavigation(useRepeatThrottleFn(e => onNavigate(e), 150))
const onNavigate = (event: MenuNavigationEvent) => {
  if (event.action === 'back') {
    router.back()
  } else if (event.action === 'confirm') {
    buttons.at(position.value)?.action()
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
      <TitleBar title="Settings" @back="back" />
    </template>
    <div>
      <WideButton
        v-for="(button, i) in buttons"
        :key="button.label"
        :label="button.label"
        :gradient="{ start: '#36D1DC', end: '#5B86E5' }"
        :active="position === i"
        @mouseenter="() => (position = i)"
        @click="button.action"
      />
    </div>
    <template #footer>
      <KeyHints :hints="['back', 'navigate', 'confirm']" />
    </template>
  </Layout>
</template>
