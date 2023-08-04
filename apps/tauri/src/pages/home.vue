<script setup lang="ts">
import { useQRCode } from '@vueuse/integrations/useQRCode'
const { client } = useHono()
const { t } = useI18n()
const select = useSoundEffect('select')
const confirm = useSoundEffect('confirm')
const lobbyStore = useLobbyStore()
const router = useRouter()

const getLobby = async () => {
  client.lobby.current.$get()
}

const webUrl = import.meta.env.VITE_WEB_URL

const joinUrl = computed(() => {
  if (!lobbyStore.lobby) return ''
  return `${webUrl}/join/${lobbyStore.lobby.code}`
})

const qrcode = useQRCode(joinUrl, {
  type: 'image/webp',
})

const cards = [
  {
    icon: 'i-sing-vinyl-record',
    title: t('sing.title'),
    class: 'from-sing-start to-sing-end',
    animation: 'animate-spin-10000',
    description: t('sing.description'),
    action: () => router.push({ name: '/sing/songs' }),
  },
  {
    icon: 'i-sing-dice',
    title: t('party.title'),
    class: 'from-party-start to-party-end',
    animation: 'animate-scale',
    description: t('party.description'),
    action: () => router.push({ name: '/party/' }),
  },
  {
    icon: 'i-sing-group',
    title: t('lobby.title'),
    class: 'from-lobby-start to-lobby-end',
    animation: 'animate-pulse',
    description: t('lobby.description'),
    action: () => router.push({ name: '/lobby/' }),
  },
  {
    icon: 'i-sing-gear',
    title: t('settings.title'),
    class: 'from-settings-start to-settings-end',
    animation: 'animate-spin-10000',
    description: t('settings.description'),
    action: () => router.push({ name: '/settings/' }),
  },
] as const

const { position, increment, decrement } = useLoop(cards.length - 1)

useMenuNavigation((e) => {
  if (e.action === 'confirm') {
    cards.at(position.value)?.action()
  } else if (e.action === 'right') {
    increment()
  } else if (e.action === 'left') {
    decrement()
  }
})

watch(position, () => select.play())

onBeforeUnmount(() => {
  confirm.play()
})
</script>

<template>
  <Layout class="gradient-bg-main">
    <template #header>
      <div class="text-2cqw font-bold uppercase">Tune Perfect</div>
    </template>
    <div class="h-full flex flex-col items-center justify-center" @click="getLobby">
      <div class="h-3/7 w-full flex flex-shrink items-center gap-2cqw">
        <div class="flex-grow"></div>
        <template v-if="lobbyStore.lobby">
          <div class="text-right">
            <p class="text-4cqw font-bold leading-tight">
              {{ lobbyStore.lobby.code }}
            </p>
            <p class="text-neutral-300 text-0.8cqw">{{ webUrl }}/join</p>
          </div>
          <div class="h-2/3">
            <img :src="qrcode" alt="QR Code" class="h-full rounded-1.5cqh" />
          </div>
        </template>
      </div>
      <div class="h-4/7 w-full flex items-center gap-2cqw">
        <ModeCard
          v-for="(card, index) in cards"
          v-bind="card"
          :key="card.title"
          :active="index === position"
          class="h-full flex-1"
          :class="card.class"
          @mouseenter="position = index"
          @click="card.action"
        />
      </div>
    </div>
    <template #footer>
      <KeyHints :hints="['navigate', 'confirm']"></KeyHints>
    </template>
  </Layout>
</template>

<style scoped></style>
