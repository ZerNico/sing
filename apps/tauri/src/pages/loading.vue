<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const songsStore = useSongsStore()
const confirm = useSoundEffect('confirm')

const load = async () => {
  if (songsStore.needsUpdate) {
    await songsStore.updateLocal()
  }

  const redirect = (route.query?.redirect as string) || '/home'
  router.replace(redirect)
}
onMounted(() => {
  load()
})

onBeforeUnmount(() => {
  confirm.play()
})
</script>

<template>
  <Layout class="gradient-bg-main">
    <template #header>
      <TitleBar title="Loading" :back-arrow="false" />
    </template>
    <div class="flex flex-col items-center justify-center">
      <div class="i-sing-spinner block animate-spin text-5cqw"></div>
    </div>
    <template #footer>
      <KeyHints class="opacity-0" :hints="['navigate', 'confirm']"></KeyHints>
    </template>
  </Layout>
</template>
