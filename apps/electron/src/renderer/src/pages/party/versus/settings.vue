<script setup lang="ts">
import type { MenuNavigationEvent } from '@renderer/composables/useMenuNavigation'
import { createMatchups } from '@renderer/logic/utils/matchup.utils'

const router = useRouter()
const versusStore = useVersusStore()
const { client } = useTRPC()

const back = () => {
  router.push('/party')
}

const start = async () => {
  const lobbyStatus = await client.lobby.status.query()
  if (lobbyStatus.lobby.users.length < 2) return
  const players = lobbyStatus.lobby.users
  const matchups = createMatchups(players)
  versusStore.players.push(...players)
  versusStore.matchups.push(...matchups)
  versusStore.scores.push(...players.map(player => ({ player, score: 0, rounds: 0, wins: 0 })))
  await router.push('/party/versus')
  versusStore.playing = true
}

const restart = () => {
  versusStore.matchups = []
  versusStore.scores = []
  versusStore.players = []
  start()
}

const resume = () => {
  router.push('/party/versus')
}

const buttons = computed(() => {
  const settingsButtons = [{
    type: 'range',
    label: 'Jokers',
    value: computed(() => versusStore.settings.jokers),
    setter: (value: number) => versusStore.settings.jokers = value,
    min: 0,
    max: 15,
    step: 1,
    clickStep: 1,
  }] as const

  const startButtons = [
    { type: 'button', label: 'Start', action: start },
  ] as const

  const resumeButtons = [
    { type: 'button', label: 'Resume', action: resume },
    { type: 'button', label: 'Restart', action: restart },
  ] as const

  if (versusStore.playing) return [...settingsButtons, ...resumeButtons]
  return [...settingsButtons, ...startButtons]
})

const maxPosition = computed(() => buttons.value.length - 1)
const { position, increment, decrement } = useLoop(maxPosition)

useMenuNavigation(useRepeatThrottleFn(e => onNavigate(e), 150))
const onNavigate = (event: MenuNavigationEvent) => {
  if (event.action === 'back') {
    router.back()
  } else if (event.action === 'confirm') {
    const button = buttons.value.at(position.value)
    if (button?.type === 'button') button.action()
  } else if (event.action === 'down') {
    increment()
  } else if (event.action === 'up') {
    decrement()
  } else if (event.action === 'right') {
    const next = buttonRefs.value.at(position.value)?.next
    if (next) next()
  } else if (event.action === 'left') {
    const prev = buttonRefs.value.at(position.value)?.prev
    if (prev) prev()
  }
}

const buttonRefs = ref<any[]>([])
const setRefs = (ref: any, index) => {
  buttonRefs.value[index] = ref
}

const select = useSoundEffect('select')
watch(position, () => select.play())

const confirm = useSoundEffect('confirm')

onBeforeUnmount(() => {
  confirm.play()
})

const gradient = { start: '#36D1DC', end: '#5B86E5' }
</script>

<template>
  <Layout class="gradient-bg-secondary" @back="back">
    <template #header>
      <TitleBar title="Versus" description="Settings" @back="back" />
    </template>
    <div>
      <template v-for="button, index in buttons">
        <RangeInput
          v-if="button.type === 'range'"
          :ref="(el) => setRefs(el, index)"
          :key="`range${button.label}`"
          :model-value="button.value.value"
          :active="index === position"
          :label="button.label"
          :gradient="gradient"
          :min="button.min"
          :max="button.max"
          :step="button.step"
          :click-step="button.clickStep"
          class="w-full"
          @update:model-value="button.setter"
          @mouseenter="position = index"
        />
        <WideButton
          v-else-if="button.type === 'button'"
          :ref="(el) => setRefs(el, index)"
          :key="`button${button.label}`"
          :label="button.label"
          :gradient="gradient"
          :active="index === position"
          class="w-full"
          @click="button.action"
          @mouseenter="position = index"
        />
      </template>
    </div>
    <template #footer>
      <KeyHints :hints="['back', 'navigate', 'confirm']" />
    </template>
  </Layout>
</template>
