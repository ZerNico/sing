<script setup lang="ts">
import { loop } from '@renderer/logic/utils/math.utils'
import type { Ref } from 'vue'
import type * as icons from '@renderer/logic/ui/icons'
import type { GamepadButtonEvent } from '@renderer/composables/useGamepad'
import type Search from '@renderer/components/menu/songs/Search.vue'

const props = defineProps<{
  searchEl?: InstanceType<typeof Search>
}>()

const { modelValue } = defineModel<{
  modelValue: string
}>()

interface Key {
  readonly text: string
  readonly rowSpan?: number
  readonly action?: () => void
  readonly active?: Ref<boolean>
  readonly class?: string
  readonly icon?: keyof typeof icons
  readonly iconClass?: string
  readonly activeIcon?: keyof typeof icons
  readonly activeText?: string
  readonly keyHintIcon?: keyof typeof icons
}

const currRow = ref(0)
const currCol = ref(0)
const shift = ref(false)
const special = ref(false)

const backspace = () => {
  const input = props.searchEl?.getInputEl()
  if (!input) return
  const cursorPos = input.selectionStart
  if (cursorPos === null || cursorPos === 0) return
  modelValue.value = modelValue.value.slice(0, cursorPos - 1) + modelValue.value.slice(cursorPos)
  // set back cursor position on next tick
  nextTick(() => {
    input.selectionStart = cursorPos - 1
    input.selectionEnd = cursorPos - 1
  })
}

const moveCursor = (direction: -1 | 1) => {
  const input = props.searchEl?.getInputEl()
  if (!input) return
  const cursorPos = input.selectionStart
  if (cursorPos === null || cursorPos + direction < 0) return
  input.selectionStart = cursorPos + direction
  input.selectionEnd = cursorPos + direction

  nextTick(() => {
    scrollToSelectionStart(input)
  })
}

const write = (text: string) => {
  const input = props.searchEl?.getInputEl()
  if (!input) return
  const cursorPos = input.selectionStart
  if (cursorPos === null) return
  modelValue.value = modelValue.value.slice(0, cursorPos) + text + modelValue.value.slice(cursorPos)
  // set back cursor position on next tick
  nextTick(() => {
    input.selectionStart = cursorPos + text.length
    input.selectionEnd = cursorPos + text.length
    scrollToSelectionStart(input)
  })
}

// scroll input to center of cursor
const scrollToSelectionStart = (input: HTMLInputElement) => {
  const fontSize = window.getComputedStyle(input).fontSize
  const fontSizeNumber = parseFloat(fontSize)
  const charWidth = fontSizeNumber * 0.55
  if (input.selectionStart) {
    input.scrollLeft = input.selectionStart * charWidth - input.clientWidth / 2
  }
}

const blur = () => {
  const input = props.searchEl?.getInputEl()
  if (!input) return
  input.blur()
}

const normalKeys: Key[][] = [
  [{ text: '1' }, { text: '2' }, { text: '3' }, { text: '4' }, { text: '5' }, { text: '6' }, { text: '7' }, { text: '8' }, { text: '9' }, { text: '0' }],
  [{ text: 'q' }, { text: 'w' }, { text: 'e' }, { text: 'r' }, { text: 't' }, { text: 'y' }, { text: 'u' }, { text: 'i' }, { text: 'o' }, { text: 'p' }],
  [{ text: 'a' }, { text: 's' }, { text: 'd' }, { text: 'f' }, { text: 'g' }, { text: 'h' }, { text: 'j' }, { text: 'k' }, { text: 'l' }, { text: '"' }],
  [{ text: 'z' }, { text: 'x' }, { text: 'c' }, { text: 'v' }, { text: 'b' }, { text: 'n' }, { text: 'm' }, { text: '-' }, { text: '_' }, { text: '/' }],
]

const specialKeys: Key[][] = [
  [{ text: '@' }, { text: '#' }, { text: '€' }, { text: '_' }, { text: '&' }, { text: '-' }, { text: '+' }, { text: '(' }, { text: ')' }, { text: '/' }],
  [{ text: '*' }, { text: ':' }, { text: ';' }, { text: ',' }, { text: '.' }, { text: '?' }, { text: '!' }, { text: '\'' }, { text: '"' }, { text: '=' }],
  [{ text: 'ä' }, { text: 'ö' }, { text: 'ü' }, { text: 'ß' }, { text: '{' }, { text: '}' }, { text: '[' }, { text: ']' }, { text: '°' }, { text: '´' }],
  [{ text: '~' }, { text: 'æ' }, { text: '£' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }],
]

const actionKeys: Key[][] = [
  [
    { text: 'shft', active: shift, action: () => shift.value = !shift.value, rowSpan: 2, icon: 'Shift', activeIcon: 'ShiftPressed', iconClass: 'text-1.8cqw!', keyHintIcon: 'XboxLB' },
    { text: '@#', active: special, action: () => special.value = !special.value, activeText: 'Aa', rowSpan: 2, keyHintIcon: 'XboxRB' },
    { text: 'Space', rowSpan: 4, keyHintIcon: 'XboxY', action: () => write(' ') },
    { text: 'Backspace', rowSpan: 2, icon: 'Backspace', iconClass: 'text-1.8cqw!', keyHintIcon: 'XboxX', action: backspace },
  ],
  [
    { text: 'l', icon: 'TriangleArrow', iconClass: 'transform rotate-90', action: () => moveCursor(-1) },
    { text: 'r', icon: 'TriangleArrow', iconClass: 'transform rotate-270', action: () => moveCursor(1) },
    { text: '', rowSpan: 5 },
    { text: 'Done', rowSpan: 3, class: 'bg-#2ec468!', keyHintIcon: 'XboxMenu', action: blur },
  ],
]

