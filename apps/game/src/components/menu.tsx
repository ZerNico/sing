import { For, type JSX, Match, Switch } from "solid-js";
import { twMerge } from "tailwind-merge";
import { createLoop } from "~/hooks/loop";
import { useNavigation } from "~/hooks/navigation";
import Button from "./ui/button";
import Select from "./ui/select";
import Slider from "./ui/slider";

export type MenuItem =
  | {
      type: "slider";
      label: string;
      value: () => number;
      min: number;
      max: number;
      step: number;
      onInput: (value: number) => void;
    }
  | {
      type: "button";
      label: string;
      action?: () => void;
    }
  | {
      type: "select-string";
      label: string;
      value: () => string | null;
      onChange: (value: string) => void;
      options: string[];
      renderValue?: (value: string | null) => JSX.Element;
    }
  | {
      type: "select-number";
      label: string;
      value: () => number | null;
      onChange: (value: number) => void;
      options: number[];
      renderValue?: (value: number | null) => JSX.Element;
    }
  | {
      type: "select-string-number";
      label: string;
      value: () => string | number | null;
      onChange: (value: string | number) => void;
      options: (string | number)[];
      renderValue?: (value: string | number | null) => JSX.Element;
    };

export interface MenuProps {
  items: MenuItem[];
  onBack?: () => void;
  gradient?: "gradient-settings" | "gradient-lobby" | "gradient-sing" | "gradient-party";
  layer?: number;
  class?: string;
}

export default function Menu(props: MenuProps) {
  const { position, increment, decrement, set } = createLoop(() => props.items.length);

  useNavigation(() => ({
    layer: props.layer,
    onKeydown(event) {
      if (event.action === "back") {
        props.onBack?.();
      } else if (event.action === "up") {
        decrement();
      } else if (event.action === "down") {
        increment();
      }
    },
  }));

  return (
    <div class={twMerge("flex h-full w-full flex-grow flex-col justify-center", props.class)}>
      <For each={props.items}>
        {(item, index) => (
          <Switch>
            <Match when={item.type === "button" && item}>
              {(item) => (
                <Button
                  layer={props.layer}
                  gradient={props.gradient || "gradient-settings"}
                  selected={position() === index()}
                  onClick={item().action}
                  onMouseEnter={() => set(index())}
                >
                  {item().label}
                </Button>
              )}
            </Match>
            <Match when={item.type === "select-string" && item}>
              {(item) => (
                <Select
                  layer={props.layer}
                  gradient={props.gradient || "gradient-settings"}
                  label={item().label}
                  value={item().value()}
                  onChange={item().onChange}
                  options={item().options}
                  selected={position() === index()}
                  onMouseEnter={() => set(index())}
                  renderValue={item().renderValue}
                />
              )}
            </Match>
            <Match when={item.type === "select-number" && item}>
              {(item) => (
                <Select
                  layer={props.layer}
                  gradient={props.gradient || "gradient-settings"}
                  label={item().label}
                  value={item().value()}
                  onChange={item().onChange}
                  options={item().options}
                  selected={position() === index()}
                  onMouseEnter={() => set(index())}
                  renderValue={item().renderValue}
                />
              )}
            </Match>
            <Match when={item.type === "select-string-number" && item}>
              {(item) => (
                <Select
                  layer={props.layer}
                  gradient={props.gradient || "gradient-settings"}
                  label={item().label}
                  value={item().value()}
                  onChange={item().onChange}
                  options={item().options}
                  selected={position() === index()}
                  onMouseEnter={() => set(index())}
                  renderValue={item().renderValue}
                />
              )}
            </Match>
            <Match when={item.type === "slider" && item}>
              {(item) => (
                <Slider
                  layer={props.layer}
                  gradient={props.gradient || "gradient-settings"}
                  label={item().label}
                  value={item().value()}
                  min={item().min}
                  max={item().max}
                  step={item().step}
                  onInput={item().onInput}
                  selected={position() === index()}
                  onMouseEnter={() => set(index())}
                />
              )}
            </Match>
          </Switch>
        )}
      </For>
    </div>
  );
}
