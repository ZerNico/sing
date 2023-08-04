import { Client } from '@rspc/client'
import { FileEntry } from '@tauri-apps/api/fs'
import { convertFileSrc } from '@tauri-apps/api/tauri'
import { ofetch } from 'ofetch'

import { Procedures } from '~/rspc-bindings'

import { FileUrls, LocalSong } from '../song'
import { ParseError } from './error'
import { parseUSTxt } from './us-txt'

export const parseLocalTree = async (tree: FileEntry, client: Client<Procedures>) => {
  if (!tree?.children) return []

  const txts: { file: FileEntry; parent: FileEntry }[] = []

  // find all txt files and store them with their parent folder to find adjacent files
  let parent: FileEntry
  const findTxts = (tree: FileEntry) => {
    if (tree.children !== undefined) {
      parent = tree
      for (const child of tree.children) {
        findTxts(child)
      }
    } else if (tree.path.endsWith('.txt') && parent) {
      txts.push({ file: tree, parent })
    }
  }
  findTxts(tree)

  const results = await Promise.allSettled(txts.map(({ file, parent }) => parseLocalSong(file, parent, client)))
  const fulfilled = results.filter((result) => result.status === 'fulfilled') as PromiseFulfilledResult<LocalSong>[]
  const rejected = results.filter((result) => result.status === 'rejected') as PromiseRejectedResult[]

  // TODO: display errors
  for (const result of rejected) {
    console.error(result.reason)
  }

  const songs = fulfilled.map((result) => result.value)
  return songs
}

const parseLocalSong = async (file: FileEntry, parent: FileEntry, client: Client<Procedures>) => {
  try {
    const assetUrl = convertFileSrc(file.path, 'stream')

    const song = (await ofetch(assetUrl, { parseResponse: (txt) => txt })) as string
    const { meta, fileNames, voices } = parseUSTxt(song)

    const fileUrls: Partial<FileUrls> = {}
    const filePaths: Partial<FileUrls> = {}

    const findFile = (name: string) => {
      const file = parent.children?.find((file) => file.name?.toLowerCase() === name.toLowerCase())
      if (file) return file.path
      return null
    }

    let k: keyof typeof fileNames
    for (k in fileNames) {
      const fileName = fileNames[k]
      if (typeof fileName === 'string') {
        const path = findFile(fileName)

        if (path) {
          filePaths[k] = path
          fileUrls[k] = convertFileSrc(path, 'stream')
        }
      }
    }

    if (!isValidFileUrls(fileUrls) || !isValidFileUrls(filePaths))
      throw new ParseError('Required files could not be found in song folder')

    const replayGain = await client.query(['replaygain', filePaths.audio])

    const localSong = new LocalSong(voices, meta, fileUrls, { replayGain })
    return localSong
  } catch (error) {
    const message = error instanceof Error ? `: ${error.message}` : ''
    throw new ParseError(`Failed to parse ${file.name}${message}`)
  }
}

const isValidFileUrls = (fileUrls: Partial<FileUrls>): fileUrls is FileUrls => {
  return !!fileUrls.audio
}
