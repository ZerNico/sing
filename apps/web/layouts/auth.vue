<script setup lang="ts">
const { isLoggedIn, logOut, user } = useAuth()
const runtimeConfig = useRuntimeConfig()
</script>

<template>
  <div class="bg-gray-900 min-h-full grid grid-rows-[max-content]">
    <NavBar class="sticky top-0">
      <HeadlessMenu v-if="isLoggedIn" as="div" class="relative ml-3">
        <div>
          <HeadlessMenuButton class="flex rounded-full bg-gray-800 text-sm hover:(ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500)">
            <span class="sr-only">Open user menu</span>
            <Avatar :first-name="user?.firstName" :last-name="user?.lastName" :username="user?.username" :src="user?.image" alt="User Avatar" />
          </HeadlessMenuButton>
        </div>
        <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
          <HeadlessMenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <HeadlessMenuItem v-slot="{ active }">
              <a :href="runtimeConfig.public.zitadelIssuer" target="_blank" class="block px-4 py-2 text-sm text-gray-700" :class="[active ? 'bg-gray-100' : '']">Edit profile</a>
            </HeadlessMenuItem>
            <HeadlessMenuItem v-slot="{ active }">
              <a href="#" class="block px-4 py-2 text-sm text-gray-700" :class="[active ? 'bg-gray-100' : '']">Leave session</a>
            </HeadlessMenuItem>
            <HeadlessMenuItem v-slot="{ active }" role="button">
              <a class="block px-4 py-2 text-sm text-gray-700" :class="[active ? 'bg-gray-100' : '']" @click="() => logOut()">Sign out</a>
            </HeadlessMenuItem>
          </HeadlessMenuItems>
        </transition>
      </HeadlessMenu>
    </NavBar>
    <slot />
  </div>
</template>