const keys = computed(() => {
  const normalKeysWithShift = normalKeys.map(row => row.map(key => ({ ...key, text: shift.value ? key.text.toUpperCase() : key.text })))
  const specialKeysWithShift = specialKeys.map(row => row.map(key => ({ ...key, text: shift.value ? key.text.toUpperCase() : key.text })))

  // add green class to action keys
  const actionKeysWithClass = actionKeys.map(row => row.map(key => ({ class: 'bg-zinc-600!', ...key })))

  if (special.value) {
    return [...specialKeysWithShift, ...actionKeysWithClass]
  }
  return [...normalKeysWithShift, ...actionKeysWithClass]
})

const colToActualCol = (row: number, col: number) => {
  let actualCol = 0
  for (let i = 0; i < col; i++) {
    actualCol += keys.value[row][i].rowSpan ?? 1
  }

  const keyRowSpan = keys.value[row][col].rowSpan
  if (keyRowSpan && keyRowSpan > 2) {
    actualCol += Math.floor(keyRowSpan / 2)
  }

  return actualCol
}

const actualColToCol = (row: number, actualCol: number) => {
  let currActualCol = 0

  for (const [keyIndex, key] of keys.value[row].entries()) {
    currActualCol += key.rowSpan ?? 1
    if (currActualCol > actualCol) {
      return keyIndex
    }
  }

  return 0
}

const up = () => {
  const newRow = loop(currRow.value - 1, 0, keys.value.length - 1)
  const actualCol = colToActualCol(currRow.value, currCol.value)
  const newCol = actualColToCol(newRow, actualCol)
  currCol.value = newCol
  currRow.value = newRow
}

const down = () => {
  const newRow = loop(currRow.value + 1, 0, keys.value.length - 1)
  const actualCol = colToActualCol(currRow.value, currCol.value)
  const newCol = actualColToCol(newRow, actualCol)
  currCol.value = newCol
  currRow.value = newRow
}

const left = () => {
  currCol.value = loop(currCol.value - 1, 0, keys.value[currRow.value].length - 1)
}

const right = () => {
  currCol.value = loop(currCol.value + 1, 0, keys.value[currRow.value].length - 1)
}

const action = () => {
  const key = keys.value[currRow.value][currCol.value]
  if (key.action) {
    key.action()
  } else if (key.text) {
    write(key.text)
  }
}

const onButtonDown = (event: GamepadButtonEvent) => {
  if (event.button === 'DPAD_LEFT' || (event.button === 'L_AXIS_X' && event.direction < -0.5)) {
    left()
  }
  if (event.button === 'DPAD_RIGHT' || (event.button === 'L_AXIS_X' && event.direction > 0.5)) {
    right()
  }
  if (event.button === 'DPAD_UP' || (event.button === 'L_AXIS_Y' && event.direction < -0.5)) {
    up()
  }
  if (event.button === 'DPAD_DOWN' || (event.button === 'L_AXIS_Y' && event.direction > 0.5)) {
    down()
  }
  if (event.button === 'A') action()
  if (event.button === 'X') backspace()
  if (event.button === 'START' || event.button === 'B') blur()
  if (event.button === 'LB') shift.value = !shift.value
  if (event.button === 'RB') special.value = !special.value
  if (event.button === 'Y') write(' ')
  if (event.button === 'LT') moveCursor(-1)
  if (event.button === 'RT') moveCursor(1)
}

const onClick = (e: MouseEvent, row: number, col: number) => {
  const key = keys.value[row][col]
  if (key.action) {
    key.action()
  } else if (key.text) {
    write(key.text)
  }
  e.preventDefault()
  e.stopPropagation()
}

const { startLoop, stopLoop } = useGamepad(useRepeatThrottleFn(e => onButtonDown(e), 50))

onMounted(() => {
  startLoop()
})

onUnmounted(() => {
  stopLoop()
})
</script>

<template>
  <div class="bg-zinc-800 p-0.25cqw">
    <div v-for="row, rowIndex in keys" :key="rowIndex" class="flex">
      <div
        v-for="key, keyIndex in row"
        :key="keyIndex"
        class="w-3.5cqw h-3.5cqw text-1.2cqw text-white p-0.3cqw"
        :class="{
          'w-3.5cqw!': key.rowSpan === undefined,
          'w-7cqw!': key.rowSpan === 2,
          'w-10.5cqw!': key.rowSpan === 3,
          'w-14cqw!': key.rowSpan === 4,
          'w-17.5cqw!': key.rowSpan === 5,
        }"
      >
        <div
          role="button"
          class="bg-zinc-700 w-full h-full flex items-center justify-center outline-0.2cqh outline-offset--0.2cqh relative"
          :class="[key.class, currRow === rowIndex && currCol === keyIndex ? 'outline-white outline' : '']"
          @mouseenter="() => { currRow = rowIndex; currCol = keyIndex }"
          @mousedown="(e) => onClick(e, rowIndex, keyIndex)"
        >
          <Icon v-if="key.icon" :icon="key.active?.value === true && key.activeIcon ? key.activeIcon : key.icon" class="text-1cqw" :class="[key.iconClass]" />
          <span v-else>{{ key.active?.value === true && key.activeText ? key.activeText : key.text }}</span>
          <Icon v-if="key.keyHintIcon" :icon="key.keyHintIcon" class="absolute top-0 left-0 m-0.2cqw" />
        </div>
      </div>
    </div>
  </div>
</template>
