import { queryOptions } from "@tanstack/solid-query";
import { useLobbyStore } from "~/stores/lobby";
import { v1 } from "./api";
import { ApiError } from "./error";

export function lobbyQueryOptions() {
  return queryOptions({
    refetchInterval: 5000, // 5 seconds
    queryKey: ["v1", "lobby"],
    retry: false,
    queryFn: async () => {
      const lobbyStore = useLobbyStore();
      if (!lobbyStore.lobby()) {
        return null;
      }

      const response = await v1.lobbies.current.get();

      if (response.ok) {
        return response.data;
      }

      throw new ApiError({ code: response.data.code });
    },
  });
}
