<script setup lang="ts">
import { open } from '@tauri-apps/api/dialog'
import { BaseDirectory, readDir } from '@tauri-apps/api/fs'

const test = async () => {
  const path = await open({ directory: true, recursive: true })
  console.log(path)
  if (!path) return
  // check if path is array
  if (Array.isArray(path)) {
    console.log('is array')
    return
  }

  const entries = await readDir(path, { recursive: true })
  console.log(entries)
}
</script>

<template>
  <div class="text-black" @click="test">
    123
  </div>
</template>
