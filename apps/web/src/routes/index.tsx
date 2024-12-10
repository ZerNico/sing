import Button from "~/components/button";
import Header from "~/components/header";

export default function Home() {
  return (
    <div class="min-h-screen bg-#101024 text-white">
      <Header />
      <main class="mx-auto max-w-6xl px-4">
        <div class="relative z-2 flex min-h-80 flex-col items-center justify-center gap-8">
          <h1 class="inline-block bg-gradient-to-b from-teal-600 to-spearmint-400 bg-clip-text text-center font-bold text-4xl text-transparent md:text-5xl">
            Tune Perfect
          </h1>
          <p>The modern karaoke game.</p>
          <div class="flex w-auto flex-col gap-2 md:flex-row">
            <Button href="https://github.com/ZerNico/sing/releases" intent="gradient">
              Download
            </Button>
            <Button href={import.meta.env.VITE_APP_URL} intent="outline">
              Join Lobby
            </Button>
          </div>
        </div>

        <div class="relative z-0">
          <img src="/images/game.png" class="relative z-2 w-full" alt="Screenshot of Tune Perfect home" />
          <div class="absolute inset-0 bg-#1e244b blur-150">123</div>
        </div>
      </main>
    </div>
  );
}
