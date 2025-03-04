import { useNavigate } from "@solidjs/router";
import { createMutation, createQuery } from "@tanstack/solid-query";
import { For, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import HighscoreList from "~/components/highscore-list";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import TitleBar from "~/components/title-bar";
import Avatar from "~/components/ui/avatar";
import Button from "~/components/ui/button";
import { v1 } from "~/lib/api";
import { highscoresQueryOptions } from "~/lib/queries";
import type { User } from "~/lib/types";
import { getMaxScore } from "~/lib/ultrastar/voice";
import { getColorVar } from "~/lib/utils/color";
import { useRoundStore } from "~/stores/round";
import type { Score } from "~/stores/round";
import { settingsStore } from "~/stores/settings";

type ScoreCategory = "normal" | "golden" | "bonus";
type AnimatedState = Record<ScoreCategory, boolean>;

const MAX_POSSIBLE_SCORE = 100000;
const ANIMATION_DURATION = 2000;
const ANIMATION_STEPS = 38;
const ANIMATION_DELAY = 2250;

interface PlayerScoreData {
  player: User;
  score: Score;
  totalScore: number;
  micColor: string;
  position: number;
}

const getRelativeScore = (score: Score, maxScore: Score) => {
  const maxScoreTotal = maxScore.normal + maxScore.golden + maxScore.bonus;
  const absoluteScore = score ?? { normal: 0, golden: 0, bonus: 0 };

  const relativeScore = {
    normal: (absoluteScore.normal / maxScoreTotal) * MAX_POSSIBLE_SCORE,
    golden: (absoluteScore.golden / maxScoreTotal) * MAX_POSSIBLE_SCORE,
    bonus: (absoluteScore.bonus / maxScoreTotal) * MAX_POSSIBLE_SCORE,
  };

  return relativeScore;
};

export default function ScorePage() {
  const roundStore = useRoundStore();
  const navigate = useNavigate();
  const highscoresQuery = createQuery(() => highscoresQueryOptions(roundStore.settings()?.song?.hash ?? ""));

  const scoreData = createMemo<PlayerScoreData[]>(() => {
    const players = roundStore.settings()?.players || [];
    const result: PlayerScoreData[] = [];

    for (const [index, player] of players.entries()) {
      const voiceIndex = roundStore.settings()?.voices[index];
      if (voiceIndex === undefined) continue;

      const voice = roundStore.settings()?.song?.voices[voiceIndex];

      if (!voice || !player) continue;

      const maxScore = getMaxScore(voice);
      const absoluteScore = roundStore.scores()[index] ?? { normal: 0, golden: 0, bonus: 0 };

      const relativeScore = getRelativeScore(absoluteScore, maxScore);

      const micColor = settingsStore.microphones()[index]?.color;
      if (!micColor) continue;

      result.push({
        player,
        score: relativeScore,
        totalScore: Math.floor(relativeScore.normal + relativeScore.golden + relativeScore.bonus),
        micColor,
        position: index + 1,
      });
    }

    return result;
  });

  const updateHighscoresMutation = createMutation(() => ({
    mutationFn: async () => {
      const scores = scoreData();
      const songHash = roundStore.settings()?.song?.hash;

      if (!songHash) return;

      for (const score of scores) {
        if ("type" in score.player) continue;
        if (score.totalScore <= 0) continue;

        await v1.highscores[":hash"][":userId"].put({
          params: {
            hash: songHash,
            userId: score.player.id.toString(),
          },
          body: { score: score.totalScore },
        });
      }
    },
  }));

  const handleContinue = () => {
    if (updateHighscoresMutation.isPending) return;

    navigate("/sing");
  };

  const animatedStages = createMemo(() => {
    const stages = new Set<ScoreCategory>();
    const scores = scoreData();

    if (!scores.length) return [];

    for (const data of scores) {
      if (data.score.normal > 0) stages.add("normal");
      if (data.score.golden > 0) stages.add("golden");
      if (data.score.bonus > 0) stages.add("bonus");
    }

    return Array.from(stages);
  });

  onMount(() => {
    updateHighscoresMutation.mutate();
  });

  const highscores = () => {
    if (updateHighscoresMutation.isPending) return [];

    const highscores: { user: User; score: number }[] = [...(highscoresQuery.data || [])];
    const scores = scoreData();

    for (const score of scores) {
      if ("type" in score.player) continue;
      if (score.totalScore <= 0) continue;

      const existingHighscoreIndex = highscores.findIndex((highscore) => highscore.user.id === score.player.id);
      const existingHighscore = highscores[existingHighscoreIndex];

      if (!existingHighscore) {
        highscores.push({
          user: score.player,
          score: score.totalScore,
        });
        continue;
      }

      if (score.totalScore > existingHighscore.score) {
        highscores[existingHighscoreIndex] = {
          user: score.player,
          score: score.totalScore,
        };
      }
    }

    return highscores.toSorted((a, b) => b.score - a.score);
  };

  return (
    <Layout intent="secondary" header={<TitleBar title="Score" />} footer={<KeyHints hints={["confirm"]} />}>
      <div class="flex flex-grow flex-col">
        <div class="flex-1" />
        <div class="grid grid-cols-[2fr_3fr]">
          <div class="relative">
            <div class="absolute inset-0 flex max-w-full justify-center">
              <HighscoreList scores={highscores()} class="w-100" />
            </div>
          </div>
          <div class="flex flex-grow flex-col items-center justify-center gap-10">
            <For each={scoreData()}>
              {(data) => (
                <ScoreCard
                  animatedStages={animatedStages()}
                  score={data.score}
                  player={data.player}
                  micColor={data.micColor}
                  position={data.position}
                />
              )}
            </For>
          </div>
        </div>

        <div class="flex flex-1 items-center">
          <Button loading={updateHighscoresMutation.isPending} selected gradient="gradient-sing" class="w-full" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </div>
    </Layout>
  );
}

interface ScoreCardProps {
  score: Score;
  player: User;
  micColor: string;
  position: number;
  animatedStages: ScoreCategory[];
}

function ScoreCard(props: ScoreCardProps) {
  const getPercentage = (value: number) => (value / MAX_POSSIBLE_SCORE) * 100;

  const [animated, setAnimated] = createSignal<AnimatedState>({
    normal: false,
    golden: false,
    bonus: false,
  });

  const [animatedScores, setAnimatedScores] = createSignal<Score>({
    normal: 0,
    golden: 0,
    bonus: 0,
  });
  const [animatedTotalScore, setAnimatedTotalScore] = createSignal(0);

  const animateCounter = (
    startValue: number,
    endValue: number,
    setValue: (value: number) => void,
    duration: number
  ): ReturnType<typeof setInterval> => {
    const stepValue = (endValue - startValue) / ANIMATION_STEPS;
    const stepDuration = duration / ANIMATION_STEPS;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const newValue = startValue + stepValue * currentStep;
      setValue(currentStep < ANIMATION_STEPS ? Math.floor(newValue) : endValue);

      if (currentStep >= ANIMATION_STEPS) {
        clearInterval(interval);
      }
    }, stepDuration);

    return interval;
  };

  onMount(() => {
    let totalInterval: ReturnType<typeof setInterval> | undefined;

    for (const [index, category] of props.animatedStages.entries()) {
      setTimeout(() => {
        setAnimated((prev) => ({ ...prev, [category]: true }));

        const scoreValue = props.score[category];
        animateCounter(0, scoreValue, (value) => setAnimatedScores((prev) => ({ ...prev, [category]: value })), ANIMATION_DURATION);

        if (totalInterval) clearInterval(totalInterval);

        totalInterval = animateCounter(
          animatedTotalScore(),
          Math.floor(animatedTotalScore() + scoreValue),
          setAnimatedTotalScore,
          ANIMATION_DURATION
        );
      }, index * ANIMATION_DELAY);
    }

    onCleanup(() => {
      if (totalInterval) clearInterval(totalInterval);
    });
  });

  return (
    <div
      class="flex w-140 flex-col gap-4 rounded-xl p-6 shadow-xl transition-all"
      style={{
        background: `linear-gradient(90deg, ${getColorVar(props.micColor, 600)}, ${getColorVar(props.micColor, 500)})`,
      }}
    >
      <div class="flex w-full items-center justify-between">
        <div class="flex items-center gap-3">
          <Avatar user={props.player} />
          <div class="font-bold text-lg text-white">{props.player.username}</div>
        </div>
        <div class="font-bold text-3xl text-white">{animatedTotalScore().toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
      </div>

      <div class="flex h-10 w-full overflow-hidden rounded-lg bg-black/20">
        <ScoreBar isAnimated={animated().normal} percentage={getPercentage(props.score.normal)} color={getColorVar(props.micColor, 400)} />
        <ScoreBar isAnimated={animated().golden} percentage={getPercentage(props.score.golden)} color={getColorVar(props.micColor, 300)} />
        <ScoreBar isAnimated={animated().bonus} percentage={getPercentage(props.score.bonus)} color={getColorVar(props.micColor, 50)} />
      </div>

      <div class="grid grid-cols-3 gap-3">
        <ScoreDetail label="Normal" value={animatedScores().normal} color={getColorVar(props.micColor, 400)} />
        <ScoreDetail label="Golden" value={animatedScores().golden} color={getColorVar(props.micColor, 300)} />
        <ScoreDetail label="Bonus" value={animatedScores().bonus} color={getColorVar(props.micColor, 50)} />
      </div>
    </div>
  );
}

function ScoreBar(props: { isAnimated: boolean; percentage: number; color: string }) {
  return (
    <div
      class="flex h-full items-center justify-center font-medium text-white/90 text-xs"
      style={{
        width: `${props.isAnimated ? props.percentage : 0}%`,
        "background-color": props.color,
        transition: `width ${ANIMATION_DURATION}ms ease-in-out`,
      }}
    />
  );
}

function ScoreDetail(props: { label: string; value: number; color: string }) {
  return (
    <div class="flex items-center gap-2 rounded-md bg-black/10 px-3 py-1.5">
      <div class="h-4 w-4 rounded-sm" style={{ "background-color": props.color }} />
      <div class="flex flex-col">
        <span class="text-white/70 text-xs">{props.label}</span>
        <span class="font-medium text-sm text-white">{props.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
      </div>
    </div>
  );
}
