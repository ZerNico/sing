import { Show, createEffect, createSignal, on } from "solid-js";
import { joinURL } from "ufo";

interface AvatarProps {
  user: {
    picture?: string | null;
    username?: string | null;
  };
  class?: string;
}

export default function Avatar(props: AvatarProps) {
  const [error, setError] = createSignal(false);

  createEffect(
    on(
      () => props.user,
      () => {
        setError(false);
      }
    )
  );

  const fallback = () => props.user?.username?.at(0) || "?";

  const pictureUrl = () => {
    if (props.user?.picture?.startsWith("/")) {
      return joinURL(import.meta.env.VITE_API_URL, props.user.picture);
    }

    return props.user?.picture || undefined;
  };

  return (
    <div
      class="grid h-10 w-10"
      classList={{
        [props.class || ""]: !!props.class,
      }}
    >
      <div class="gradient-settings col-start-1 row-start-1 flex h-full w-full items-center justify-center rounded-full bg-gradient-to-tr">
        {fallback()}
      </div>
      <Show when={!error()}>
        <img
          onError={() => setError(true)}
          src={pictureUrl()}
          alt={props.user?.username || "Avatar"}
          class="col-start-1 row-start-1 block h-full w-full rounded-full"
        />
      </Show>
    </div>
  );
}
