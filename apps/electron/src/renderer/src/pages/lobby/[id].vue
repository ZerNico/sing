<script setup lang="ts">
import type { MenuNavigationEvent } from '@renderer/composables/useMenuNavigation'

const router = useRouter()
const route = useRoute()
const { client } = useTRPC()

const back = () => {
  router.push('/lobby')
}

const kickUser = async () => {
  const id = route.params.id as string
  await client.lobby.kick.mutate({ userId: id })
}

const kickFallback = useOfflineFallbackFn(kickUser, async () => {})

const { isLoading, mutate } = useMutation({
  mutationFn: kickFallback,
  retry: 4,
  retryDelay: 1000,
  onSuccess: () => {
    router.push('/lobby')
  },
})

const queryUsers = async () => {
  const lobbyStatus = await client.lobby.status.query()
  return lobbyStatus.lobby.users
}

const fallback = useOfflineFallbackFn(queryUsers, async () => [])

const status = useQuery({
  queryKey: ['queryStatus'],
  queryFn: fallback,
  retry: 2,
  retryDelay: 0,
  refetchOnWindowFocus: false,
})

const username = computed(() => {
  const id = route.params.id as string
  const user = status?.data?.value?.find(user => user.id === id)
  return user?.username
})

useMenuNavigation(useRepeatThrottleFn(e => onNavigate(e), 150))
const onNavigate = (event: MenuNavigationEvent) => {
  if (event.action === 'back') {
    router.back()
  } else if (event.action === 'confirm') {
    kick()
  }
}
const kick = () => {
  if (isLoading.value) return
  mutate()
}
</script>

<template>
  <Layout class="gradient-bg-secondary" @back="back">
    <template #header>
      <TitleBar title="Lobby" :description="username" @back="back" />
    </template>
    <div class="flex flex-col justify-center">
      <WideButton
        label="Kick"
        :gradient="{ start: '#36D1DC', end: '#5B86E5' }"
        :active="true"
        @click="kick"
      />
    </div>
    <template #footer>
      <KeyHints :hints="['back', 'confirm']" />
    </template>
  </Layout>
</template>
