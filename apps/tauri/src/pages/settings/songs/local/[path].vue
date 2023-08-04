<script setup lang="ts">
const router = useRouter()
const confirm = useSoundEffect('confirm')
const route = useRoute('/settings/songs/local/[path]')
const songsStore = useSongsStore()
const { t } = useI18n()

const back = () => {
  router.push({ name: '/settings/songs/' })
}

const deletePath = () => {
  songsStore.removeLocalPath(route.params.path)
  back()
}

useMenuNavigation((e) => {
  if (e.action === 'confirm') {
    deletePath()
  } else if (e.action === 'back') {
    back()
  }
})

onBeforeUnmount(() => {
  confirm.play()
})
</script>

<template>
  <Layout class="gradient-bg-secondary" @back="back">
    <template #header>
      <TitleBar title="Settings" :description="`${t('settings.songs.title')} / ${route.params.path}`" @back="back" />
    </template>
    <div class="flex flex-col gap-0.5cqh">
      <WideButton class="from-settings-start to-settings-end" :active="true" @click="deletePath">
        {{ t('settings.songs.remove') }}
      </WideButton>
    </div>
    <template #footer>
      <KeyHints :hints="['back', 'navigate', 'confirm']" />
    </template>
  </Layout>
</template>
