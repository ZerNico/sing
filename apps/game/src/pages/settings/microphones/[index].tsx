import { useNavigate, useParams } from "@solidjs/router";
import { For, type JSX, Match, Show, Suspense, Switch, createResource, createSignal } from "solid-js";
import { commands } from "~/bindings";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import TitleBar from "~/components/title-bar";
import Button from "~/components/ui/button";
import Select from "~/components/ui/select";
import Slider from "~/components/ui/slider";
import { createLoop } from "~/hooks/loop";
import { useNavigation } from "~/hooks/navigation";
import { type Microphone, settingsStore } from "~/stores/settings";
import IconLoaderCircle from "~icons/lucide/loader-circle";

export default function MicrophoneSettings() {
  const [pressed, setPressed] = createSignal(false);
  const navigate = useNavigate();
  const onBack = () => {
    navigate("/settings/microphones");
  };
  const [microphones] = createResource(async () => {
    const response = await commands.getMicrophones();
    if (response.status === "ok") {
      return response.data;
    }

    return [];
  });

  const params = useParams<{ index: string }>();
  const index = () => {
    const index = Number.parseInt(params.index, 10);
    return Number.isNaN(index) ? -1 : index;
  };

  return (
    <Layout
      intent="secondary"
      header={<TitleBar title="Settings" description={"Microphones"} onBack={onBack} />}
      footer={<KeyHints hints={["back", "navigate", "confirm"]} />}
    >
      <Suspense
        fallback={
          <div class="flex flex-grow items-center justify-center">
            <IconLoaderCircle class="animate-spin text-6xl" />
          </div>
        }
      >
        <Show when={microphones()}>
          {(microphones) => {
            const [microphone, setMicrophone] = createSignal(
              settingsStore.microphones()[index()] || { name: microphones()[0]?.name || null, channel: 1, color: "sky", delay: 200 }
            );

            const deleteMicrophone = () => {
              settingsStore.deleteMicrophone(index());
              onBack();
            };

            const saveMicrophone = () => {
              const mic = microphone();
              if (!isValidMicrophone(mic)) {
                return;
              }
              settingsStore.saveMicrophone(index(), mic);
              onBack();
            };

            const inputs = (): Input[] =>
              [
                {
                  type: "select-string",
                  label: "Microphone",
                  value: microphone().name,
                  onChange: (name: string) => {
                    setMicrophone((prev) => ({ ...prev, name }));
                  },
                  options: microphones().map((microphone) => microphone.name),
                },
                {
                  type: "select-number",
                  label: "Channel",
                  value: microphone().channel,
                  onChange: (channel: number) => {
                    setMicrophone((prev) => ({ ...prev, channel }));
                  },
                  options: [1, 2, 3, 4, 5, 6, 7, 8],
                },
                {
                  type: "select-string",
                  label: "Color",
                  value: microphone().color,
                  onChange: (color: string) => {
                    setMicrophone((prev) => ({ ...prev, color }));
                  },
                  options: ["sky", "red", "blue", "green", "pink", "purple", "yellow", "orange"],
                  renderValue: (color: string | null) => (
                    <div
                      class="h-2cqw w-2cqw rounded-full border border-0.2cqw border-white"
                      style={{ background: color ? `rgb(var(--${color}-500))` : "transparent" }}
                    />
                  ),
                },
                {
                  type: "slider",
                  label: "Delay",
                  value: microphone().delay,
                  min: 0,
                  max: 500,
                  step: 250,
                  onChange: (delay: number) => {
                    setMicrophone((prev) => ({ ...prev, delay }));
                  }
                },
                {
                  type: "button",
                  label: "Delete",
                  action: deleteMicrophone,
                },
                {
                  type: "button",
                  label: "Save",
                  action: saveMicrophone,
                },
              ] as const;

            const { position, increment, decrement, set } = createLoop(() => inputs().length);

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
                  const button = inputs()[position()];
                  if (button?.type === "button") {
                    button.action();
                  }
                }
              },
            }));

            return (
              <div class="flex w-full flex-grow flex-col justify-center">
                <For each={inputs()}>
                  {(button, index) => (
                    <Switch>
                      <Match when={button.type === "select-string" && button}>
                        {(button) => (
                          <Select
                            selected={position() === index()}
                            gradient="gradient-settings"
                            label={button().label}
                            value={button().value}
                            options={button().options}
                            onChange={button().onChange}
                            renderValue={button().renderValue}
                            onMouseEnter={() => set(index())}
                          />
                        )}
                      </Match>
                      <Match when={button.type === "select-number" && button}>
                        {(button) => (
                          <Select
                            selected={position() === index()}
                            gradient="gradient-settings"
                            label={button().label}
                            value={button().value}
                            options={button().options}
                            onChange={button().onChange}
                            onMouseEnter={() => set(index())}
                          />
                        )}
                      </Match>
                      <Match when={button.type === "slider" && button}>
                        {(button) => (
                          <Slider
                            selected={position() === index()}
                            gradient="gradient-settings"
                            label={button().label}
                            value={button().value}
                            min={button().min}
                            max={button().max}
                            onChange={button().onChange}
                            onMouseEnter={() => set(index())}
                          />
                        )}
                      </Match>
                      <Match when={button.type === "button" && button}>
                        {(button) => (
                          <Button
                            selected={position() === index()}
                            active={pressed() && position() === index()}
                            gradient="gradient-settings"
                            onClick={button().action}
                            onMouseEnter={() => set(index())}
                          >
                            {button().label}
                          </Button>
                        )}
                      </Match>
                    </Switch>
                  )}
                </For>
              </div>
            );
          }}
        </Show>
      </Suspense>
    </Layout>
  );
}

type NullablePartial<T> = { [P in keyof T]?: T[P] | null };
function isValidMicrophone(microphone: NullablePartial<Microphone>): microphone is Microphone {
  return microphone.name !== null && microphone.channel !== null && microphone.color !== null;
}

type Input =
  | {
      type: "select-string";
      label: string;
      value: string | null;
      onChange: (value: string) => void;
      options: string[];
      renderValue?: (value: string | null) => JSX.Element;
    }
  | {
      type: "select-number";
      label: string;
      value: number | null;
      onChange: (value: number) => void;
      options: number[];
    }
  | {
      type: "slider";
      label: string;
      value: number;
      min: number;
      max: number;
      step: number;
      onChange: (value: number) => void;
    }
  | {
      type: "button";
      label: string;
      action: () => void;
    };
