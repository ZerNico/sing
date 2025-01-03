import type { JSX } from "solid-js";
import { useNavigation } from "~/hooks/navigation";
import IconTriangleLeft from "~icons/sing/triangle-left";
import IconTriangleRight from "~icons/sing/triangle-right";

interface SelectProps<T extends string | number> {
  selected?: boolean;
  gradient?: string;
  class?: string;
  label: string;
  value: T | null;
  options?: ReadonlyArray<T>;
  onChange?: (value: T) => void;
  onMouseEnter?: () => void;
  renderValue?: (value: T | null) => JSX.Element;
}

export default function Select<T extends string | number>(props: SelectProps<T>) {
  const changeOptions = (direction: "right" | "left") => {
    const index = (props.value ? props.options?.indexOf(props.value) : -1) ?? -1;

    let newIndex = direction === "right" ? index + 1 : index - 1;
    if (index === -1) {
      newIndex = direction === "right" ? 0 : -1;
    }

    const newValue = props.options?.at(newIndex % props.options.length);

    if (!newValue) {
      return;
    }

    props.onChange?.(newValue);
  };

  useNavigation(() => ({
    layer: 0,
    enabled: props.selected || false,
    onKeydown: (event) => {
      if (event.action === "left") {
        changeOptions("left");
      } else if (event.action === "right") {
        changeOptions("right");
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
        <div class="flex items-center">
          <button type="button" onClick={() => changeOptions("left")}>
            <IconTriangleLeft />
          </button>
          <div class="flex flex-grow flex-col items-center justify-center text-center font-bold text-xl">
            {props.renderValue ? props.renderValue(props.value) : props.value}
          </div>
          <button type="button" onClick={() => changeOptions("right")}>
            <IconTriangleRight />
          </button>
        </div>
      </div>
    </div>
  );
}
