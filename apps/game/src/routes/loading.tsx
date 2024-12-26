import { useNavigate, useSearchParams } from "@solidjs/router";
import { onMount } from "solid-js";
import Layout from "~/components/layout";
import { loadSongPaths } from "~/stores/songs";
import IconLoaderCircle from "~icons/lucide/loader-circle";

export default function Loading() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams<{
    redirect?: string;
  }>();

  onMount(async () => {
    await loadSongPaths();

    if (searchParams.redirect) {
      navigate(searchParams.redirect);
      return;
    }
    navigate("/home");
  });

  return (
    <Layout intent="secondary">
      <div class="flex flex-grow items-center justify-center">
        <IconLoaderCircle class="animate-spin text-6xl" />
      </div>
    </Layout>
  );
}
