import { convertFileSrc } from "@tauri-apps/api/core";
import { readTextFile } from "@tauri-apps/plugin-fs";
import pLimit from "p-limit";
import { commands } from "~/bindings";
import type { DirEntryWithChildren } from "~/lib/utils/fs";
import type { Song } from "../song";
import { ParseError } from "./error";
import { parseUltrastarTxt } from "./txt";

export async function parseLocalFileTree(root: DirEntryWithChildren) {
  const songFiles: { txt: DirEntryWithChildren; files: DirEntryWithChildren[] }[] = [];

  const findTxtFiles = (node: DirEntryWithChildren) => {
    for (const child of node.children) {
      if (child.isDirectory) {
        findTxtFiles(child);
      } else if (child.name.endsWith(".txt")) {
        songFiles.push({ txt: child, files: node.children });
      }
    }
  };
  findTxtFiles(root);

  const limit = pLimit(5);
  const results = await Promise.allSettled(
    songFiles.map((song) => limit(() => parseLocalTxtFile(song.txt, song.files))),
  );
  const fulfilled = results.filter((result) => result.status === "fulfilled");
  const rejected = results.filter((result) => result.status === "rejected");

  // TODO: Display errors
  for (const result of rejected) {
    console.error(result.reason);
  }

  const songs = fulfilled.map((result) => result.value);
  return songs;
}

export async function parseLocalTxtFile(txt: DirEntryWithChildren, files: DirEntryWithChildren[]) {
  try {
    const content = await readTextFile(txt.path);
    const song = parseUltrastarTxt(content);

    const localSong: LocalSong = song;

    for (const type of ["audio", "video", "cover", "background"] as const) {
      if (!song[type]) {
        continue;
      }
      const file = files.find((f) => f.name === song[type]);
      if (!file) {
        throw new ParseError(`File for ${song[type]} not found`);
      }

      const keyUrl: `${typeof type}Url` = `${type}Url`;
      localSong[keyUrl] = convertFileSrc(file.path);
    }

    if (song.audio) {
      const file = files.find((f) => f.name === song.audio);

      if (file) {
        const result = await commands.getReplayGain(file.path);
        if (result.status === "ok") {
          localSong.replayGainTrackGain = result.data.track_gain || undefined;
          localSong.replayGainTrackPeak = result.data.track_peak || undefined;
        }
      }
    }

    return localSong;
  } catch (error) {
    const message = error instanceof Error ? `: ${error.message}` : "";
    throw new ParseError(`Failed to parse ${txt.name}${message}`);
  }
}

export interface LocalSong extends Song {
  audioUrl?: string;
  videoUrl?: string;
  coverUrl?: string;
  backgroundUrl?: string;
  replayGainTrackGain?: number;
  replayGainTrackPeak?: number;
}
