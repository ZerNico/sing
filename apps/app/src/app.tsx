import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { type JSX, Suspense } from "solid-js";
import "@fontsource/lato/300.css";
import "@fontsource/lato/400.css";
import "@fontsource/lato/700.css";
import { ToastRegion } from "./components/ui/toast";

interface AppProps {
  children?: JSX.Element;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 1, // 1 minute
    },
  },
});

export default function App(props: AppProps) {
  return (
    <div class="gradient-bg-secondary flex min-h-[100dvh] flex-col font-primary text-white">
      <Suspense>
        <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
      </Suspense>
      <ToastRegion />
    </div>
  );
}
