<script setup lang="ts">
import { keyMode } from '~/lib/ui/keys'

type HintType = 'navigate' | 'confirm' | 'back'
const props = defineProps<{
  hints: HintType[]
}>()

const { t } = useI18n()

const keyboardHintMap = new Map<HintType, { text: string; class: string }>([
  ['navigate', { text: t('key_hint.navigate'), class: 'i-sing-key-arrows text-1.5cqw' }],
  ['confirm', { text: t('key_hint.confirm'), class: 'i-sing-key-enter' }],
  ['back', { text: t('key_hint.back'), class: 'i-sing-key-escape text-1.4cqw' }],
])

const gamepadHintMap = new Map<HintType, { text: string; class: string }>([
  ['navigate', { text: t('key_hint.navigate'), class: 'i-sing-xbox-cross' }],
  ['confirm', { text: t('key_hint.confirm'), class: 'i-sing-xbox-a' }],
  ['back', { text: t('key_hint.back'), class: 'i-sing-xbox-b' }],
])

const hints = computed(() => {
  return props.hints.map((hint) => {
    return keyMode.value === 'keyboard' ? keyboardHintMap.get(hint) : gamepadHintMap.get(hint)
  })
})
</script>

<template>
  <div class="flex gap-1.2cqw text-1.2cqw text-neutral-400">
    <div v-for="hint in hints" :key="hint.text" class="flex items-center gap-0.5cqw">
      <div :class="hint.class"></div>
      <div>
        {{ hint.text }}
      </div>
    </div>
  </div>
</template>
