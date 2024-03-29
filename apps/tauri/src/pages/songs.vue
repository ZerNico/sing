<script setup lang="ts">
import type { LocalSong } from '~/logic/song/song'
import SongScroller from '~/components/menu/songs/SongScroller.vue'
import SongPlayer from '~/components/SongPlayer.vue'
import Search from '~/components/menu/songs/Search.vue'
import type { MenuNavigationEvent } from '~/composables/useMenuNavigation'
import { songsSearchText, songsSortKey } from '~/logic/ui/pageStates'
import { loop } from '~/logic/utils/math.utils'
import { keyMode } from '~/logic/ui/keys'
import type { ClientRouterOutput } from '~/composables/useTRPC'

const settingsStore = useSettingsStore()
const songsStore = useSongsStore()
const roundStore = useRoundStore()
const lobbyStore = useLobbyStore()
const router = useRouter()
const { client } = useTRPC()

const currentSong = ref<LocalSong>()
const searchFocused = ref(false)

const songScrollerEl = ref<InstanceType<typeof SongScroller>>()
const songPlayerEl = ref<InstanceType<typeof SongPlayer>>()
const searchEl = ref<InstanceType<typeof Search>>()

const back = () => {
  router.push({ name: '/home' })
}

const highscores = ref<ClientRouterOutput['highscore']['get']['highscores']>()

const onSongSelect = (song?: LocalSong) => {
  if (song === currentSong.value) return
  highscores.value = undefined
  if (!song) {
    currentSong.value = undefined
    return
  }

  currentSong.value = song
  nextTick(() => {
    songPlayerEl.value?.play()
  })
  // check if song is the same after 1 second
  setTimeout(async () => {
    if (currentSong.value !== song || lobbyStore.offline) return
    const scores = await client.highscore.get.query({ hash: song.meta.hash })
    // check if song is the same after async call
    if (currentSong.value !== song) return

    highscores.value = scores.highscores
  }, 1000)
}

const startRound = () => {
  roundStore.song = currentSong.value
  roundStore.type = 'sing'
  router.push({ name: '/round/selection' })
}

useMenuNavigation(useRepeatThrottleFn((e) => onNavigate(e), 150))
const onNavigate = (event: MenuNavigationEvent) => {
  if (!searchFocused.value) {
    if (event.action === 'search') searchEl.value?.focus()
    else if (event.action === 'up') songScrollerEl.value?.prev(event.repeat)
    else if (event.action === 'down') songScrollerEl.value?.next(event.repeat)
    else if (event.action === 'back') back()
    else if (event.action === 'sortleft') switchSortKey(-1)
    else if (event.action === 'sortright') switchSortKey(1)
    else if (event.action === 'confirm') startRound()
    else if (event.action === 'random') selectRandomSong()
  } else {
    if (event.origin === 'keyboard') {
      if (
        (event.action === 'confirm' && event.originalKey !== ' ') ||
        event.action === 'search' ||
        (event.action === 'back' && event.originalKey !== 'Backspace')
      )
        searchEl.value?.blur()
      else if (event.action === 'random') selectRandomSong()
    }
  }
}

const onWheel = (e: WheelEvent) => {
  if (songScrollerEl.value) {
    if (e.deltaY > 0) {
      songScrollerEl.value.next(false)
    } else if (e.deltaY < 0) {
      songScrollerEl.value.prev(false)
    }
  }
}

const sortKeys = ['Artist', 'Title', 'Year'] as const
const switchSortKey = (direction: -1 | 1) => {
  const index = sortKeys.indexOf(songsSortKey.value)
  const nextIndex = loop(index + direction, 0, sortKeys.length - 1)
  songsSortKey.value = sortKeys.at(nextIndex) ?? 'Artist'
}

const selectRandomSong = () => {
  songScrollerEl.value?.selectRandomSong()
}

const select = useSoundEffect('select')
watch(songsSortKey, () => select.play())

const confirm = useSoundEffect('confirm')

onBeforeUnmount(() => {
  confirm.play()
})

