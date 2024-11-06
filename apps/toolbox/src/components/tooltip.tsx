import { Tooltip as KTooltip } from "@kobalte/core/tooltip";
import type { JSX } from "solid-js";

interface TooltipProps {
  text: string;
  children: JSX.Element;
}

function TTooltip(props: TooltipProps) {
  return (
    <KTooltip>
      {props.children}
      <KTooltip.Portal>
        <KTooltip.Content class="select-none rounded bg-gray-800 px-2 py-1 text-sm text-white shadow-sm">{props.text}</KTooltip.Content>
      </KTooltip.Portal>
    </KTooltip>
  );
}

const Tooltip = Object.assign(TTooltip, {
  Trigger: KTooltip.Trigger,
});

export default Tooltip;