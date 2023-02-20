<script setup lang="ts">
import { songsScrollPosition } from '@renderer/logic/ui/pageStates'
import Fuse from 'fuse.js'
import type { Ref } from 'vue'

import type { LocalSong } from '@renderer/logic/song/song'

const props = defineProps<{
  songs: LocalSong[]
  sortKey: string
  searchText: string
}>()

const emit = defineEmits<{
  (e: 'selectSong', song?: LocalSong): void
  (e: 'startRound'): void
}>()

const position = songsScrollPosition
const fuse = new Fuse<LocalSong>([], {
  keys: ['meta.title', 'meta.artist'],
  threshold: 0.2,
  shouldSort: false,
})
const songs = ref([]) as Ref<SongWithData[]>

// aditional data needed for displaying songs
interface SongWithData {
  song: LocalSong
  key: string
  sortTag?: string
}

const sortedSongs = ref([]) as Ref<LocalSong[]>

watch(
  () => props.sortKey,
  (sortKey) => {
    if (props.songs.length === 0) {
      sortedSongs.value = []
      return
    }

    const currentSong = songs.value?.at(position.value)

    const sorted = [...props.songs].sort((a, b) => {
      if (sortKey === 'Title') {
        return a.meta.title.localeCompare(b.meta.title)
      } else if (sortKey === 'Artist') {
        return a.meta.artist.localeCompare(b.meta.artist)
      } else if (sortKey === 'Year') {
        if (a.meta.year === undefined) {
          return -1
        } else if (b.meta.year === undefined) {
          return 1
        } else {
          return a.meta.year - b.meta.year
        }
      }
      return 0
    })

    sortedSongs.value = sorted

    nextTick(() => {
      if (currentSong) {
        const index = songs.value.findIndex(
          song => song.key === currentSong?.key,
        )

        position.value = index
      }
    })
  },
  { immediate: true },
)

const searchedSongs = computed(() => {
  if (sortedSongs.value.length === 0) {
    return []
  }

  nextTick(() => {
    emit('selectSong', songs.value.at(position.value)?.song)
  })

  if (props.searchText.length === 0) {
    return sortedSongs.value
  }

  fuse.setCollection(sortedSongs.value)
  const result = fuse.search(props.searchText)

  return result.map(item => item.item)
})

const taggedSongs = computed(() => {
  if (searchedSongs.value.length === 0) {
    return []
  }
  let lastSortTag: string
  const songsWithData: SongWithData[] = searchedSongs.value.map((song) => {
    let sortTag = ''
    if (props.sortKey === 'Title') {
      sortTag = song.meta.title.substring(0, 1).toUpperCase()
    } else if (props.sortKey === 'Artist') {
      sortTag = song.meta.artist.substring(0, 1).toUpperCase()
    } else if (props.sortKey === 'Year') {
      sortTag = !song.meta.year ? '-' : song.meta.year.toString()
    }

    // Only display sort tag on first occurrence
    const songWithData = {
      song,
      key: song.meta.hash,
      sortTag: sortTag !== lastSortTag ? sortTag : undefined,
    }
    lastSortTag = sortTag
    return songWithData
  })

  return songsWithData
})

watch(
  taggedSongs,
  (newTaggedSongs) => {
    if (newTaggedSongs.length === 0) {
      songs.value = []
      return
    }
    // prevent songs with duplicate keys
    if (newTaggedSongs.length <= 7) {
      let index = 0
      const songsWithUniqueKey: SongWithData[] = []

      while (songsWithUniqueKey.length < 7) {
        newTaggedSongs.forEach((song) => {
          songsWithUniqueKey.push({
            song: song.song,
            key: `${song.key}-${index}`,
            sortTag: song.sortTag,
          })
        })
        index++
      }
      songs.value = songsWithUniqueKey
      return
    }

    songs.value = newTaggedSongs
  },
  { immediate: true },
)

const displayedSongs = computed((): SongWithData[] => {
  if (songs.value.length === 0) {
    return []
  }

  const songsAround: SongWithData[] = []
  for (let i = position.value - 3; i <= position.value + 3; i++) {
    const index = i % songs.value.length
    const song = songs.value.at(index)
    if (song) songsAround.push(song)
  }

  return songsAround
})

// Song switching
const lastAnimation = ref<Date>()
const animating = ref(false)
const direction = ref(0)

// scroll faster on holding
const fastScrolling = ref(false)
const lastFastScrollInput = ref<Date>()

const prev = (fast: boolean) => {
  handlePositionChange(-1, fast)
}

const next = (fast: boolean) => {
  handlePositionChange(1, fast)
}

const setFastScrolling = () => {
  if (!lastFastScrollInput.value) {
    fastScrolling.value = false
  } else {
    fastScrolling.value
      = Date.now() - lastFastScrollInput.value.getTime() < 200
  }
}

const handlePositionChange = (delta: number, fast: boolean) => {
  if (fast) {
    lastFastScrollInput.value = new Date()
  }

  if (animating.value) return
  if (lastAnimation.value && Date.now() - lastAnimation.value.getTime() < 10)
    return
  setFastScrolling()
  animating.value = true
  direction.value = delta
}

// Reset translate and update displayed songs
const onTransitionEnd = () => {
  position.value = (position.value + direction.value) % songs.value.length
  animating.value = false
  lastAnimation.value = new Date()
  setFastScrolling()
  if (fastScrolling.value) {
    setTimeout(() => {
      animating.value = true
    }, 10)
  } else {
    direction.value = 0
    emit('selectSong', songs.value.at(position.value)?.song)
  }
}

const onClick = (index: number) => {
  if (index === 3) {
    emit('startRound')
  }
}

const selectingRandomSong = ref(false)

const selectRandomSong = () => {
  if (songs.value.length === 0) return
  selectingRandomSong.value = true

  const randomIndex = Math.floor(Math.random() * songs.value.length)
  position.value = randomIndex
  emit('selectSong', songs.value.at(position.value)?.song)
  setTimeout(() => {
    selectingRandomSong.value = false
  }, 10)
}

emit('selectSong', songs.value.at(position.value)?.song)

defineExpose({ next, prev, selectRandomSong })
</script>

<template>
  <div class="flex items-center">
    <div
      class="transform-gpu flex flex-col items-end h-full"
      :class="{
        'ease-linear': fastScrolling,
        'translate-up transition-transform duration-250':
          animating && direction === 1,
        'translate-down transition-transform duration-250':
          animating && direction === -1,
        '!duration-150': fastScrolling && animating && direction !== 0,
      }"
      @transitionend="onTransitionEnd"
    >
      <div
        v-for="(song, i) in displayedSongs"
        :key="song.key"
        class="h-1/7 text-center flex items-center justify-center card"
        :class="{
          'active-card':
            (i === 3 && !animating)
            || (i === 4 && animating && direction === 1)
            || (i === 2 && animating && direction === -1),
          '!duration-150': fastScrolling,
          'pointer-events-auto cursor-pointer': i === 3,
          'transition-all duration-250': !selectingRandomSong,
        }"
        @transitionend="(e) => e.stopPropagation()"
        @click="() => onClick(i)"
      >
        <SongCard
          :disable-animation="selectingRandomSong"
          :active="i === 3 && !animating && !fastScrolling"
          :song="song.song"
          :sort-tag="song.sortTag"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.translate-up {
  transform: translateY(calc(-13.66667%));
}

.translate-down {
  transform: translateY(calc(13.66667%));
}

.card {
  height: calc(100cqh / 5);
}

.active-card {
  height: calc(100cqh / 5 * 1.3);
}
</style>
