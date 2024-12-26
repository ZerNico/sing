import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";
import { type LocalSong, parseLocalFileTree } from "~/lib/ultrastar/parser/local";
import { readFileTree } from "~/lib/utils/fs";

interface SongsSettings {
  paths: string[];
  dirty: boolean;
}

const [songsSettings, setSongsSettings] = makePersisted(
  createStore<SongsSettings>({
    paths: [],
    dirty: false,
  }),
  {
    name: "songsSettings",
  }
);

const [localSongs, setLocalSongs] = createStore<LocalSong[]>([]);

export function addSongPath(path: string) {
  if (songsSettings.paths.includes(path)) {
    return;
  }

  setSongsSettings("paths", [...songsSettings.paths, path]);
  setSongsSettings("dirty", true);
}

export function removeSongPath(path: string) {
  if (!songsSettings.paths.includes(path)) {
    return;
  }

  setSongsSettings(
    "paths",
    songsSettings.paths.filter((p) => p !== path)
  );
  setSongsSettings("dirty", true);
}

export async function loadSongPaths() {
  try {
    for (const path of songsSettings.paths) {      
      const root = await readFileTree(path);
      const songs = await parseLocalFileTree(root);
      
      setLocalSongs(songs);
      setSongsSettings("dirty", false);
    }
  } catch (error) {
    console.error(error);
  }
}

export { songsSettings, localSongs };
