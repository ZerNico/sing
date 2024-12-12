import { Show, createEffect, createSignal, on } from "solid-js";
import { fallback } from "valibot";

interface AvatarProps {
  src?: string;
  fallback?: string;
}

export default function Avatar(props: AvatarProps) {
  const [error, setError] = createSignal(false);

  createEffect(
    on(
      () => props.src,
      () => {
        setError(false);
      }
    )
  );

  const fallback = () => props.fallback?.at(0) || "?";

  return (
    <div class="grid h-10 w-10">
      <div class="col-start-1 row-start-1 flex h-full w-full items-center justify-center rounded-full bg-night-500">{fallback()}</div>
      <Show when={!error()}>
        <img
          onError={() => setError(true)}
          src={props.src || props.fallback}
          alt={props.fallback || "Avatar"}
          class="col-start-1 row-start-1 block h-full w-full rounded-full"
        />
      </Show>
    </div>
  );
}
