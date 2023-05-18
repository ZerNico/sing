<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query'
import imageCompression from 'browser-image-compression'
import { isUnauthorizedError } from '~/lib/utils/api'

definePageMeta({
  middleware: ['auth', 'lobby'],
  layout: 'auth',
})

const { claims, fetchContext, signIn } = useLogto()
const { client } = useTRPC()
const { t } = useI18n()
const { notify } = useNotification()
const route = useRoute()
const { displayError } = useErrorDisplay()

const username = ref(claims.value?.username || '')
const avatarUrl = ref(claims.value?.picture)
const avatar = ref<File>()
const avatarInputEl = ref<HTMLInputElement | null>(null)

const onSelectAvatar = (event: MouseEvent) => {
  event.preventDefault()
  avatarInputEl.value?.click()
}

const onAvatarSelected = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  avatar.value = file
  avatarUrl.value = URL.createObjectURL(file)
}

const fileToBase64 = (file: File) =>
  new Promise<string | undefined>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })

const updateProfile = async (event: Event) => {
  event.preventDefault()

  let av: { file: string; mime: string } | undefined = undefined

  if (avatar.value) {
    const compressedFile = await imageCompression(avatar.value, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
    })
    const avatarDataString = await fileToBase64(compressedFile)
    const avatarBase64 = avatarDataString?.split(',')[1]
    if (avatarBase64) {
      av = {
        file: avatarBase64,
        mime: avatar.value.type,
      }
    }
  }

  await client.user.update.mutate({
    username: username.value ?? undefined,
    avatar: av,
  })

  await fetchContext()
}

const { isLoading, mutate } = useMutation({
  mutationFn: updateProfile,
  onSuccess: () => {
    notify({
      title: t('notification.success_title'),
      message: t('user.edit_profile_success'),
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
  <div class="w-full h-full flex items-center justify-center p-8">
    <div class="w-full h-full flex items-center justify-center p-8">
      <input ref="avatarInputEl" type="file" class="hidden" accept="image/*" @input="onAvatarSelected" />
      <form class="w-full h-full grid place-items-center" @submit="mutate">
        <UiCard class="w-full max-w-100" :title="t('user.edit_profile_title')">
          <div class="flex justify-center">
            <div class="relative">
              <button type="button" class="rounded-full" @click="onSelectAvatar">
                <UiAvatar
                  class="w-30 h-30 hover:opacity-70 text-3xl"
                  :src="avatarUrl"
                  :fallback="claims?.username?.at(0)"
                ></UiAvatar>
              </button>
              <div class="absolute bottom-0 right-0 bg-primary rounded-full p-1.5">
                <div class="i-carbon-edit text-xl text-primary-foreground"></div>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <UiLabel for="username">{{ t('user.edit_username_label') }}</UiLabel>
            <UiInput id="username" v-model="username" :placeholder="t('user.edit_username_placeholder')" />
          </div>
          <template #footer>
            <UiButton class="w-full" :loading="isLoading">{{ t('user.edit_profile_submit') }}</UiButton>
          </template>
        </UiCard>
      </form>
    </div>
  </div>
</template>
