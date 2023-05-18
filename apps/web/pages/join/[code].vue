<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query'
import { isUnauthorizedError } from '~/lib/utils/api'

definePageMeta({
  middleware: ['auth', 'lobby'],
  layout: 'auth',
  lobby: false,
})

const router = useRouter()
const route = useRoute('join-code')
const { signIn } = useLogto()
const { client } = useTRPC()
const { displayError } = useErrorDisplay()
const localePath = useLocalePath()

const joinLobby = async () => {
  await client.lobby.join.mutate({ code: route.params.code })
}

const { mutate } = useMutation({
  mutationFn: joinLobby,
  retry: false,
  onError: (err) => {
    if (isUnauthorizedError(err)) {
      signIn(route.path)
      return
    }
    displayError(err)
    router.push(localePath('/join'))
  },
  onSuccess: () => {
    router.push(localePath('/lobby'))
  },
})

onMounted(() => {
  mutate()
})
</script>

<template>
  <div class="w-full h-full flex items-center justify-center">
    <div class="i-svg-spinners-180-ring-with-bg text-4xl"></div>
  </div>
</template>
