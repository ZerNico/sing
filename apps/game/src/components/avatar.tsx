import { Show, createEffect, createSignal, on } from "solid-js";

interface AvatarProps {
  src?: string;
  fallback?: string;
  class?: string;
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
    <div
      class="grid h-10 w-10"
      classList={{
        [props.class || ""]: !!props.class,
      }}
    >
      <div class="col-start-1 row-start-1 flex h-full w-full items-center justify-center rounded-full bg-gradient-to-rt from-cyan-400 to-blue-500">
        {fallback()}
      </div>
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
