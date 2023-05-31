<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query'
import { isUnauthorizedError } from '~/lib/utils/api'

definePageMeta({
  middleware: ['auth', 'lobby'],
  layout: 'auth',
})

const { claims, signIn } = useLogto()
const { client } = useTRPC()
const { t } = useI18n()
const { notify } = useNotification()
const route = useRoute()
const router = useRouter()
const { displayError } = useErrorDisplay()

const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')

const updatePassword = async (event: Event) => {
  event.preventDefault()

  await client.user.updatePassword.mutate({
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
    newPasswordConfirm: newPasswordConfirm.value,
  })
}

const { isLoading, mutate } = useMutation({
  mutationFn: updatePassword,
  onSuccess: () => {
    notify({
      title: t('notification.success_title'),
      message: t('user.edit_password_success'),
      type: 'success',
    })
  },
  onError: (err) => {
    if (isUnauthorizedError(err)) {
      signIn(route.path)
      return
    }
    displayError(err)
  },
})
</script>

<template>
  <div class="w-full h-full flex items-center justify-center p-8" @submit="mutate">
    <form class="w-full h-full grid place-items-center">
      <UiCard
        back
        class="w-full max-w-100"
        :title="t('user.edit_password_title')"
        :description="t('user.edit_password_message')"
        @back="router.back()"
      >
        <input id="username" type="text" autocomplete="username" class="hidden" :value="claims.value?.username" />
        <div class="flex flex-col gap-2">
          <UiLabel for="current-password">{{ t('user.edit_password_current_label') }}</UiLabel>
          <UiInput
            id="current-password"
            v-model="currentPassword"
            autocomplete="current-password"
            type="password"
            :placeholder="t('user.edit_password_current_placeholder')"
          />
        </div>
        <div class="flex flex-col gap-2">
          <UiLabel for="new-password">{{ t('user.edit_password_new_label') }}</UiLabel>
          <UiInput
            id="new-password"
            v-model="newPassword"
            type="password"
            autocomplete="new-password"
            :placeholder="t('user.edit_password_new_placeholder')"
          />
        </div>
        <div class="flex flex-col gap-2">
          <UiLabel for="new-password-confirm">{{ t('user.edit_password_confirm_label') }}</UiLabel>
          <UiInput
            id="new-password-confirm"
            v-model="newPasswordConfirm"
            type="password"
            autocomplete="new-password"
            :placeholder="t('user.edit_password_confirm_placeholder')"
          />
        </div>
        <template #footer>
          <UiButton :loading="isLoading" class="w-full">{{ t('user.edit_password_submit') }}</UiButton>
        </template>
      </UiCard>
    </form>
  </div>
</template>

<style scoped></style>
