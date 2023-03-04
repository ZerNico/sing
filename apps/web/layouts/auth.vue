<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

const router = useRouter()
const queryClient = useQueryClient()
const { client } = useTRPC()
const { isLoggedIn, logOut, user } = useAuth()
const runtimeConfig = useRuntimeConfig()

const mutateLeave = () => client.lobby.leave.mutate()

const leave = useMutation({
  mutationFn: mutateLeave,
  retry: 2,
  retryDelay: 0,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['queryJoined', 'queryUsers'] })
    router.push('/join')
  },
  onError: () => {
    notify({
      type: 'error',
      title: 'Error',
      text: 'Something went wrong!',
    })
  },
})

const consoleUrl = computed(() => {
  return `${runtimeConfig.public.zitadelIssuer}/ui/console/users/me?login_hint=${user.value?.username}@${user.value?.orgDomain}`
})
</script>

<template>
  <div class="bg-gray-900 min-h-full grid grid-rows-[max-content]">
    <NavBar class="sticky top-0">
      <HeadlessMenu v-if="isLoggedIn" as="div" class="relative ml-3">
        <div>
          <HeadlessMenuButton class="flex rounded-full bg-gray-800 text-sm hover:(ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500)">
            <span class="sr-only">Open user menu</span>
            <Avatar :username="user?.username" :src="user?.image" alt="User Avatar" />
          </HeadlessMenuButton>
        </div>
        <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
          <HeadlessMenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <HeadlessMenuItem v-slot="{ active }">
              <a :href="consoleUrl" target="_blank" class="block px-4 py-2 text-sm text-gray-700" :class="[active ? 'bg-gray-100' : '']">Edit profile</a>
            </HeadlessMenuItem>
            <HeadlessMenuItem v-slot="{ active }" role="button">
              <a class="block px-4 py-2 text-sm text-gray-700" :class="[active ? 'bg-gray-100' : '']" @click="() => leave.mutate()">Leave lobby</a>
            </HeadlessMenuItem>
            <HeadlessMenuItem v-slot="{ active }" role="button">
              <a class="block px-4 py-2 text-sm text-gray-700" :class="[active ? 'bg-gray-100' : '']" @click="() => logOut()">Sign out</a>
            </HeadlessMenuItem>
          </HeadlessMenuItems>
        </transition>
      </HeadlessMenu>
    </NavBar>
    <main class="p-5">
      <slot />
    </main>
  </div>
</template>
