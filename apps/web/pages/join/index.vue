<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query'
import { isUnauthorizedError } from '~/lib/utils/api'

definePageMeta({
  middleware: ['auth', 'lobby'],
  layout: 'auth',
  lobby: false,
})

const { t } = useI18n()
const { client } = useTRPC()
const localePath = useLocalePath()
const router = useRouter()
const route = useRoute()
const { signIn } = useLogto()
const { displayError } = useErrorDisplay()

const lobbyCode = ref('')

const joinLobby = async (e: Event) => {
  e.preventDefault()

  await client.lobby.join.mutate({ code: lobbyCode.value })
}

const { isLoading, mutate } = useMutation({
  mutationFn: joinLobby,
  retry: false,
  onError: (err) => {
    if (isUnauthorizedError(err)) {
      signIn(route.path)
      return
    }
    displayError(err)
  },
  onSuccess: () => {
    router.push(localePath('/lobby'))
  },
})
</script>

<template>
  <div class="w-full h-full p-8">
    <form class="w-full h-full grid place-items-center" @submit="mutate">
      <UiCard
        class="w-full max-w-100"
        :title="t('lobby.enter_code_title')"
        :description="t('lobby.enter_code_message')"
      >
        <div class="flex flex-col gap-2">
          <UiLabel for="code">{{ t('lobby.enter_code_label') }}</UiLabel>
          <UiInput id="code" v-model="lobbyCode" :placeholder="t('lobby.enter_code_placeholder')" />
        </div>
        <template #footer>
          <UiButton :loading="isLoading" class="w-full">{{ t('lobby.enter_code_submit') }}</UiButton>
        </template>
      </UiCard>
    </form>
  </div>
</template>
