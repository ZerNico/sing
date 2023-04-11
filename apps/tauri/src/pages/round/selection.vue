<script setup lang="ts">
import type { MenuNavigationEvent } from '~/composables/useMenuNavigation'
import type { User } from '~/logic/types'
import { selectionPlayer1, selectionPlayer2 } from '~/logic/ui/pageStates'

const router = useRouter()
const settingsStore = useSettingsStore()
const roundStore = useRoundStore()
const { client } = useTRPC()

const back = () => {
  router.push({ name: '/songs' })
}

const start = () => {
  if (micCount.value === 0) return
  if (micCount.value >= 1) {
    roundStore.player1 = users.value.find(user => user.username === selectionPlayer1.value) ?? guest
  }
  if (micCount.value >= 2) {
    roundStore.player2 = users.value.find(user => user.username === selectionPlayer2.value) ?? guest
  }
  router.push({ name: '/round/sing' })
}

const micCount = computed(() => {
  return settingsStore.microphones.length
})

const guest: User = { username: 'Guest', id: 'guest', orgDomain: 'guest', createdAt: new Date(), updatedAt: new Date(), picture: null, lobbyId: null }

const users = computed(() => {
  const users = status.data.value ?? []
  return [guest, ...users]
})

const usernames = computed(() => {
  return users.value.map(user => user.username) ?? []
})

const buttons = computed(() => {
  const startButton = { type: 'button', label: 'Start', action: start } as const

  if (micCount.value === 0) return [] as const

  const player1Button = { type: 'list', label: 'Player 1', value: selectionPlayer1, options: usernames } as const
  if (micCount.value === 1) return [player1Button, startButton] as const

  const player2Button = { type: 'list', label: 'Player 2', value: selectionPlayer2, options: usernames } as const

  return [player1Button, player2Button, startButton] as const
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
  cacheTime: 10000, // 10 seconds
  refetchInterval: 10000, // 10 seconds
  onSuccess: (users) => {
    if (users.length === 0) return
    if (selectionPlayer1.value === '') selectionPlayer1.value = users[0].username
    if (selectionPlayer2.value === '') selectionPlayer2.value = users[0].username
  },
  onError: () => {
    back()
  },
})

watch(users, (newUsers) => {
  if (newUsers.length === 0) return

  if (!usernames.value.includes(selectionPlayer1.value)) {
    selectionPlayer1.value = usernames.value[0]
  }
  if (!usernames.value.includes(selectionPlayer2.value)) {
    selectionPlayer2.value = usernames.value[0]
  }
})

const { position, increment, decrement } = useLoop(buttons.value.length - 1, { initial: micCount.value })

useMenuNavigation(useRepeatThrottleFn(e => onNavigate(e), 150))
const onNavigate = (event: MenuNavigationEvent) => {
  if (event.action === 'back') {
    back()
  } else if (event.action === 'confirm') {
    const button = buttons.value.at(position.value)
    if (button && button.type === 'button') {
      button.action()
    }
  } else if (event.action === 'down') {
    increment()
  } else if (event.action === 'up') {
    decrement()
  } else if (event.action === 'right') {
    const next = buttonRefs.value.at(position.value)?.next
    if (next) next()
  } else if (event.action === 'left') {
    const prev = buttonRefs.value.at(position.value)?.prev
    if (prev) prev()
  }
}

const buttonRefs = ref<any[]>([])
const setRefs = (ref: any, index: number) => {
  buttonRefs.value[index] = ref
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
      <TitleBar title="Selection" @back="back" />
    </template>
    <div class="flex flex-col justify-center">
      <template v-for="button, index in buttons">
        <ListInput
          v-if="button.type === 'list'"
          :key="`list${button.label}`"
          :ref="(el) => setRefs(el, index)"
          v-model="button.value.value"
          :active="index === position"
          :label="button.label"
          :gradient="gradient"
          :options="button.options.value"
          class="w-full"
          @mouseenter="position = index"
        />
        <WideButton
          v-else
          :key="`button${button.label}`"
          :ref="(el) => setRefs(el, index)"
          :label="button.label"
          :gradient="{ start: '#36D1DC', end: '#5B86E5' }"
          :active="index === position"
          @mouseenter="position = index"
          @click="button.action"
        />
      </template>
    </div>
    <template #footer>
      <KeyHints :hints="['back', 'navigate', 'confirm']" />
    </template>
  </Layout>
</template>
