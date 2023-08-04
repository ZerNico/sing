<script setup lang="ts">
import { open } from '@tauri-apps/api/dialog'

const router = useRouter()
const songsStore = useSongsStore()
const select = useSoundEffect('select')
const confirm = useSoundEffect('confirm')
const { t } = useI18n()

const back = () => {
  if (loading.value) return
  router.push({ name: '/settings/' })
}

const maxPosition = computed(() => {
  const length = songsStore.localPaths.length
  if (length >= 5) {
    return length - 1
  }
  return length
})

const { position, increment, decrement } = useLoop(maxPosition)

useMenuNavigation((e) => {
  if (e.action === 'confirm') {
    if (position.value === maxPosition.value) {
      pickFolder()
    } else {
      const path = songsStore.localPaths.at(position.value)
      if (path) toPath(path)
    }
  } else if (e.action === 'down') {
    increment()
  } else if (e.action === 'up') {
    decrement()
  } else if (e.action === 'back') {
    back()
  }
})

const loading = ref(false)

const pickFolder = async () => {
  if (loading.value) return
  loading.value = true

  const path = await open({ directory: true, recursive: true })

  if (path && !Array.isArray(path)) {
    songsStore.addLocalPath(path)
  }
  loading.value = false
}

const toPath = (path: string) => {
  if (loading.value) return
  router.push({ name: '/settings/songs/local/[path]', params: { path } })
}

const folderName = (path: string) => {
  const unixPath = path.replaceAll('\\', '/')
  const name = unixPath.split('/').pop()
  return name || 'Error'
}

watch(position, () => select.play())

onBeforeUnmount(() => {
  confirm.play()
})
</script>

<template>
  <Layout class="gradient-bg-secondary" @back="back">
    <template #header>
      <TitleBar :title="t('settings.title')" :description="t('settings.songs.title')" @back="back" />
    </template>
    <div class="flex items-center justify-center gap-1cqw">
      <IconButton
        v-for="(path, index) in songsStore.localPaths"
        :key="path"
        :active="index === position"
        :label="folderName(path)"
        icon="i-sing-folder"
        :loading="false"
        class="w-1/11 from-settings-start to-settings-end"
        @mouseenter="() => (position = index)"
        @click="toPath(path)"
      />
      <IconButton
        v-if="songsStore.localPaths.length < 5"
        :active="position === maxPosition"
        :label="t('settings.songs.add')"
        icon="i-sing-add"
        :loading="loading"
        class="w-1/11 from-settings-start to-settings-end"
        @mouseenter="() => (position = maxPosition)"
        @click="pickFolder"
      />
    </div>
    <template #footer>
      <KeyHints :hints="['back', 'navigate', 'confirm']" />
    </template>
  </Layout>
</template>

<style scoped></style>
