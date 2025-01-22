import { queryOptions } from "@tanstack/solid-query";
import { v1 } from "./api";
import { ApiError } from "./error";

export function profileQueryOptions() {
  return queryOptions({
    queryKey: ["v1", "me"],
    retry: false,
    queryFn: async () => {
      const response = await v1.users.me.get({ credentials: "include" });

      if (response.ok) {
        return response.data;
      }

      throw new ApiError({ code: response.data.code });
    },
  });
}
