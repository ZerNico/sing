import { TextField } from "@kobalte/core/text-field";
import { type JSX, Show } from "solid-js";

interface InputProps {
  class?: string;
  label?: string;
  type?: string;
  onInput?: JSX.EventHandler<HTMLInputElement, InputEvent>;
  errorMessage?: string;
  maxLength?: number;
}

export default function Input(props: InputProps) {
  return (
    <TextField validationState={props.errorMessage ? "invalid" : "valid"}>
      <Show when={props.label}>{(label) => <TextField.Label class="block text-slate-500 text-sm">{label()}</TextField.Label>}</Show>
      <TextField.Input
        maxLength={props.maxLength}
        type={props.type}
        onInput={props.onInput}
        class="block w-full rounded pb-1 focus:outline-none"
      />
      <div class="h-0.5 rounded-full bg-slate-800" />
      <TextField.ErrorMessage class="mt-1 text-red-start text-sm">{props.errorMessage}</TextField.ErrorMessage>
    </TextField>
  );
}
