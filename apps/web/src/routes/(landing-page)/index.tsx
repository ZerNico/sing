import Button from "~/components/button";

export default function Home() {
  return (
    <div>
      <div class="relative z-2 flex min-h-80 flex-col items-center justify-center gap-8">
        <h1 class="inline-block bg-gradient-to-b from-teal-600 to-spearmint-400 bg-clip-text text-center font-bold text-4xl text-transparent md:text-5xl">
          Tune Perfect
        </h1>
        <p>The modern karaoke game.</p>
        <div class="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
          <Button href="https://github.com/ZerNico/sing/releases" intent="gradient" class="w-full sm:w-auto">
            Download
          </Button>
          <Button href="/app" intent="outline" class="w-full sm:w-auto">
            Join Lobby
          </Button>
        </div>
      </div>

      <div class="relative z-0">
        <img src="/images/game.png" class="relative z-2 w-full" alt="Screenshot of Tune Perfect home" />
        <div class="absolute inset-0 bg-#1e244b blur-150">123</div>
      </div>
    </div>
  );
}
