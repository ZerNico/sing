import { useNavigate, useParams } from "@solidjs/router";
import { type Accessor, For, type JSX, Match, Show, Suspense, Switch, createResource, createSignal } from "solid-js";
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

  const params = useParams<{ id: string }>();
  const id = () => {
    const id = Number.parseInt(params.id, 10);
    return Number.isNaN(id) ? -1 : id;
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
              settingsStore.microphones()[id()] || {
                name: microphones()[0]?.name || null,
                channel: 1,
                color: "sky",
                delay: 200,
                gain: 1,
                threshold: 2,
              }
            );

            const deleteMicrophone = () => {
              settingsStore.deleteMicrophone(id());
              onBack();
            };

            const saveMicrophone = () => {
              const mic = microphone();
              if (!isValidMicrophone(mic)) {
                return;
              }
              settingsStore.saveMicrophone(id(), mic);
              onBack();
            };

            const inputs: Input[] = [
              {
                type: "select-string",
                label: "Microphone",
                value: () => microphone().name,
                onChange: (name: string) => {
                  setMicrophone((prev) => ({ ...prev, name }));
                },
                options: microphones().map((microphone) => microphone.name),
              },
              {
                type: "select-number",
                label: "Channel",
                value: () => microphone().channel,
                onChange: (channel: number) => {
                  setMicrophone((prev) => ({ ...prev, channel }));
                },
                options: [1, 2, 3, 4, 5, 6, 7, 8],
              },
              {
                type: "select-string",
                label: "Color",
                value: () => microphone().color,
                onChange: (color: string) => {
                  setMicrophone((prev) => ({ ...prev, color }));
                },
                options: ["sky", "red", "blue", "green", "pink", "purple", "yellow", "orange"],
                renderValue: (color: string | null) => (
                  <div
                    class="h-8 w-8 rounded-full border-[0.2cqw] border-white"
                    style={{ background: color ? `var(--color-${color}-500)` : "transparent" }}
                  />
                ),
              },
              {
                type: "slider",
                label: "Delay",
                value: () => microphone().delay,
                min: 0,
                max: 500,
                step: 10,
                onInput: (delay: number) => {
                  setMicrophone((prev) => ({ ...prev, delay }));
                },
              },
              {
                type: "slider",
                label: "Gain",
                value: () => microphone().gain,
                min: 0,
                max: 3,
                step: 0.1,
                onInput: (gain: number) => {
                  setMicrophone((prev) => ({ ...prev, gain }));
                },
              },
              {
                type: "slider",
                label: "Threshold",
                value: () => microphone().threshold,
                min: 0,
                max: 5,
                step: 0.1,
                onInput: (threshold: number) => {
                  setMicrophone((prev) => ({ ...prev, threshold }));
                },
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
                  const button = inputs[position()];
                  if (button?.type === "button") {
                    button.action();
                  }
                }
              },
            }));

            return (
              <div class="flex w-full flex-grow flex-col justify-center">
                <For each={inputs}>
                  {(button, index) => (
                    <Switch>
                      <Match when={button.type === "select-string" && button}>
                        {(button) => (
                          <Select
                            selected={position() === index()}
                            gradient="gradient-settings"
                            label={button().label}
                            value={button().value()}
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
                            value={button().value()}
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
                            onMouseEnter={() => set(index())}
                            {...button()}
                            value={button().value()}
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
      value: Accessor<string | null>;
      onChange: (value: string) => void;
      options: string[];
      renderValue?: (value: string | null) => JSX.Element;
    }
  | {
      type: "select-number";
      label: string;
      value: Accessor<number | null>;
      onChange: (value: number) => void;
      options: number[];
    }
  | {
      type: "slider";
      label: string;
      value: Accessor<number>;
      min: number;
      max: number;
      step: number;
      onInput: (value: number) => void;
    }
  | {
      type: "button";
      label: string;
      action: () => void;
    };
