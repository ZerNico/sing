<script setup lang="ts">
const router = useRouter()
const settingsStore = useSettingsStore()
const select = useSoundEffect('select')
const confirm = useSoundEffect('confirm')
const { t } = useI18n()
const { client } = useRSPC()
const route = useRoute('/settings/microphones/[id]')

const back = () => {
  router.push({ name: '/settings/microphones/' })
}

const id = computed(() => {
  return Number.parseInt(route.params.id)
})

const { state, isLoading } = useAsyncState(client.query(['microphones']), [])

const name = ref('')

watch(
  id,
  (newId) => {
    const microphone = settingsStore.microphones.at(newId)

    if (!microphone) return
    name.value = microphone.name
  },
  { immediate: true }
)

watch(state, (newState) => {
  const firstMic = newState.at(0)
  if (!firstMic) return
  if (name.value === '') {
    name.value = firstMic.name
  }
})

const micValues = computed(() => {
  return state.value.map((mic) => mic.name)
})

const buttons = [{ type: 'list', label: t('settings.microphones.microphone'), values: micValues, value: name }] as const

const { position, increment, decrement } = useLoop(buttons.length - 1)

useMenuNavigation((e) => {
  if (e.action === 'confirm') {
    //213
  } else if (e.action === 'down') {
    increment()
  } else if (e.action === 'up') {
    decrement()
  } else if (e.action === 'back') {
    back()
  }
})

watch(position, () => select.play())

onBeforeUnmount(() => {
  confirm.play()
})
</script>

<template>
  <Layout class="gradient-bg-secondary" @back="back">
    <template #header>
      <TitleBar :title="t('settings.title')" :description="t('settings.microphones.title')" @back="back" />
    </template>
    <div class="flex flex-col items-center justify-center gap-1cqw">
      <div v-if="isLoading" class="i-sing-spinner block animate-spin text-5cqw" />
      <template v-for="(button, index) in buttons" v-else :key="button.label">
        <WideSelect
          v-slot="slotProps"
          v-model="button.value.value"
          class="w-full from-settings-start to-settings-end"
          :active="index === position"
          :values="button.values.value"
          :label="button.label"
        >
          {{ slotProps.value }}
        </WideSelect>
      </template>
    </div>
    <template #footer>
      <KeyHints :hints="['back', 'navigate', 'confirm']" />
    </template>
  </Layout>
</template>

<style scoped></style>
