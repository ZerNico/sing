import { Slider as KSlider } from "@kobalte/core/slider";
import IconTriangleLeft from "~icons/sing/triangle-left";
import IconTriangleRight from "~icons/sing/triangle-right";

interface SliderProps {
  selected?: boolean;
  gradient?: string;
  class?: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange?: (value: number) => void;
  onMouseEnter?: () => void;
}

export default function Slider(props: SliderProps) {
  return (
    <KSlider
      class="grid h-6.5cqh items-center overflow-hidden rounded-lg"
      onMouseEnter={props.onMouseEnter}
    >
      <div
        class="col-start-1 row-start-1 h-full w-full bg-gradient-to-r transition-opacity"
        classList={{
          [props.gradient || ""]: true,
          "opacity-0": !props.selected,
        }}
      />
      <div class="z-2 col-start-1 row-start-1 mx-auto grid w-full max-w-80cqw grid-cols-[1fr_3fr] items-center">
        <KSlider.Label class="text-center font-bold text-xl">{props.label}</KSlider.Label>
        <div class="flex items-center gap-2cqw">
          <button type="button">
            <IconTriangleLeft />
          </button>

          <KSlider.Track class="relative h-2.5cqh flex-grow rounded-md bg-black/40">
            <KSlider.Fill class="absolute h-full rounded-md bg-white" />
            <KSlider.Thumb onKeyPress={(event) => {
        console.log(event.key);
        event.preventDefault();
      }}>
              <KSlider.Input        />
            </KSlider.Thumb>
          </KSlider.Track>
          <button type="button">
            <IconTriangleRight />
          </button>
        </div>
      </div>
    </KSlider>
  );
}
