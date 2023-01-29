<script setup lang="ts">
import { TRPCClientError } from '@trpc/client'
import { useNotification } from '@kyvg/vue3-notification'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

definePageMeta({ middleware: 'auth', layout: 'auth' })

const { client } = useTRPC()
const router = useRouter()
const queryClient = useQueryClient()
const { notify } = useNotification()

const mutateJoin = (code: string) => client.lobby.join.mutate({ code })

const join = useMutation({
  mutationFn: mutateJoin,
  retry: 2,
  retryDelay: 0,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['queryJoined'] })
    router.push('/lobby')
  },
  onError: (error) => {
    if (error instanceof TRPCClientError && error.data.code === 'NOT_FOUND') {
      notify({
        type: 'info',
        title: 'Info',
        text: 'Lobby not found!',
      })
    } else {
      notify({
        type: 'error',
        title: 'Error',
        text: 'Something went wrong!',
      })
    }
  },
})

const code = ref('')
const onSubmit = (e: Event) => {
  e.preventDefault()
  if (join.isLoading.value) return

  join.mutate(code.value)
}
</script>

<template>
  <div class="flex items-center justify-center p-5">
    <form class="py-6 px-8 flex flex-col gap-10 bg-black/20 text-white bg-gray-700 rounded-lg shadow min-w-1/4" @submit="onSubmit">
      <p class="font-medium text-xl">
        Enter your lobby code
      </p>
      <div>
        <label for="code" class="block mb-2 text-sm font-medium text-white">Lobby code</label>
        <input id="code" v-model="code" name="code" class="text-xl border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white" placeholder="FW6BM" required>
      </div>
      <Button :disabled="join.isLoading.value" type="submit">
        Join
      </Button>
    </form>
  </div>
</template>
