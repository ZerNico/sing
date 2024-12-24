import { type Component, For, createEffect } from "solid-js";
import { Dynamic } from "solid-js/web";
import IconMicVocal from "~icons/lucide/mic-vocal";
import IconPartyPopper from "~icons/lucide/party-popper";
import IconSettings from "~icons/lucide/settings";
import IconUsers from "~icons/lucide/users";
import Layout from "../components/layout";
import { createLoop } from "../hooks/loop";
import { useNavigation } from "../hooks/navigation";

export default function Home() {
  const { position, increment, decrement, set } = createLoop(4);
  useNavigation({
    layer: 0,
    onKeydown(event) {
      if (event.action === "left") {
        decrement();
      } else if (event.action === "right") {
        increment();
      }
    },
  });

  const cards = [
    {
      label: "Sing",
      gradient: "gradient-sing",
      icon: IconMicVocal,
      description: "Sing your favorite songs, alone or with your friends!",
    },
    {
      label: "Party",
      gradient: "gradient-party",
      icon: IconPartyPopper,
      description: "Battle it out with your friends in one of the different party game modes!",
    },
    {
      label: "Lobby",
      gradient: "gradient-lobby",
      icon: IconUsers,
      description: "Manage the party you are in and invite your friends.",
    },
    {
      label: "Settings",
      gradient: "gradient-settings",
      icon: IconSettings,
      description: "Change your settings or add your songs and microphones.",
    },
  ];

  return (
    <Layout>
      <div class="flex-grow">123</div>
      <div class="flex gap-1cqw">
        <For each={cards}>
          {(card, index) => (
            <ModeCard
              active={position() === index()}
              class="flex-1"
              label={card.label}
              gradient={card.gradient}
              icon={card.icon}
              description={card.description}
              onMouseEnter={() => set(index())}
            />
          )}
        </For>
      </div>
    </Layout>
  );
}

interface ModeCardProps {
  active?: boolean;
  label: string;
  class?: string;
  gradient?: string;
  icon?: Component<{ class?: string }>;
  description?: string;
  onMouseEnter?: () => void;
}
function ModeCard(props: ModeCardProps) {
  return (
    <button
      class="flex transform flex-col gap-0.3cqw p-1 transition-all"
      type="button"
      classList={{
        [props.class || ""]: true,
        "bg-white": props.active,
        "opacity-50": !props.active,
      }}
      onMouseEnter={props.onMouseEnter}
      
    >
      <div class="font-semibold text-sm uppercase">{props.label}</div>
      <div
        class="flex w-full flex-grow flex-col shadow-xl"
        classList={{
          "overflow-hidden rounded-lg": props.active,
        }}
      >
        <div
          class="flex items-center justify-center rounded-t-lg bg-gradient-to-b px-3cqw py-4cqw transition-all"
          classList={{
            [props.gradient || ""]: true,
            "rounded-b-lg": !props.active,
          }}
        >
          <Dynamic class="text-6xl" component={props.icon} />
        </div>
        <div
          class="flex-grow rounded-b-md bg-white px-2cqw py-1cqw text-left font-semibold text-base text-black transition-all"
          classList={{
            "opacity-0": !props.active,
          }}
        >
          {props.description}
        </div>
      </div>
    </button>
  );
}
