import { A, useNavigate } from "@solidjs/router";
import { onMount } from "solid-js";
import { withQuery } from "ufo";
import Layout from "../components/layout";

export default function Initial() {
  const navigate = useNavigate();

  onMount(() => {
    navigate(withQuery("/loading", { redirect: "/home" }));
  });

  return (
    <Layout intent="primary">
      <A href="/home">Home</A>
    </Layout>
  );
}
