import type { AppRouter } from "api/src/types";
import { createTRPCProxyClient, httpBatchLink, CreateTRPCProxyClient } from "@trpc/client";
import SuperJSON from "superjson";

const client: CreateTRPCProxyClient<AppRouter> = createTRPCProxyClient<AppRouter>({
  transformer: SuperJSON,
  links: [
    httpBatchLink({
      url: import.meta.env.RENDERER_VITE_API_URL,
    }),
  ],
});

export const useTRPC = (): { client: CreateTRPCProxyClient<AppRouter> } => {
  return { client };
};
