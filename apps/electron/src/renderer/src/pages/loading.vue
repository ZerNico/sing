<script setup lang="ts">
import { parseTree } from '@renderer/logic/song/ultrastar-parser'

const route = useRoute()
const router = useRouter()
const songsStore = useSongsStore()
const { ipc } = useTRPC()

const load = async () => {
  songsStore.clearSongs()
  for (const path of songsStore.paths) {
    const tree = await ipc.songs.getTree.query({ path })
    const songs = await parseTree(tree)
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
