<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { LocaleObject } from '@nuxtjs/i18n/dist/runtime/composables'

const { locales, setLocale } = useI18n()

const availableLocales = ref(locales as unknown as LocaleObject[])
</script>

<template>
  <Menu as="div" class="relative">
    <div class="flex items-center h-full">
      <MenuButton class="hover:opacity-50 p-2">
        <div class="i-carbon-earth-europe-africa text-2xl"></div>
      </MenuButton>
    </div>
    <MenuItems
      class="absolute right-0 mt-2 min-w-40 w-max origin-top-right bg-popover text-popover-foreground border flex flex-col rounded-md shadow-sm outline-none py-1"
    >
      <MenuItem v-for="loc in availableLocales" v-slot="{ active }" :key="loc.code">
        <div class="px-1 w-full flex">
          <button
            class="flex items-center w-full rounded-md py-1 px-3 gap-1 text-sm transition-colors"
            :class="{ 'bg-accent text-accent-foreground': active }"
            @click="() => setLocale(loc.code)"
          >
            <p>{{ loc.name }}</p>
          </button>
        </div>
      </MenuItem>
    </MenuItems>
  </Menu>
</template>

<style scoped></style>
