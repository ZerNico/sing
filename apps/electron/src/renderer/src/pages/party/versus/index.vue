<script setup lang="ts">
import SongPlayer from '@renderer/components/SongPlayer.vue'
import placeholder from '@renderer/assets/images/cover-placeholder.png?url'
import { keyMode } from '@renderer/logic/ui/keys'
import type { MenuNavigationEvent } from '@renderer/composables/useMenuNavigation'
import { createMatchups } from '@renderer/logic/utils/matchup.utils'

const versusStore = useVersusStore()
const songsStore = useSongsStore()
const settingsStore = useSettingsStore()
const roundStore = useRoundStore()
const router = useRouter()

const songPlayerEl = ref<InstanceType<typeof SongPlayer>>()

const microphone1 = computed(() => {
  return settingsStore.microphones.at(0)
})
const microphone2 = computed(() => {
  return settingsStore.microphones.at(1)
})

// filter out duets
const songs = computed(() => {
  return songsStore.getSongs.filter(song => !song.isDuet())
})
const songIndex = ref(Math.round(Math.random() * songs.value.length))
const song = computed(() => songs.value.at(songIndex.value)!)
const matchup = computed(() => versusStore.matchups.at(0))

const coverError = ref(false)

const coverUrl = computed(() => {
  if (song.value && !coverError.value && song.value.urls.cover) {
    return song.value.urls.cover
  }
  return placeholder
})

watch(song, () => {
  coverError.value = false
  nextTick(() => {
    songPlayerEl.value?.play()
  })
}, { immediate: true })

const newSong = () => {
  // search for a new song that is not the same as the current one for 10 times max
  for (let i = 0; i < 10; i++) {
    const newIndex = Math.round(Math.random() * songs.value.length)
    if (newIndex !== songIndex.value) {
      songIndex.value = newIndex
      return
    }
  }
}

const jokerCount = versusStore.settings.jokers
const p1Jokers = ref(jokerCount)
const p2Jokers = ref(jokerCount)

const useJoker = (player: 1 | 2) => {
  if (player === 1) {
    if (p1Jokers.value === 0) return
    select.play()
    p1Jokers.value--
    newSong()
  } else {
    if (p2Jokers.value === 0) return
    select.play()
    p2Jokers.value--
    newSong()
  }
}

const volume = computed(() => {
  const volume = settingsStore.getPreviewVolume / 100
  return volume
})

const back = () => {
  confirm.play()
  router.push({ name: '/party/versus/settings' })
}

const startRound = () => {
  if (!matchup.value) return
  roundStore.type = 'versus'
  roundStore.song = song.value
  roundStore.player1 = matchup.value.player1
  roundStore.player2 = matchup.value.player2
  router.push({ name: '/round/sing' })
}

useMenuNavigation(useRepeatThrottleFn(e => onNavigate(e), 150))
const onNavigate = (event: MenuNavigationEvent) => {
  if (event.action === 'back') {
    back()
  }
  if (matchup.value) {
    if (event.action === 'confirm') {
      startRound()
    } else if (event.action === 'joker1') {
      useJoker(1)
    } else if (event.action === 'joker2') {
      useJoker(2)
    }
  } else {
    if (event.action === 'confirm') {
      continueRounds()
    }
  }
}

const continueRounds = () => {
  select.play()
  const matchups = createMatchups(versusStore.players)
  versusStore.matchups.push(...matchups)
}

const winnerText = computed(() => {
  // get all the players with the lowest position
  const lowestPosition = Math.min(...versusStore.getScores.map(score => score.position))
  const lowestScores = versusStore.getScores.filter(score => score.position === lowestPosition)
  return lowestScores.map(score => score.player.username).join(' & ')
})

const select = useSoundEffect('select')
const confirm = useSoundEffect('confirm')
</script>

