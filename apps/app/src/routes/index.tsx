import { query, redirect } from "@solidjs/router";
import { createEffect, createResource } from "solid-js";
import Header from "~/components/header";
import { v1 } from "~/lib/api";

const getMe = query(async () => {

  const response = await v1.users.me.get({
    credentials: "include",
  });

  await v1.auth.refresh.post({
    credentials: "include",
  });

  if (response.ok) 
    return response.data;

  if (response.status === 401 && response.data.code === "UNAUTHORIZED") {
    throw redirect("/login");
  }
}, "api/v1.0/users/me");

export default function Home() {
  const [me] = createResource(
    async () => {
      return await getMe();
    },
    { deferStream: true }
  );

  createEffect(() => {
    console.log(me());
    
  });

  return (
    <div class="min-h-screen bg-#101024 text-white">
      {JSON.stringify(me())}
      <Header />
      <main class="mx-auto max-w-6xl px-4">App</main>
    </div>
  );
}
