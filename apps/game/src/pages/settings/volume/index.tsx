import { useNavigate } from "@solidjs/router";
import { For, createSignal } from "solid-js";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import TitleBar from "~/components/title-bar";
import Button from "~/components/ui/button";
import Slider from "~/components/ui/slider";
import { createLoop } from "~/hooks/loop";
import { useNavigation } from "~/hooks/navigation";
import { settingsStore } from "~/stores/settings";

export default function VolumeSettings() {
  const [pressed, setPressed] = createSignal(false);
  const navigate = useNavigate();
  const onBack = () => {
    navigate("/settings");
  };

  const [volume, setVolume] = createSignal(settingsStore.volume());

  const saveVolume = () => {
    settingsStore.saveVolume(volume());
    onBack();
  };

  const inputs = [
    {
      type: "slider" as const,
      label: "Master Volume",
      value: () => Math.round(volume().master * 100),
      min: 0,
      max: 100,
      step: 1,
      onInput: (value: number) => {
        setVolume((prev) => ({ ...prev, master: Math.round(value) / 100 }));
      },
    },
    {
      type: "slider" as const,
      label: "Game Volume",
      value: () => Math.round(volume().game * 100),
      min: 0,
      max: 100,
      step: 1,
      onInput: (value: number) => {
        setVolume((prev) => ({ ...prev, game: Math.round(value) / 100 }));
      },
    },
    {
      type: "slider" as const,
      label: "Preview Volume",
      value: () => Math.round(volume().preview * 100),
      min: 0,
      max: 100,
      step: 1,
      onInput: (value: number) => {
        setVolume((prev) => ({ ...prev, preview: Math.round(value) / 100 }));
      },
    },
    {
      type: "slider" as const,
      label: "Menu Volume",
      value: () => Math.round(volume().menu * 100),
      min: 0,
      max: 100,
      step: 1,
      onInput: (value: number) => {
        setVolume((prev) => ({ ...prev, menu: Math.round(value) / 100 }));
      },
    },
    {
      type: "button" as const,
      label: "Save",
      action: saveVolume,
    },
  ];

  const { position, increment, decrement, set } = createLoop(() => inputs.length);

  useNavigation(() => ({
    layer: 0,
    onKeydown(event) {
      if (event.action === "back") {
        onBack();
      } else if (event.action === "up") {
        decrement();
      } else if (event.action === "down") {
        increment();
      } else if (event.action === "confirm") {
        setPressed(true);
      }
    },
    onKeyup(event) {
      if (event.action === "confirm") {
        setPressed(false);
        const input = inputs[position()];
        if (input?.type === "button") {
          input.action();
        }
      }
    },
  }));

  return (
    <Layout
      intent="secondary"
      header={<TitleBar title="Settings" description="Volume" onBack={onBack} />}
      footer={<KeyHints hints={["back", "navigate", "confirm"]} />}
    >
      <div class="flex w-full flex-grow flex-col justify-center">
        <For each={inputs}>
          {(input, index) => {
            if (input.type === "slider") {
              return (
                <Slider
                  selected={position() === index()}
                  gradient="gradient-settings"
                  onMouseEnter={() => set(index())}
                  {...input}
                  value={input.value()}
                />
              );
            }
            return (
              <Button
                selected={position() === index()}
                active={pressed() && position() === index()}
                gradient="gradient-settings"
                onClick={input.action}
                onMouseEnter={() => set(index())}
              >
                {input.label}
              </Button>
            );
          }}
        </For>
      </div>
    </Layout>
  );
}
