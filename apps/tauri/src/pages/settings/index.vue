<script setup lang="ts">
const router = useRouter()
const select = useSoundEffect('select')
const confirm = useSoundEffect('confirm')

const back = () => {
  router.push({ name: '/home' })
}

const buttons = [
  { label: 'Volume', action: () => router.push({ name: '/settings/volume/' }) },
  { label: 'Microphones', action: () => router.push({ name: '/settings/microphones/' }) },
  { label: 'Songs', action: () => router.push({ name: '/settings/songs/' }) },
  { label: 'Credits', action: () => router.push({ name: '/settings/credits/' }) },
]

const { position, increment, decrement } = useLoop(buttons.length - 1)

useMenuNavigation((e) => {
  if (e.action === 'confirm') {
    buttons.at(position.value)?.action()
  } else if (e.action === 'down') {
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
      <TitleBar title="Settings" @back="back" />
    </template>
    <div class="flex flex-col gap-0.5cqh">
      <WideButton
        v-for="(button, i) in buttons"
        :key="button.label"
        class="from-settings-start to-settings-end"
        :gradient="{ start: '#36D1DC', end: '#5B86E5' }"
        :active="position === i"
        @mouseenter="() => (position = i)"
        @click="button.action"
        >{{ button.label }}</WideButton
      >
    </div>
    <template #footer>
      <KeyHints :hints="['back', 'navigate', 'confirm']" />
    </template>
  </Layout>
</template>
