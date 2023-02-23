<script setup lang="ts">
import { useNotification } from '@kyvg/vue3-notification'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { TRPCClientError } from '@trpc/client'

definePageMeta({ middleware: ['auth'], layout: 'auth' })

const router = useRouter()
const { notify } = useNotification()
const { client } = useTRPC()
const queryClient = useQueryClient()

const queryUsers = async () => {
  const res = await client.lobby.users.query()
  return res.users
}

const proxy = useAuthProxyFn(queryUsers)

const { data } = useQuery({
  queryKey: ['queryUsers'],
  queryFn: proxy,
  retry: 2,
  retryDelay: 1000,
  refetchOnWindowFocus: true,
  cacheTime: 10000,
  refetchInterval: 10000,
  onError: (err) => {
    if (err instanceof TRPCClientError && err.data.code === 'NOT_FOUND') {
      queryClient.invalidateQueries({ queryKey: ['queryUsers'] })
      router.push('/join')
    } else {
      notify({
        type: 'error',
        title: 'Error',
        text: 'Something went wrong!',
      })
    }
  },
})

// sort alphabetically
const sortedUsers = computed(() => {
  if (!data.value) return []
  return [...data.value].sort((a, b) => a.username.localeCompare(b.username))
})
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <div v-for="user in sortedUsers" :key="user.id" class="flex items-center bg-gray-800 border border-gray-700 rounded-lg p-2 gap-3 w-full md:w-1/2 xl:w-1-/3">
      <Avatar :username="user.username" :src="user.picture ?? undefined" />
      <div class="text-white font-semibold truncate">
        {{ user.username }}
      </div>
    </div>
  </div>
</template>
