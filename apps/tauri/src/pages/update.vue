<script setup lang="ts">
import { open } from '@tauri-apps/api/shell'
import { MenuNavigationEvent } from '~/composables/useMenuNavigation'

const update = () => {
  open(import.meta.env.VITE_UPDATE_URL as string)
}

useMenuNavigation(useRepeatThrottleFn((e) => onNavigate(e), 150))
const onNavigate = (event: MenuNavigationEvent) => {
  if (event.action === 'confirm') {
    update()
  }
}
</script>

<template>
  <Layout class="gradient-bg-secondary">
    <template #header>
      <TitleBar title="Update" :back-arrow="false" />
    </template>
    <div>
      <WideButton label="Update" :gradient="{ start: '#36D1DC', end: '#5B86E5' }" :active="true" @click="update" />
    </div>
    <template #footer>
      <KeyHints :hints="['confirm']" />
    </template>
  </Layout>
</template>
