import { makePersisted } from "@solid-primitives/storage";
import { createSignal } from "solid-js";

export interface Microphone {
  name: string;
  channel: number;
  color: string;
  delay: number;
}

function createSettingsStore() {
  const [initialized, setInitialized] = createSignal(false);
  const [microphones, setMicrophones] = makePersisted(createSignal<Microphone[]>([]), {
    name: "settingsStore.microphones",
  });

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

  return {
    initialized,
    setInitialized,
    microphones,
    saveMicrophone,
    deleteMicrophone,
  };
}

export const settingsStore = createSettingsStore();
