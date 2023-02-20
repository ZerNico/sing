<script setup lang="ts">
import type { MenuNavigationEvent } from '@renderer/composables/useMenuNavigation'
import type { User } from '@renderer/logic/types'

const router = useRouter()
const { client } = useTRPC()

const back = () => {
  router.push('/home')
}

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
  cacheTime: 10000, // 10 seconds
  refetchInterval: 10000, // 10 seconds
})

const users = computed(() => status?.data?.value || [])

const maxPosition = computed(() => {
  const length = status?.data?.value?.length || 1
  return length - 1
})

const { position, increment, decrement } = useLoop(maxPosition)

useMenuNavigation(useRepeatThrottleFn(e => onNavigate(e), 150))
const onNavigate = (event: MenuNavigationEvent) => {
  if (event.action === 'back') {
    router.back()
  } else if (event.action === 'confirm') {
    const user = users.value.at(position.value)
    if (user) {
      toDetails(user)
    }
  } else if (event.action === 'down') {
    increment()
  } else if (event.action === 'up') {
    decrement()
  }
}

const toDetails = (user: User) => {
  router.push(`/lobby/${user.id}`)
}
</script>

<template>
  <Layout class="gradient-bg-secondary" @back="back">
    <template #header>
      <TitleBar title="Lobby" @back="back" />
    </template>
    <div class="flex flex-col justify-center">
      <WideButton
        v-for="(user, i) in users"
        :key="user.username"
        :label="user.username"
        :gradient="{ start: '#36D1DC', end: '#5B86E5' }"
        :active="position === i"
        @mouseenter="() => (position = i)"
        @click="() => toDetails(user)"
      />
    </div>
    <template #footer>
      <KeyHints :hints="['back', 'navigate', 'confirm']" />
    </template>
  </Layout>
</template>
