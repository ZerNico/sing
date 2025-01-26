import { makePersisted } from "@solid-primitives/storage";
import { createSignal } from "solid-js";

export interface Microphone {
  name: string;
  channel: number;
  color: string;
  delay: number;
  gain: number;
  threshold: number;
}

export interface VolumeSettings {
  master: number;
  game: number;
  preview: number;
  menu: number;
}

function createSettingsStore() {
  const [initialized, setInitialized] = createSignal(false);
  const [microphones, setMicrophones] = makePersisted(createSignal<Microphone[]>([]), {
    name: "settingsStore.microphones",
  });
  const [volume, setVolume] = makePersisted(
    createSignal<VolumeSettings>({
      master: 100,
      game: 100,
      preview: 100,
      menu: 100,
    }),
    {
      name: "settingsStore.volume",
    }
  );

  const saveMicrophone = (index: number, microphone: Microphone) => {
    setMicrophones((prev) => {
      const next = [...prev];
      next[index] = microphone;
      return next;
    });
  };

  const deleteMicrophone = (index: number) => {
    setMicrophones((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const saveVolume = (settings: VolumeSettings) => {
    setVolume(settings);
  };

  return {
    initialized,
    setInitialized,
    microphones,
    saveMicrophone,
    deleteMicrophone,
    volume,
    saveVolume,
  };
}

export const settingsStore = createSettingsStore();
