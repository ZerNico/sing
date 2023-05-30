<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-8">
    <h1 class="text-5xl font-bold">Tune Perfect</h1>
    <p class="text-lg">{{ t('index.tagline') }}</p>
    <div class="mt-10">
      <NuxtLink href="https://github.com/ZerNico/sing/releases">
        <UiButton variant="gradient" size="lg">{{ t('index.download') }}</UiButton>
      </NuxtLink>
    </div>
  </div>
</template>
