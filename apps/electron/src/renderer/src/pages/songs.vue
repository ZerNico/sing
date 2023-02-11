<script setup lang="ts">
import type { LocalSong } from '@renderer/logic/song/song'
import SongScroller from '@renderer/components/menu/songs/SongScroller.vue'
import SongPlayer from '@renderer/components/SongPlayer.vue'
import type { MenuNavigationEvent } from '@renderer/composables/useMenuNavigation'

const songsStore = useSongsStore()

const sortKey = ref('Title')
const searchText = ref('')

const onSongSelect = (song?: LocalSong) => {
  currentSong.value = song
  nextTick(() => {
    songPlayerEl.value?.play()
  })
}

const startRound = () => {
  console.log('start round')
}

const songScrollerEl = ref<InstanceType<typeof SongScroller>>()
const songPlayerEl = ref<InstanceType<typeof SongPlayer>>()

useMenuNavigation(useRepeatThrottleFn(e => onNavigate(e), 150))
const onNavigate = (event: MenuNavigationEvent) => {
  if (songScrollerEl.value) {
    if (event.action === 'up') songScrollerEl.value.prev(event.repeat)
    if (event.action === 'down') songScrollerEl.value.next(event.repeat)
  }
  if (currentSong.value) {
    if (event.action === 'confirm') {
      if (songPlayerEl.value) {
        songPlayerEl.value.play()
      }
    } else if (event.action === 'back') {
      if (songPlayerEl.value) {
        songPlayerEl.value.pause()
      }
    }
  }
}

const currentSong = ref<LocalSong>()
</script>

<template>
  <div class="w-full h-full flex items-center justify-center gradient-bg-secondary">
    <div class="layout relative">
      <div class="h-full w-full absolute">
        <SongPlayer ref="songPlayerEl" :song="currentSong" class="w-full h-full opacity-30" />
      </div>
      <div class="bg-white/80 h-full w-full absolute top-clip" />
      <div class="bg-white/80 h-full w-full absolute bottom-clip" />
      <div class="h-full w-full absolute top-0 left-0 flex items-center justify-end overflow-y-hidden pr-1/15 pointer-events-none">
        <SongScroller
          ref="songScrollerEl"
          :sort-key="sortKey"
          :songs="songsStore.getSongs"
          :search-text="searchText"
          @select-song="onSongSelect"
          @start-round="startRound"
        />
      </div>
      <div class="w-full h-full relative py-7cqh flex flex-col">
        <div class="px-5cqw">
          <TitleBar title="Songs" class="text-black!" />
        </div>
        <div class="flex-grow px-5cqw">
          <div v-if="currentSong" class="pt-14cqh">
            <div class="text-1.3cqw font-semibold max-w-1/4 text-black">
              {{ currentSong?.meta.artist }}
            </div>
            <div>
              <span
                class="font-bold bg-clip-text text-transparent gradient-title text-5.0cqw leading-tight"
              >
                {{ currentSong?.meta.title }}
              </span>
            </div>
          </div>
        </div>
        <div class="px-5cqw">
          <KeyHints :hints="['back', 'navigate', 'confirm']" class="text-white!" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-clip {
  clip-path: polygon(55% 0, 0 0, 0 55%);
}

.bottom-clip {
  clip-path: polygon(100% 35%, 100% 100%, 35% 100%);
}

.layout {
  height: 100%;
  width: 100%;
  container-type: size;
}

.gradient-title {
  background-image: linear-gradient(180deg, #11998e 0%, #38ef7d 100%);
}

@media (min-aspect-ratio: 21/9) {
  .layout {
    aspect-ratio: 21 / 9;
    height: 100%;
    width: auto;
  }
}

@media (max-aspect-ratio: 1/1) {
  .layout {
    aspect-ratio: 1 / 1;
    height: auto;
    width: 100%;
  }
}
</style>
