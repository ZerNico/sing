import { queryOptions } from "@tanstack/solid-query";
import { lobbyStore } from "~/stores/lobby";
import { v1 } from "./api";
import { ApiError } from "./error";

export function lobbyQueryOptions() {
  return queryOptions({
    refetchInterval: 5000, // 5 seconds
    queryKey: ["v1", "lobby"],
    retry: false,
    queryFn: async () => {
      if (!lobbyStore.lobby()) {
        return null;
      }

      const response = await v1.lobbies.current.get();

      if (response.ok) {
        return response.data;
      }

      throw new ApiError({ code: response.data.code, status: response.status });
    },
  });
}

export function highscoresQueryOptions(hash: string) {
  return queryOptions({
    queryKey: ["v1", "highscores", hash],
    queryFn: async () => {
      const response = await v1.highscores[":hash"].get({ params: { hash } });

      if (!response.ok) {
        throw new ApiError({ code: response.data.code, status: response.status });
      }

      return response.data;
    },
  });
}
