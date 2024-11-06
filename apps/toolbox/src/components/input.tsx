interface InputProps {
  value: string;
  onInput?: (value: string) => void;
  class?: string;
}

export function Input(props: InputProps) {
  return (
    <input
      type="text"
      value={props.value}
      onInput={(e) => props.onInput?.(e.currentTarget.value)}
      class={`h-10 rounded-md border border-gray-300 px-3 py-2 text-sm ${props.class || ""}`}
    />
  );
}

