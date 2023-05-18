<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { useMutation } from '@tanstack/vue-query'
import { isUnauthorizedError } from '~/lib/utils/api'

const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const router = useRouter()
const { claims, signOut, signIn } = useLogto()
const { client } = useTRPC()
const { notify } = useNotification()

const lobby = useState<boolean | undefined>('lobby-layout', () => undefined)

watch(
  () => route.meta.lobby,
  (lobbyMeta) => {
    if (lobbyMeta === undefined) return
    lobby.value = lobbyMeta as boolean
  },
  { immediate: true }
)

const navButtons = computed(() => {
  if (lobby.value) {
    return [
      {
        icon: 'i-carbon-group',
        to: localePath('/lobby'),
        label: t('nav.users'),
      },
      {
        icon: 'i-carbon-user',
        to: localePath('/user/edit-profile'),
        label: t('nav.profile'),
      },
    ]
  } else {
    return [
      {
        icon: 'i-carbon-collaborate',
        to: localePath('/join'),
        label: t('nav.join'),
      },
      {
        icon: 'i-carbon-user',
        to: localePath('/user/edit-profile'),
        label: t('nav.profile'),
      },
    ]
  }
})

const menuItems = computed(() => {
  const editProfileItem = {
    icon: 'i-carbon-user',
    action: () => router.push(localePath('/user/edit-profile')),
    label: t('nav.edit_profile'),
  }
  const leaveLobbyItem = {
    icon: 'i-carbon-close-outline',
    action: () => mutate(),
    label: t('nav.leave_lobby'),
  }
  const signOutItem = {
    icon: 'i-carbon-logout',
    action: () => signOut(),
    label: t('nav.sign_out'),
  }

  if (lobby.value) {
    return [editProfileItem, leaveLobbyItem, signOutItem]
  } else {
    return [editProfileItem, signOutItem]
  }
})

const isActive = (to: string) => {
  return router.currentRoute.value.path === to
}

const leaveLobby = async () => {
  await client.lobby.leave.mutate()
}

const { mutate } = useMutation({
  mutationFn: leaveLobby,
  onError: (err) => {
    if (isUnauthorizedError(err)) {
      signIn(route.path)
      return
    }
    notify({
      title: t('notification.error_title'),
      message: t('error.unknown_error'),
      type: 'error',
    })
  },
  onSuccess: () => {
    router.push(localePath('/join'))
  },
})
</script>

<template>
  <div class="bg-background text-foreground min-h-full grid grid-rows-[max-content] <md:pb-16">
    <UiNavBar class="sticky top-0 z-2">
      <div class="flex justify-between w-full items-center h-full">
        <NuxtLink class="text-lg font-bold" :to="localePath('/')">Tune Perfect</NuxtLink>
        <div class="flex items-center justify-center h-full gap-6 <md:hidden">
          <UiNavItem
            v-for="navButton in navButtons"
            :key="navButton.to"
            :active="isActive(navButton.to)"
            :to="navButton.to"
            :icon="navButton.icon"
          >
            {{ navButton.label }}
          </UiNavItem>
        </div>
        <div class="flex gap-2">
          <Menu as="div" class="relative">
            <div class="flex items-center">
              <MenuButton class="hover:opacity-50">
                <UiAvatar :src="claims?.picture" :fallback="claims?.username?.at(0)"></UiAvatar>
              </MenuButton>
            </div>
            <MenuItems
              class="absolute right-0 mt-2 min-w-40 w-max origin-top-right bg-popover text-popover-foreground border flex flex-col rounded-md shadow-sm outline-none py-1"
            >
              <MenuItem v-for="item in menuItems" v-slot="{ active }" :key="item.label">
                <div class="px-1 w-full flex">
                  <button
                    class="flex items-center w-full rounded-md py-1 px-3 gap-1 text-sm transition-colors"
                    :class="{ 'bg-accent text-accent-foreground': active }"
                    @click="() => item.action()"
                  >
                    <div :class="item.icon"></div>
                    <p>{{ item.label }}</p>
                  </button>
                </div>
              </MenuItem>
            </MenuItems>
          </Menu>
          <LanguagePicker />
        </div>
      </div>
    </UiNavBar>
    <slot />
    <UiNavBar class="fixed bottom-0 w-full md:hidden h-18" bottom>
      <div class="flex items-center justify-center w-full h-full gap-4">
        <UiNavItem
          v-for="navButton in navButtons"
          :key="navButton.to"
          :active="isActive(navButton.to)"
          :to="navButton.to"
          :icon="navButton.icon"
        >
          {{ navButton.label }}
        </UiNavItem>
      </div>
    </UiNavBar>
  </div>
</template>
