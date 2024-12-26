import { For, type JSX, Match, Switch } from "solid-js";

import IconDownArrowKey from "~icons/sing/down-arrow-key";
import IconEnterKey from "~icons/sing/enter-key";
import IconEscKey from "~icons/sing/esc-key";
import IconLeftArrowKey from "~icons/sing/left-arrow-key";
import IconRightArrowKey from "~icons/sing/right-arrow-key";
import IconUpArrowKey from "~icons/sing/up-arrow-key";

type HintType = "navigate" | "confirm" | "back";

interface KeyHintsProps {
  hints: HintType[];
}

export default function KeyHints(props: KeyHintsProps) {
  return (
    <div class="flex items-center gap-2cqw text-base">
      <For each={props.hints}>
        {(hint) => (
          <Switch>
            <Match when={hint === "back"}>
              <KeyHint label="Back" icon={<IconEscKey />} />
            </Match>
            <Match when={hint === "confirm"}>
              <KeyHint label="Confirm" icon={<IconEnterKey />} />
            </Match>
            <Match when={hint === "navigate"}>
              <KeyHint
                label="Navigate"
                icon={
                  <div class="flex flex-col items-center text-0.6cqw">
                    <IconUpArrowKey />
                    <div class="flex">
                      <IconLeftArrowKey />
                      <IconDownArrowKey />
                      <IconRightArrowKey />
                    </div>
                  </div>
                }
              />
            </Match>
          </Switch>
        )}
      </For>
    </div>
  );
}

interface KeyHintProps {
  label: string;
  icon: JSX.Element;
}
function KeyHint(props: KeyHintProps) {
  return (
    <div class="flex items-center gap-0.5cqw">
      {props.icon} {props.label}
    </div>
  );
}
