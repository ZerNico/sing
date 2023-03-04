<script setup lang="ts">
import type { MenuNavigationEvent } from '@renderer/composables/useMenuNavigation'
import { useMutation } from '@tanstack/vue-query'

const { client } = useTRPC()

const lobbyStore = useLobbyStore()
const router = useRouter()

const createLobby = () => client.lobby.create.mutate()

const { isLoading, isError, isSuccess, mutate } = useMutation({
  mutationFn: createLobby,
  retry: 3,
  retryDelay: 0,
  onSuccess: (data) => {
    lobbyStore.jwt = data.jwt
    lobbyStore.lobby = data.lobby
    router.push('/home')
  },
})
mutate()

const buttons = [
  { text: 'Retry', action: () => mutate() },
  {
    text: 'Offline',
    action: () => {
      lobbyStore.offline = true
      router.push('/home')
    },
  }]

const { position, increment, decrement } = useLoop(buttons.length - 1)

useMenuNavigation(useRepeatThrottleFn(e => onNavigate(e), 150))

const onNavigate = (event: MenuNavigationEvent) => {
  if (isLoading.value) return

  if (event.action === 'confirm') {
    buttons.at(position.value)?.action()
  } else if (event.action === 'right') {
    increment()
  } else if (event.action === 'left') {
    decrement()
  }
}

const gradient = { start: '#11998ec5', end: '#38ef7dc5' }

const select = useSoundEffect('select')
watch(position, () => select.play())

const confirm = useSoundEffect('confirm')

onBeforeUnmount(() => {
  confirm.play()
})
</script>

<template>
  <Layout class="gradient-bg-main">
    <div class="flex flex-col items-center justify-center text-2cqw">
      <Icon v-if="isLoading" icon="Spinner" class="text-5cqw animate-spin" />
      <div v-if="isError && !isSuccess" class="flex flex-col items-center gap-8cqh">
        <p class="text-2cqw font-semibold">
          Could not connect to server.
        </p>
        <div class="flex gap-1cqw">
          <Button
            v-for="button, index in buttons"
            :key="button.text"
            :active="position === index"
            :gradient="gradient"
            @mouseenter="() => position = index"
            @click="button.action"
          >
            {{ button.text }}
          </Button>
        </div>
      </div>
    </div>
    <template #footer>
      <KeyHints :hints="['navigate', 'confirm']" />
    </template>
  </Layout>
</template>
