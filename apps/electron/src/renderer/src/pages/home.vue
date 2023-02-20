<script setup lang="ts">
import { useQRCode } from '@vueuse/integrations/useQRCode'
import type * as icons from '@renderer/logic/ui/icons'
import type { MenuNavigationEvent } from '@renderer/composables/useMenuNavigation'

const router = useRouter()
const lobbyStore = useLobbyStore()
const { client } = useTRPC()

const webUrl = import.meta.env.RENDERER_VITE_WEB_URL

const joinUrl = computed(() => {
  if (!lobbyStore.lobby) return 'Error'
  return `${webUrl}/join/${lobbyStore.lobby.code}`
})

const qrcode = useQRCode(joinUrl, {
  type: 'image/webp',
})

const cards: {
  icon: keyof typeof icons
  title: string
  gradient: { start: string; end: string }
  action: () => void
  animation?: 'spin' | 'pulse'
  description: string
}[] = [
  {
    icon: 'VinylRecord',
    title: 'Sing',
    gradient: { start: '#11998e', end: '#38ef7d' },
    action: () => router.push('/songs'),
    animation: 'spin',
    description: 'Sing your favorite songs, alone or with your friends!',
  },
  {
    icon: 'Dice',
    title: 'Party Games',
    gradient: { start: '#7420FB', end: '#CF56E3' },
    action: () => router.push('/party'),
    animation: 'pulse',
    description:
      'Battle it out with your friends in one of the different party game modes!',
  },
  {
    icon: 'Group',
    title: 'Lobby',
    gradient: { start: '#c94b4b', end: '#ffc0cb' },
    action: () => router.push('/lobby'),
    animation: 'pulse',
    description: 'Manage the party you are in and invite your friends.',
  },
  {
    icon: 'Gear',
    title: 'Settings',
    gradient: { start: '#36D1DC', end: '#5B86E5' },
    action: () => router.push('/settings'),
    animation: 'spin',
    description: 'Change your settings or add your songs and microphones.',
  },
]

const { position, increment, decrement } = useLoop(cards.length - 1)
useMenuNavigation(useRepeatThrottleFn(e => onNavigate(e), 150))
const onNavigate = (event: MenuNavigationEvent) => {
  if (event.action === 'confirm') {
    cards[position.value].action()
  } else if (event.action === 'right') {
    increment()
  } else if (event.action === 'left') {
    decrement()
  }
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

const select = useSoundEffect('select')
watch(position, () => select.play())

const confirm = useSoundEffect('confirm')

onBeforeUnmount(() => {
  confirm.play()
})
</script>

<template>
  <Layout class="gradient-bg-main">
    <template #header>
      <div class="flex justify-between items-center">
        <div class="uppercase font-bold text-2cqw">
          Tune Perfect
        </div>
        <div class="flex gap-0.2cqw">
          <Avatar v-for="user in status.data.value?.slice(0, 15)" :key="user.id" :username="user.username" :src="user.picture ?? undefined" />
        </div>
      </div>
    </template>
    <div class="flex flex-col items-center justify-center px-5cqw py-5cqh">
      <div class="w-full h-3/7 flex justify-end items-center gap-2cqw">
        <template v-if="lobbyStore.lobby">
          <div class="text-right">
            <p class="font-bold text-4cqw leading-tight">
              {{ lobbyStore.lobby.code }}
            </p>
            <p class="text-0.8cqw text-neutral-300">
              {{ webUrl }}/join
            </p>
          </div>
          <div class="h-1/2">
            <img :src="qrcode" alt="QR Code" class="rounded-1.5cqh h-full">
          </div>
        </template>
      </div>
      <div class="h-4/7 w-full flex gap-1cqw">
        <ModeCard
          v-for="card, index in cards"
          :key="card.title"
          class="flex-1"
          :title="card.title"
          :gradient="card.gradient"
          :description="card.description"
          :icon="card.icon"
          :active="position === index"
          :animation="card.animation"
          @mouseenter="() => (position = index)"
          @click="card.action"
        />
      </div>
    </div>
    <template #footer>
      <KeyHints :hints="['navigate', 'confirm']" />
    </template>
  </Layout>
</template>
