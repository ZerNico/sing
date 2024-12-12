import Avatar from "./avatar";

export default function Header() {
  return (
    <header class="border-white/10 border-b">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div>
          <span class="font-bold text-lg">Tune Perfect</span>
        </div>

        <div>
          <Avatar src="https://tuneperfect.com" />
        </div>
      </div>
    </header>
  );
}
