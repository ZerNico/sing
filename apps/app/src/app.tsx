import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import "@fontsource-variable/inter";
import "./assets/styles.scss";

import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import { Suspense } from "solid-js";
import { ToastRegion } from "./components/ui/toast";

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
              <div class="gradient-bg-secondary flex min-h-100dvh flex-col font-primary text-white">{props.children}</div>

              <ToastRegion />
            </Suspense>
          </>
        )}
      >
        <FileRoutes />
      </Router>
    </QueryClientProvider>
  );
}
