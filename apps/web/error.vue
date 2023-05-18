<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode: number
    message: string
    url: string
    statusMessage: string
  }
}>()

const { t } = useI18n()

const message = computed(() => {
  if (props.error.statusCode === 404) {
    return t('error.page_not_found')
  }

  return t('error.unknown_error')
})
</script>

<template>
  <div class="w-full h-full flex items-center justify-center p-6">
    <UiCard :title="props.error.statusCode.toString()" :description="message">
      <template #footer>
        <NuxtLink to="/"><UiButton>Home</UiButton></NuxtLink>
      </template>
    </UiCard>
  </div>
</template>
