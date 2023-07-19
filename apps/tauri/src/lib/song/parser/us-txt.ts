import { Md5 } from 'ts-md5'

import { Note, NoteType } from '../note'
import { Sentence } from '../sentence'
import { FileUrls, Meta } from '../song'
import { Voice } from '../voice'
import { ParseError } from './error'

export const parseUSTxt = (txt: string) => {
  try {
    const meta: Partial<Meta> = {
      relative: false,
    }
    const fileNames: Partial<FileUrls> = {}

    let nextAppearBeat
    let notes: Note[] = []
    let sentences: Sentence[] = []
    const voices: Voice[] = []
    const md5 = new Md5()

    // split the text into lines
    const lines: string[] = txt.split(/\r?\n/)

    for (const [index, line] of lines.entries()) {
      if (line.trim() === '') continue
      const lineNumber = index + 1

      if (line.startsWith('#')) {
        const [property, v]: string[] = line.slice(1).trim().split(':')
        if (!property || !v) continue

        const value = v.trim()

        switch (property.toLocaleLowerCase()) {
          case 'title': {
            meta.title = value
            break
          }
          case 'artist': {
            meta.artist = value
            break
          }
          case 'language': {
            meta.language = value
            break
          }
          case 'edition': {
            meta.edition = value
            break
          }
          case 'genre': {
            meta.genre = value
            break
          }
          case 'year': {
            meta.year = parseUSInt(value, lineNumber)
            break
          }
          case 'bpm': {
            meta.bpm = parseUSFloat(value, lineNumber)
            break
          }
          case 'gap': {
            meta.gap = parseUSFloat(value, lineNumber)
            break
          }
          case 'mp3': {
            fileNames.audio = value
            break
          }
          case 'cover': {
            fileNames.cover = value
            break
          }
          case 'video': {
            fileNames.video = value
            break
          }
          case 'background': {
            fileNames.background = value
            break
          }
          case 'relative': {
            meta.relative = parseUsBool(value)
            break
          }
          case 'videogap': {
            meta.videoGap = parseUSFloat(value, lineNumber)
            break
          }
          case 'author': {
            meta.author = value
            break
          }
        }
      } else if ([':', '*', 'F', 'R', 'G'].includes(line.charAt(0))) {
        const [tag, startBeat, length, txtPitch, ...text] = line.slice(0, Math.max(0, line.length)).split(' ')
        if (!tag || !startBeat || !length || !txtPitch || !text)
          throw new ParseError(`Failed to parse note at line ${lineNumber}`)
        const note = new Note(
          tagToNoteType(tag),
          parseUSInt(startBeat, lineNumber),
          parseUSInt(length, lineNumber),
          parseUSInt(txtPitch, lineNumber),
          text.join(' ')
        )
        notes.push(note)
        md5.appendStr(line)
      } else if (line.charAt(0) === '-') {
        const [, linebreakBeat, appearBeat]: string[] = line.slice(1).split(' ')
        if (!linebreakBeat) throw new ParseError(`Failed to parse line break at line ${lineNumber}`)
        sentences.push(new Sentence(notes, parseUSInt(linebreakBeat, lineNumber), nextAppearBeat))
        nextAppearBeat = appearBeat ? Number.parseInt(appearBeat) || undefined : undefined
        notes = []
        md5.appendStr(line)
      } else if (line.charAt(0) === 'P') {
        if (sentences.length === 0) continue
        const lastNote = notes.at(-1)
        if (lastNote) {
          sentences.push(new Sentence(notes, lastNote.startBeat + lastNote.length + 1, nextAppearBeat))
        }
        voices.push(new Voice(sentences))
        nextAppearBeat = undefined
        notes = []
        sentences = []
      } else if (line.charAt(0) === 'E') {
        const lastNote = notes.at(-1)
        if (lastNote) {
          sentences.push(new Sentence(notes, lastNote.startBeat + lastNote.length + 1, nextAppearBeat))
        }

        notes = []
        voices.push(new Voice(sentences))

        meta.hash = md5.end()?.toString()
      }
    }

    if (!isValidMeta(meta)) throw new ParseError('Required meta data is missing in song txt')
    if (!isValidFileNames(fileNames)) throw new ParseError('Required files are missing in song txt')

    return {
      meta,
      fileNames,
      voices,
    }
  } catch (error) {
    const message = error instanceof ParseError ? `: ${error.message}` : ''
    throw new ParseError('Failed to parse song txt' + message)
  }
}

const parseUSInt = (value: string, line: number) => {
  const int = Number.parseInt(value)
  if (Number.isNaN(int)) throw new ParseError(`Failed to parse int at line ${line}`)
  return int
}

const parseUSFloat = (value: string, line: number) => {
  const float = Number.parseFloat(value.replace(',', '.'))
  if (Number.isNaN(float)) throw new ParseError(`Failed to parse float at line ${line}`)
  return float
}

const parseUsBool = (value: string) => {
  return value.toLowerCase() === 'yes' || value.toLowerCase() === 'true'
}

function tagToNoteType(tag: string): NoteType {
  switch (tag.toUpperCase()) {
    case ':': {
      return 'Normal'
    }
    case '*': {
      return 'Golden'
    }
    case 'F': {
      return 'Freestyle'
    }
    // Use Rap notes as Freestyle notes for now
    case 'R': {
      return 'Freestyle'
    }
    case 'G': {
      return 'Freestyle'
    }
  }
  return 'Normal'
}

const isValidMeta = (meta: Partial<Meta>): meta is Meta => {
  return !!meta.title && !!meta.artist && !!meta.bpm && !!meta.hash
}

const isValidFileNames = (fileNames: Partial<FileUrls>): fileNames is FileUrls => {
  return !!fileNames.audio
}