const volume = computed(() => {
  const volume = settingsStore.getPreviewVolume / 100
  return volume
})
</script>

<template>
  <Layout class="gradient-bg-secondary" @back="back" @wheel="onWheel">
    <template #background>
      <div class="relative w-full h-full">
        <div class="h-full w-full absolute">
          <SongPlayer ref="songPlayerEl" :volume="volume" :song="currentSong" class="w-full h-full opacity-30" />
        </div>
        <div class="bg-white/80 h-full w-full absolute top-clip" />
        <div class="bg-white/80 h-full w-full absolute bottom-clip" />
        <div v-if="keyMode === 'gamepad' && searchFocused" class="absolute bottom-0 pl-5cqw pb-15cqh z-2">
          <VirtualKeyboard v-model="songsSearchText" :search-el="searchEl" />
        </div>
        <div
          class="h-full w-full absolute flex items-center justify-end overflow-y-hidden pr-1/15 pointer-events-none z-3"
        >
          <SongScroller
            ref="songScrollerEl"
            :sort-key="songsSortKey"
            :songs="songsStore.getSongs"
            :search-text="songsSearchText"
            @select-song="onSongSelect"
            @start-round="startRound"
          />
        </div>
      </div>
    </template>
    <template #header>
      <div class="flex gap-5cqw items-center">
        <TitleBar title="Songs" class="text-black!" @back="back" />
        <Search
          ref="searchEl"
          v-model="songsSearchText"
          class="w-15cqw"
          @focusin="searchFocused = true"
          @focusout="searchFocused = false"
        />
      </div>
    </template>
    <div class="h-full flex flex-col">
      <div v-if="currentSong" class="pt-9cqh">
        <div class="flex pb-1.3cqh">
          <Icon icon="Duet" class="text-1.5cqw" :class="{ 'opacity-0': !currentSong.isDuet() }" />
        </div>
        <div class="text-1.3cqw font-semibold max-w-20cqw text-black">
          {{ currentSong?.meta.artist }}
        </div>
        <div class="max-w-65cqw">
          <span class="font-bold bg-clip-text text-transparent gradient-title text-5.0cqw leading-tight">
            {{ currentSong?.meta.title }}
          </span>
        </div>
      </div>
      <div class="flex-grow flex items-center">
        <Highscore :highscores="highscores" :max="5" />
      </div>
    </div>
    <template #footer>
      <div class="flex justify-between pr-21cqw select-none w-full">
        <KeyHints :hints="['back', 'navigate', 'confirm', 'random']" class="text-white!" />

        <div class="flex items-center mr-1.2cqw text-black">
          <Icon icon="Dice" class="text-2cqw mr-2cqw cursor-pointer" @click="selectRandomSong" />
          <Icon
            icon="TriangleArrow"
            class="rotate-90 transform text-1.1cqw cursor-pointer"
            @click="() => switchSortKey(-1)"
          />
          <Icon
            :icon="keyMode === 'keyboard' ? 'KeyPageUp' : 'XboxLB'"
            class="text-1.2cqw ml-0.4cqw mr-0.4cqw cursor-pointer"
            @click="() => switchSortKey(-1)"
          />
          <Icon icon="Minus" class="text-0.7cqw" />
          <Icon
            :icon="keyMode === 'keyboard' ? 'KeyPageDown' : 'XboxRB'"
            class="text-1.2cqw ml-0.4cqw mr-0.4cqw cursor-pointer"
            @click="() => switchSortKey(1)"
          />
          <Icon
            icon="TriangleArrow"
            class="rotate-270 transform text-1.1cqw cursor-pointer"
            @click="() => switchSortKey(1)"
          />
          <div class="flex pl-1cqw">
            <div
              v-for="sortKey in sortKeys"
              :key="sortKey"
              role="button"
              class="px-0.7cqw pt-0.3cqw pb-0.4cqw rounded-full text-0.9cqw cursor-pointer"
              :class="[songsSortKey === sortKey ? 'bg-#2ec468 text-white' : 'text-black']"
              @click="songsSortKey = sortKey"
            >
              {{ sortKey }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </Layout>
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
