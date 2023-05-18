<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'

definePageMeta({
  middleware: ['auth', 'lobby'],
  layout: 'auth',
  lobby: true,
})

const { client } = useTRPC()

const getLobby = () => {
  return client.lobby.current.query()
}

const { data, suspense } = useQuery({
  queryKey: ['current-lobby'],
  queryFn: getLobby,
  refetchInterval: 10000,
})

onServerPrefetch(async () => {
  await suspense()
})
</script>

<template>
  <div class="w-full h-full p-8 flex flex-col justify-center items-center gap-2">
    <UiCard v-for="user of data?.lobby?.users" :key="user.id" class="w-full max-w-100">
      <div class="flex items-center gap-4 -m-2">
        <UiAvatar :src="user.picture" :fallback="user.username.charAt(0)" />
        <div>{{ user.username }}</div>
      </div>
    </UiCard>
  </div>
</template>
