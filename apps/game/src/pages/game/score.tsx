import { useNavigate } from "@solidjs/router";
import { For, Show, createMemo, createSignal, onMount } from "solid-js";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import TitleBar from "~/components/title-bar";
import Avatar from "~/components/ui/avatar";
import Button from "~/components/ui/button";
import type { User } from "~/lib/types";
import { getColorVar } from "~/lib/utils/color";
import { useRoundStore } from "~/stores/round";
import type { Score } from "~/stores/round";
import { settingsStore } from "~/stores/settings";

export default function ScorePage() {
  const roundStore = useRoundStore();
  const navigate = useNavigate();

  const scoreData = createMemo(() => {
    return roundStore.settings()?.players.map((player, index) => {
      // const score = roundStore.scores()[index] ?? { note: 0, golden: 0, bonus: 0 };
      const score = index === 0 ? { note: 30000, golden: 20000, bonus: 10403 } : { note: 50000, golden: 30000, bonus: 5500 };
      const micColor = settingsStore.microphones()[index]?.color;

      if (!player || !micColor) {
        return;
      }

      return {
        player,
        score,
        micColor,
        position: index + 1,
      };
    });
  });

  const animatedStage = createMemo(() => {
    const animatedStages = new Set<"note" | "golden" | "bonus">();

    const scores = scoreData();

    if (!scores) return [];

    for (const score of scores) {
      if (!score) continue;

      if (score.score.note > 0) animatedStages.add("note");
      if (score.score.golden > 0) animatedStages.add("golden");
      if (score.score.bonus > 0) animatedStages.add("bonus");
    }

    return Array.from(animatedStages);
  });

  return (
    <Layout intent="secondary" header={<TitleBar title="Score" />} footer={<KeyHints hints={["confirm"]} />}>
      <div class="flex flex-grow flex-col">
        <div class="flex flex-grow flex-col items-center justify-center gap-10">
          <For each={scoreData()}>
            {(scoreData) => (
              <Show when={scoreData}>
                {(data) => (
                  <ScoreCard
                    animatedStages={animatedStage()}
                    score={data().score}
                    player={data().player}
                    micColor={data().micColor}
                    position={data().position}
                  />
                )}
              </Show>
            )}
          </For>
        </div>
        <Button selected gradient="gradient-sing" class="w-full">
          Continue
        </Button>
      </div>
    </Layout>
  );
}

interface ScoreCardProps {
  score: Score;
  player: User;
  micColor: string;
  position: number;
  animatedStages: ("note" | "golden" | "bonus")[];
}

function ScoreCard(props: ScoreCardProps) {
  const totalScore = props.score.note + props.score.golden + props.score.bonus;
  const maxPossibleScore = 100000;

  const notePercentage = (props.score.note / maxPossibleScore) * 100;
  const goldenPercentage = (props.score.golden / maxPossibleScore) * 100;
  const bonusPercentage = (props.score.bonus / maxPossibleScore) * 100;

  const [animated, setAnimated] = createSignal<{ note: boolean; golden: boolean; bonus: boolean }>({
    note: false,
    golden: false,
    bonus: false,
  });

  onMount(() => {
    for (const [index, stage] of props.animatedStages.entries()) {
      setTimeout(
        () => {
          setAnimated((prev) => ({ ...prev, [stage]: true }));
        },
        index * 1.5 * 1000
      );
    }
  });

  return (
    <div
      class="flex w-140 flex-col gap-3 rounded-xl p-6 shadow-xl transition-all"
      style={{
        background: `linear-gradient(90deg, ${getColorVar(props.micColor, 600)}, ${getColorVar(props.micColor, 500)})`,
      }}
    >
      <div class="flex w-full items-center justify-between">
        <div class="flex items-center gap-3">
          <Avatar user={props.player} />
          <div class="font-bold text-lg text-white">{props.player.username}</div>
        </div>
        <div class="font-bold text-3xl text-white">{totalScore.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
      </div>

      <div class="flex h-10 w-full overflow-hidden rounded-lg bg-black/20">
        <div
          class="flex h-full items-center justify-center font-medium text-white/90 text-xs"
          style={{
            width: `${animated().note ? notePercentage : 0}%`,
            "background-color": getColorVar(props.micColor, 400),
            transition: "width 1s ease-in-out",
          }}
        />
        <div
          class="flex h-full items-center justify-center font-medium text-white/90 text-xs"
          style={{
            width: `${animated().golden ? goldenPercentage : 0}%`,
            "background-color": getColorVar(props.micColor, 300),
            transition: "width 1s ease-in-out",
          }}
        />
        <div
          class="flex h-full items-center justify-center font-medium text-white/90 text-xs"
          style={{
            width: `${animated().bonus ? bonusPercentage : 0}%`,
            "background-color": getColorVar(props.micColor, 50),
            transition: "width 1s ease-in-out",
          }}
        />
      </div>

      <div class="mt-2 grid grid-cols-3 gap-2">
        <div class="flex items-center gap-2 rounded-md bg-black/10 px-3 py-1.5">
          <div class="h-4 w-4 rounded-sm" style={{ "background-color": getColorVar(props.micColor, 400) }} />
          <div class="flex flex-col">
            <span class="text-white/70 text-xs">Notes</span>
            <span class="font-medium text-sm text-white">{props.score.note.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 rounded-md bg-black/10 px-3 py-1.5">
          <div class="h-4 w-4 rounded-sm" style={{ "background-color": getColorVar(props.micColor, 300) }} />
          <div class="flex flex-col">
            <span class="text-white/70 text-xs">Golden</span>
            <span class="font-medium text-sm text-white">{props.score.golden.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 rounded-md bg-black/10 px-3 py-1.5">
          <div class="h-4 w-4 rounded-sm" style={{ "background-color": getColorVar(props.micColor, 50) }} />
          <div class="flex flex-col">
            <span class="text-white/70 text-xs">Bonus</span>
            <span class="font-medium text-sm text-white">{props.score.bonus.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
