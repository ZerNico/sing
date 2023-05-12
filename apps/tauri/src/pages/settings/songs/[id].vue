<script setup lang="ts">
import type { MenuNavigationEvent } from '~/composables/useMenuNavigation'

const router = useRouter()
const songsStore = useSongsStore()
const route = useRoute('/settings/songs/[id]')

const back = () => {
  router.push({ name: '/settings/songs/' })
}

const id = computed(() => {
  return parseInt(route.params.id)
})

const path = computed(() => {
  if (id.value === undefined) return
  return songsStore.paths[id.value]
})

useMenuNavigation(useRepeatThrottleFn((e) => onNavigate(e), 150))
const onNavigate = (event: MenuNavigationEvent) => {
  if (event.action === 'confirm') {
    deleteSong()
  } else if (event.action === 'back') {
    back()
  }
}

const deleteSong = async () => {
  if (id.value === undefined) return
  songsStore.removePath(songsStore.paths[id.value])
  back()
}

const confirm = useSoundEffect('confirm')

onBeforeUnmount(() => {
  confirm.play()
})
</script>

<template>
  <Layout class="gradient-bg-secondary" @back="back">
    <template #header>
      <TitleBar title="Settings" :description="path" @back="back" />
    </template>
    <div>
      <WideButton label="Delete" :gradient="{ start: '#36D1DC', end: '#5B86E5' }" :active="true" @click="deleteSong" />
    </div>
    <template #footer>
      <KeyHints :hints="['back', 'confirm']" />
    </template>
  </Layout>
</template>
