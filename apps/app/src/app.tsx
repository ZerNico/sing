import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import "@fontsource-variable/inter";
import "./assets/styles.scss";

import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import { Suspense } from "solid-js";
import Header from "./components/header";

export default function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 5000,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <SolidQueryDevtools />

      <Router
        root={(props) => (
          <>
            <Suspense>
              <div class="min-h-100dvh bg-night-950 font-primary text-white">{props.children}</div>
            </Suspense>
          </>
        )}
      >
        <FileRoutes />
      </Router>
    </QueryClientProvider>
  );
}
