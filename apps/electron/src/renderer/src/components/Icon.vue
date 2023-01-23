<script setup lang="ts">
import * as icons from '@renderer/logic/ui/icons'
const props = defineProps<{
  icon: keyof typeof icons
}>()
</script>

<template>
  <component
    :is="icons[props.icon]"
    class="inline-block fill-current h-[1em] w-[1em]"
  />
</template>
