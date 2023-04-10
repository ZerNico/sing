<script setup lang="ts">
import type { ClientRouterOutput } from '~/composables/useTRPC'

const props = withDefaults(defineProps<{
  highscores?: ClientRouterOutput['highscore']['get']['highscores']
  max: number
}>(), {
  max: 5,
})
</script>

<template>
  <div class="flex flex-col gap-0.6cqw" :class="[!highscores || highscores.length === 0 ? 'opacity-0' : 'transition-opacity duration-300']">
    <div
      v-for="highscore, index in props.highscores?.slice(0, props.max)"
      :key="highscore.userId + highscore.hash"
      class="bg-black/30 rounded-full flex gap-0.5cqw text-1.1cqw overflow-hidden"
    >
      <div class="w-2.5cqw pl-0.2cqw text-center bg-white/80 text-black font-semibold flex items-center justify-center" :class="{ 'bg-yellow-400': index === 0 }">
        {{ index + 1 }}.
      </div>
      <div class="flex w-16cqw gap-0.4cqw items-center py-0.1cqw">
        <Avatar :src="highscore.user.picture || undefined" :username="highscore.user.username" />
        <div class="truncate text-ellipsis max-w-full min-w-0">
          {{ highscore.user.username }}
        </div>
      </div>

      <div class="px-1cqw w-6cqw flex items-center justify-end">
        {{ highscore.score }}
      </div>
    </div>
  </div>
</template>