<template>
  <Layout class="gradient-bg-secondary" @back="back">
    <template #background>
      <SongPlayer ref="songPlayerEl" :volume="volume" :song="song" class="w-full h-full opacity-30" @error="newSong" />
    </template>
    <template #header>
      <TitleBar title="Versus" class="text-white!" @back="back" />
    </template>
    <div class="flex-grow flex relative">
      <div class="flex-grow flex flex-col items-center justify-center gap-0.3cqw">
        <div
          v-for="score in versusStore.getScores"
          :key="score.player.id"
          class="bg-black/30 rounded-full flex overflow-hidden items-center gap-0.5cqw h-1.5cqw text-0.8cqw"
        >
          <div class="w-1.8cqw h-1.5cqw bg-white/80 text-black font-semibold pl-0.1cqw flex items-center justify-center" :class="{ 'bg-yellow-400': score.position === 1 }">
            {{ score.position }}.
          </div>
          <div class="flex items-center gap-0.3cqw">
            <Avatar :src="score.player.picture || undefined" :username="score.player.username" class="h-1.3cqw! w-1.3cqw! text-0.7cqw!" />
            <div class="w-10cqw truncate">
              {{ score.player.username }}
            </div>
          </div>
          <div class="w-3cqw text-end">
            {{ score.wins }}/{{ score.rounds }}
          </div>
          <div class="w-3.5cqw text-end pr-0.5cqw">
            {{ score.score }}
          </div>
        </div>
      </div>
      <div class="w-65cqw">
        <div v-if="matchup" class="flex flex-col gap-1cqw">
          <div class="flex flex-col items-center">
            <div class="text-1.3cqw font-semibold max-w-55cqw truncate">
              {{ song.meta.artist }}
            </div>
            <div
              class="font-bold bg-clip-text text-transparent gradient-title text-3.5cqw truncate max-w-55cqw -mt-0.8cqw"
            >
              {{ song.meta.title }}
            </div>
          </div>
          <div class="flex items-center justify-center gap-1cqw">
            <div>
              <div class="text-end opacity-0">
                <Icon :icon="keyMode === 'keyboard' ? 'Key1' : 'XboxLB'" :class="[keyMode === 'keyboard' ? 'text-1.1cqw mt-0.2cqw' : 'text-1.5cqw']" />
              </div>
              <div class="bg-black rounded-0.45cqw overflow-hidden">
                <div class="flex items-center card1 gap-0.5cqw p-0.5cqw">
                  <Avatar :src="matchup.player1.picture || undefined" :username="matchup.player1.username" />
                  <div class="text-1cqw font-semibold w-13cqw truncate">
                    {{ matchup.player1.username }}
                  </div>
                  <div class="flex justify-end items-center min-w-4cqw select-none" role="button" @click="() => useJoker(1)">
                    <Icon icon="Dice" class="text-2cqw" />
                    <div class="text-1.5cqw font-semibold">
                      {{ p1Jokers }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="text-end">
                <Icon :icon="keyMode === 'keyboard' ? 'Key1' : 'XboxLB'" :class="[keyMode === 'keyboard' ? 'text-1.1cqw mt-0.2cqw' : 'text-1.5cqw']" />
              </div>
            </div>
            <img
              role="button"
              :src="coverUrl"
              class="w-10cqw h-10cqw outline outline-0.2cqw"
              @error="coverError = true"
              @click="startRound"
            >
            <div>
              <div class="opacity-0">
                <Icon :icon="keyMode === 'keyboard' ? 'Key2' : 'XboxRB'" :class="[keyMode === 'keyboard' ? 'text-1.1cqw mt-0.2cqw' : 'text-1.5cqw']" />
              </div>
              <div class="bg-black rounded-0.45cqw overflow-hidden">
                <div class="flex items-center card2 gap-0.5cqw p-0.5cqw">
                  <div class="flex justify-start items-center min-w-4cqw select-none gap-0.2cqw" role="button" @click="() => useJoker(2)">
                    <div class="text-1.5cqw font-semibold">
                      {{ p2Jokers }}
                    </div>
                    <Icon icon="Dice" class="text-2cqw" />
                  </div>
                  <div class="text-1cqw font-semibold w-13cqw truncate text-end">
                    {{ matchup.player2.username }}
                  </div>
                  <Avatar :src="matchup.player2.picture || undefined" :username="matchup.player2.username" />
                </div>
              </div>
              <div>
                <Icon :icon="keyMode === 'keyboard' ? 'Key2' : 'XboxRB'" :class="[keyMode === 'keyboard' ? 'text-1.1cqw mt-0.2cqw' : 'text-1.5cqw']" />
              </div>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col items-center gap-10cqh">
          <div class="max-w-50cqw text-center">
            <span class="font-bold bg-clip-text text-transparent gradient-title text-3.5cqw">{{ winnerText }} won!</span>
          </div>
          <div class="w-full rounded-0.45cqw overflow-hidden">
            <WideButton :gradient="{ start: '#36D1DC', end: '#5B86E5' }" label="Continue" :active="true" @click="continueRounds" />
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <KeyHints :hints="['back', 'confirm']" class="text-white!" />
    </template>
  </Layout>
</template>

<style scoped>
.card1 {
  background: linear-gradient(180deg,  v-bind('`${microphone1?.color}`') 0%,  v-bind('`${microphone1?.color}B0`') 100%);
}

.card2 {
  background: linear-gradient(180deg,  v-bind('`${microphone2?.color}`') 0%,  v-bind('`${microphone2?.color}B0`') 100%);
}

.gradient-title {
  background-image: linear-gradient(180deg, #7420FB 0%, #CF56E3 100%);
}
</style>
