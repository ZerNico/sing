<script setup lang="ts">
import { useNotification } from '@kyvg/vue3-notification'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { TRPCClientError } from '@trpc/client'

// @ts-ignore 123
definePageMeta({ middleware: 'auth', layout: 'auth' })

const route = useRoute('join-code')
const { client } = useTRPC()
const queryClient = useQueryClient()
const router = useRouter()
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
    router.push('/join')
  },
})

join.mutate(route.params.code.toString())
</script>

<template>
  <div />
</template>
