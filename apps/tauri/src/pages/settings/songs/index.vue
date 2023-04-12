<script setup lang="ts">
import { open } from '@tauri-apps/api/dialog'
import type { MenuNavigationEvent } from '~/composables/useMenuNavigation'

const router = useRouter()
const songsStore = useSongsStore()

const back = () => {
  if (loading.value) return
  router.push({ name: '/settings/' })
}

const maxPosition = computed(() => {
  const length = songsStore.paths.length
  if (length >= 5) {
    return length - 1
  }
  return songsStore.paths.length
})

const { position, increment, decrement } = useLoop(maxPosition)

useMenuNavigation(useRepeatThrottleFn(e => onNavigate(e), 150))

const onNavigate = (event: MenuNavigationEvent) => {
  if (event.action === 'back') {
    back()
  } else if (event.action === 'confirm') {
    if (position.value === maxPosition.value) {
      pickFolder()
    } else {
      toPath(position.value)
    }
  } else if (event.action === 'left') {
    decrement()
  } else if (event.action === 'right') {
    increment()
  }
}

const loading = ref(false)

const pickFolder = async () => {
  if (loading.value) return
  loading.value = true

  const path = await open({ directory: true, recursive: true })

  if (path && !Array.isArray(path)) {
    songsStore.addPath(path)
  }
  loading.value = false
}

const toPath = (index: number) => {
  if (loading.value) return
  router.push({ name: '/settings/songs/[id]', params: { id: index } })
}

const folderName = (path: string) => {
  const unixPath = path.replace(/\\/g, '/')
  const name = unixPath.split('/').pop()
  return name || 'Error'
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
      <TitleBar title="Settings" description="Songs" @back="back" />
    </template>
    <div class="flex flex justify-center items-center gap-1cqw">
      <IconButton
        v-for="path, index in songsStore.paths"
        :key="path"
        :active="index === position"
        :label="folderName(path)"
        icon="Folder"
        :gradient="gradient"
        :loading="false"
        class="w-1/11"
        @mouseenter="() => (position = index)"
        @click="toPath(index)"
      />
      <IconButton
        v-if="songsStore.paths.length < 5"
        :active="position === maxPosition"
        label="Add"
        icon="Plus"
        :gradient="gradient"
        :loading="loading"
        class="w-1/11"
        @mouseenter="() => (position = maxPosition)"
        @click="pickFolder"
      />
    </div>
    <template #footer>
      <KeyHints :hints="['back', 'navigate', 'confirm']" />
    </template>
  </Layout>
</template>
