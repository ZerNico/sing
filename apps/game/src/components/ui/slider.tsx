import type { JSX } from "solid-js";
import { useNavigation } from "~/hooks/navigation";
import { clamp } from "~/lib/utils/math";
import IconTriangleLeft from "~icons/sing/triangle-left";
import IconTriangleRight from "~icons/sing/triangle-right";

interface SliderProps {
  selected?: boolean;
  gradient?: string;
  class?: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onInput?: (value: number) => void;
  onMouseEnter?: () => void;
}

export default function Slider(props: SliderProps) {
  const getDecimalPlaces = (step: number) => {
    const stepStr = step.toString();
    const decimal = stepStr.indexOf(".");
    return decimal === -1 ? 0 : stepStr.length - decimal - 1;
  };

  const percentage = () => ((props.value - props.min) / (props.max - props.min)) * 100;

  const changeValue = (direction: "right" | "left") => {
    const newValue = Number((props.value + (direction === "right" ? props.step : -props.step)).toFixed(getDecimalPlaces(props.step)));
    props.onInput?.(clamp(newValue, props.min, props.max));
  };

  const handleInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (e) => {
    const value = e.currentTarget.valueAsNumber;
    props.onInput?.(value);
  };

  useNavigation(() => ({
    layer: 0,
    enabled: props.selected || false,
    onKeydown: (event) => {
      if (event.action === "left") {
        changeValue("left");
      } else if (event.action === "right") {
        changeValue("right");
      }
    },
  }));

  return (
    <div class="grid h-6.5cqh items-center overflow-hidden rounded-lg" onMouseEnter={props.onMouseEnter}>
      <div
        class="col-start-1 row-start-1 h-full w-full bg-gradient-to-r transition-opacity"
        classList={{
          [props.gradient || ""]: true,
          "opacity-0": !props.selected,
        }}
      />
      <div class="z-2 col-start-1 row-start-1 mx-auto grid w-full max-w-80cqw grid-cols-[1fr_3fr] items-center">
        <div class="text-center font-bold text-xl">{props.label}</div>
        <div class="flex items-center gap-2cqw">
          <button type="button" onClick={() => changeValue("left")}>
            <IconTriangleLeft />
          </button>
          <div class="grid h-1.2cqw flex-grow items-center">
            <div class="col-start-1 row-start-1 h-full w-full rounded bg-black/20" />
            <div class="col-start-1 row-start-1 h-full w-full rounded bg-white" style={{ width: `${percentage()}%` }} />
            <div
              class="col-start-1 row-start-1 text-center font-bold text-sm text-white"
              style={{ "clip-path": `inset(0 0 0 ${percentage()}%)` }}
            >
              {props.value}
            </div>
            <div
              class="col-start-1 row-start-1 text-center font-bold text-black text-sm"
              style={{ "clip-path": `inset(0 ${100 - percentage()}% 0 0)` }}
            >
              {props.value}
            </div>
            <input
              type="range"
              class="reset-range col-start-1 row-start-1 block h-full w-full opacity-0"
              min={props.min}
              max={props.max}
              step={props.step}
              value={props.value}
              onInput={(e) => handleInput(e)}
              onKeyDown={(e) => e.preventDefault()}
            />
          </div>
          <button type="button" onClick={() => changeValue("right")}>
            <IconTriangleRight />
          </button>
        </div>
      </div>
    </div>
  );
}
