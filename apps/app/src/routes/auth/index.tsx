import { Key } from "@solid-primitives/keyed";
import { createQuery } from "@tanstack/solid-query";
import Avatar from "~/components/ui/avatar";
import { lobbyQueryOptions } from "~/lib/queries";

export default function IndexPage() {
  const lobbyQuery = createQuery(() => lobbyQueryOptions());

  return (
    <div class="flex flex-grow flex-col items-center justify-center gap-2">
      <Key each={lobbyQuery.data?.users} by={(user) => user.id}>
        {(user) => (
          <div class="flex w-80 items-center gap-2 rounded-lg bg-white p-2 text-slate-800">
            <Avatar class="flex-shrink-0" src={user().picture || undefined} fallback={user().username || undefined} />
            <div>{user().username}</div>
          </div>
        )}
      </Key>
    </div>
  );
}
