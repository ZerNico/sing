<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()
</script>

<template>
  <div class="gradient-bg-main min-h-full grid grid-rows-[max-content] text-white">
    <UiNavBar class="sticky top-0">
      <div class="flex justify-between w-full items-center">
        <NuxtLink class="text-lg font-bold" :to="localePath('/')">Tune Perfect</NuxtLink>
        <div class="flex gap-2 items-center">
          <NuxtLink :to="localePath('/join')">
            <UiButton variant="gradient">{{ t('index.join_lobby') }}</UiButton>
          </NuxtLink>
          <LanguagePicker />
        </div>
      </div>
    </UiNavBar>
    <slot />
  </div>
</template>
