<script setup lang="ts">
import { isHonoClientError } from '~/composables/useHono'

const { t } = useI18n()
const { client } = useHono()
const router = useRouter()
const { handleError } = useErrorHandler()
const lobbyStore = useLobbyStore()
const settingsStore = useSettingsStore()
const select = useSoundEffect('select')
const confirm = useSoundEffect('confirm')

const createLobby = async () => {
  if (settingsStore.general.forceOffline) {
    lobbyStore.mode = 'offline'
    return
  }

  const response = await client.lobby.$post({ json: { version: __APP_VERSION__ } })
  const body = await response.json()
  lobbyStore.lobby = body.lobby
  lobbyStore.jwt = body.token
  lobbyStore.mode = 'online'
}

const { isLoading, isError, isSuccess, mutate } = useMutation({
  mutationFn: createLobby,
  retry: 3,
  retryDelay: 500,
  onError: (error) => {
    if (isHonoClientError(error) && error.message === 'client_outdated') {
      router.push({ name: '/update' })
    }
    handleError(error)
  },
  onSuccess: () => {
    router.push({ name: '/loading' })
  },
})

const buttons = [
  { text: t('index.retry'), action: () => mutate() },
  {
    text: t('index.offline'),
    action: () => {
      lobbyStore.mode = 'offline'
      router.push({ name: '/home' })
    },
  },
]

const { position, increment, decrement } = useLoop(buttons.length - 1)

useMenuNavigation((e) => {
  if (isLoading.value) return

  if (e.action === 'confirm') {
    buttons.at(position.value)?.action()
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

onMounted(() => {
  mutate()
})
</script>

<template>
  <Layout class="gradient-bg-main">
    <template #header>
      <TitleBar title="Connecting" :back-arrow="false" />
    </template>
    <div class="flex flex-col items-center justify-center">
      <div v-if="isError && !isSuccess" class="flex flex-col items-center gap-8cqh">
        <div class="text-2cqw font-semibold">{{ t('error.could_not_connect') }}</div>
        <div class="flex gap-1cqw">
          <Button
            v-for="(button, index) in buttons"
            :key="button.text"
            :active="position === index"
            @mouseenter="() => (position = index)"
            @click="button.action"
          >
            {{ button.text }}
          </Button>
        </div>
      </div>
      <div v-else class="i-sing-spinner animate-spin text-5cqw"></div>
    </div>
    <template #footer>
      <KeyHints :hints="['navigate', 'confirm']"></KeyHints>
    </template>
  </Layout>
</template>
