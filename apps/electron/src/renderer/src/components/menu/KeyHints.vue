<script setup lang="ts">
import { keyMode } from '@renderer/logic/ui/keys'
import type * as icons from '@renderer/logic/ui/icons'
type hintType = 'navigate' | 'confirm' | 'back' | 'random'
const props = defineProps<{ hints: hintType[] }>()

const hints = computed((): { icon: keyof typeof icons; text: string; size: string }[] => {
  return props.hints.map((hint) => {
    if (keyMode.value === 'keyboard') {
      if (hint === 'navigate') {
        return {
          icon: 'KeyArrows',
          text: 'Navigate',
          size: 'text-1.7cqw',
        }
      } else if (hint === 'confirm') {
        return {
          icon: 'KeyEnter',
          text: 'Confirm',
          size: 'text-1.3cqw',
        }
      } else if (hint === 'back') {
        return {
          icon: 'KeyEscape',
          text: 'Back',
          size: 'text-1.5cqw',
        }
      }
    } else if (keyMode.value === 'gamepad') {
      if (hint === 'navigate') {
        return {
          icon: 'XboxCross',
          text: 'Navigate',
          size: 'text-1.4cqw',
        }
      } else if (hint === 'confirm') {
        return {
          icon: 'XboxA',
          text: 'Confirm',
          size: 'text-1.3cqw',
        }
      } else if (hint === 'back') {
        return {
          icon: 'XboxB',
          text: 'Back',
          size: 'text-1.3cqw',
        }
      }
    }

    // should never happen
    return {
      icon: 'Spinner',
      text: '',
      size: 'text-1cqw',
    }
  })
})
</script>

<template>
  <div class="flex text-neutral-400 gap-1.2cqw">
    <div v-for="hint in hints" :key="hint.text" class="flex items-center gap-0.5cqw">
      <Icon :icon="hint.icon" :class="[hint.size]" />
      <div class="text-1.2cqw">
        {{ hint.text }}
      </div>
    </div>
  </div>
</template>
