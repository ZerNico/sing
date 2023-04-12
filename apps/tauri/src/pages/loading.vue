<script setup lang="ts">
import type { FileEntry } from '@tauri-apps/api/fs'
import { readDir } from '@tauri-apps/api/fs'
import { parseTree } from '~/logic/song/ultrastar-parser'

const route = useRoute()
const router = useRouter()
const songsStore = useSongsStore()

const load = async () => {
  songsStore.clearSongs()
  for (const path of songsStore.paths) {
    const entries = await readDir(path, { recursive: true })
    const root: FileEntry = { path, children: entries }

    const songs = await parseTree(root)
    songsStore.addSongs(songs)
  }

  songsStore.needsUpdate = false
  const redirect = route.query.redirect as string
  router.replace(redirect)
}
load()
</script>

<template>
  <Layout class="gradient-bg-main">
    <div class="flex flex-col items-center justify-center text-2cqw">
      <Icon icon="Spinner" class="text-5cqw animate-spin" />
    </div>
  </Layout>
</template>
