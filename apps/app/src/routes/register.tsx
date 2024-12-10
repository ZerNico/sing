import { createSignal } from "solid-js";
import Header from "~/components/header";
import { v1 } from "~/lib/api";

export default function Register() {
  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");

  return (
    <div class="min-h-screen bg-#101024 text-white">
      <Header />
      <main class="mx-auto max-w-6xl px-4">
        Login
        <form
          class="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();

            v1.auth.register.post({ body: { username: username(), password: password() } });
          }}
        >
          <input
            type="text"
            placeholder="Username"
            class="block w-full rounded border border-gray-300 p-2 text-black"
            value={username()}
            onInput={(e) => setUsername(e.currentTarget.value)}
          />
          <input
            type="password"
            placeholder="Password"
            class="block w-full rounded border border-gray-300 p-2"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
          />
          <button type="submit" class="block w-full rounded bg-blue-500 p-2 text-white">
            Login
          </button>
        </form>
      </main>
    </div>
  );
}
