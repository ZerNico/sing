<script setup lang="ts">
import type { MenuNavigationEvent } from '~/composables/useMenuNavigation'
import type { User } from '~/logic/types'

const router = useRouter()
const { client } = useTRPC()

const back = () => {
  router.push({ name: '/home' })
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
    back()
  } else if (event.action === 'confirm') {
    const user = users.value.at(position.value)
    if (user) {
      toDetails(user)
    }
  } else if (event.action === 'down') {
    increment()
    scrollIntoView(position.value)
  } else if (event.action === 'up') {
    decrement()
    scrollIntoView(position.value)
  }
}

const toDetails = (user: User) => {
  router.push({ name: '/lobby/[id]', params: { id: user.id } })
}

const select = useSoundEffect('select')
watch(position, () => select.play())

const confirm = useSoundEffect('confirm')

onBeforeUnmount(() => {
  confirm.play()
})

const buttonRefs = ref<any[]>([])
const setRefs = (ref: any, index: number) => {
  buttonRefs.value[index] = ref
}

const scrollIntoView = (index: number) => {
  const el = buttonRefs.value[index]
  if (!el) return
  setTimeout(() => {
    unrefElement<HTMLDivElement>(el)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, 5)
}
</script>

<template>
  <Layout class="gradient-bg-secondary" @back="back">
    <template #header>
      <TitleBar title="Lobby" @back="back" />
    </template>

    <div>
      <WideButton
        v-for="user, index in users"
        :key="user.username"
        :ref="(el) => setRefs(el, index)"
        :label="user.username"
        :gradient="{ start: '#36D1DC', end: '#5B86E5' }"
        :active="position === index"
        @mouseenter="() => (position = index)"
        @click="() => toDetails(user)"
      />
    </div>

    <template #footer>
      <KeyHints :hints="['back', 'navigate', 'confirm']" />
    </template>
  </Layout>
</template>
