<script setup lang="ts">
import type { MenuNavigationEvent } from '@renderer/composables/useMenuNavigation'

const router = useRouter()

const back = () => {
  router.push('/home')
}

const toVersus = () => {
  router.push('/party/versus/settings')
}

useMenuNavigation(useRepeatThrottleFn(e => onNavigate(e), 150))
const onNavigate = (event: MenuNavigationEvent) => {
  if (event.action === 'back') {
    router.back()
  } else if (event.action === 'confirm') {
    toVersus()
  }
}

const confirm = useSoundEffect('confirm')

onBeforeUnmount(() => {
  confirm.play()
})
</script>

<template>
  <Layout class="gradient-bg-secondary" @back="back">
    <template #header>
      <TitleBar title="Party" @back="back" />
    </template>
    <div>
      <WideButton
        label="Versus"
        :gradient="{ start: '#36D1DC', end: '#5B86E5' }"
        :active="true"
        @click="toVersus"
      />
    </div>
    <template #footer>
      <KeyHints :hints="['back', 'confirm']" />
    </template>
  </Layout>
</template>
