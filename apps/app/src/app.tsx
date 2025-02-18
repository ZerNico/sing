import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { type JSX, Suspense } from "solid-js";

import Footer from "./components/footer";
import Header from "./components/header";
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
        <QueryClientProvider client={queryClient}>
          <Header />
          {props.children}
          <Footer />
        </QueryClientProvider>
      </Suspense>
      <ToastRegion />
    </div>
  );
}
