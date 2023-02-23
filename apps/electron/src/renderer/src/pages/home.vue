<script setup lang="ts">
import { useQRCode } from '@vueuse/integrations/useQRCode'
import type * as icons from '@renderer/logic/ui/icons'
import type { MenuNavigationEvent } from '@renderer/composables/useMenuNavigation'

const router = useRouter()
const lobbyStore = useLobbyStore()
const songsStore = useSongsStore()
const settingsStore = useSettingsStore()
const { client } = useTRPC()

const webUrl = import.meta.env.RENDERER_VITE_WEB_URL

const joinUrl = computed(() => {
  if (!lobbyStore.lobby) return 'Error'
  return `${webUrl}/join/${lobbyStore.lobby.code}`
})

const qrcode = useQRCode(joinUrl, {
  type: 'image/webp',
})

const checkNeededSettings = () => {
  if (songsStore.songs.size === 0) {
    if (error.value) return
    error.value = 'You have no songs added. Go to settings and add your UltraStar songs.'
    setTimeout(() => {
      error.value = undefined
    }, 3000)
    return false
  } else if (settingsStore.microphones.length === 0) {
    if (error.value) return
    error.value = 'You have no microphones added. Go to settings and add your microphones.'
    setTimeout(() => {
      error.value = undefined
    }, 3000)
    return false
  }
  return true
}

const goToSongs = () => {
  if (!checkNeededSettings()) return
  router.push('/songs')
}

const goToParty = async () => {
  if (!checkNeededSettings()) return

  if (lobbyStore.offline) {
    if (error.value) return
    error.value = 'You cannot play party games in offline mode. Restart the game in online mode.'
    setTimeout(() => {
      error.value = undefined
    }, 3000)
    return
  }

  if (settingsStore.microphones.length < 2) {
    if (error.value) return
    error.value = 'You need 2 microphones to play party games. Go to settings and add more microphones.'
    setTimeout(() => {
      error.value = undefined
    }, 3000)
    return
  }

  const users = await fallback()
  if (users.length < 2) {
    if (error.value) return
    error.value = 'You need at least 2 players to play party games. Find some friends and invite them to your lobby.'
    setTimeout(() => {
      error.value = undefined
    }, 3000)
    return
  }

  router.push('/party')
}

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
    action: goToSongs,
    animation: 'spin',
    description: 'Sing your favorite songs, alone or with your friends!',
  },
  {
    icon: 'Dice',
    title: 'Party Games',
    gradient: { start: '#7420FB', end: '#CF56E3' },
    action: goToParty,
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

const error = ref()
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
    <div class="flex flex-col items-center justify-center px-5cqw py-5cqh h-full">
      <div class="w-full h-3/7 flex items-center gap-2cqw">
        <div class="flex-grow flex">
          <div class="flex  bg-red-600 rounded-0.45cqw p-1cqw max-w-30cqw items-center gap-0.7cqw" :class="[!error ? 'opacity-0' : 'transition-opacity']">
            <Icon icon="Info" class="text-2.5cqw" />
            <div class="text-1cqw">
              {{ error }}
            </div>
          </div>
        </div>
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
