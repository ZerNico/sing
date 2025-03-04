import { useNavigate } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import Menu, { type MenuItem } from "~/components/menu";
import TitleBar from "~/components/title-bar";
import { lobbyQueryOptions } from "~/lib/queries";

export default function LobbyPage() {
  const navigate = useNavigate();
  const onBack = () => navigate("/home");

  const lobbyQuery = createQuery(() => lobbyQueryOptions());

  const menuItems: Accessor<MenuItem[]> = () => {
    return (
      lobbyQuery.data?.users.map((user) => ({
        type: "button",
        label: user.username ?? "?",
        action: () => navigate(`/lobby/${user.id}`),
      })) ?? []
    );
  };

  return (
    <Layout
      intent="secondary"
      header={<TitleBar title="Lobby" onBack={onBack} />}
      footer={<KeyHints hints={["back", "navigate", "confirm"]} />}
    >
      <Menu items={menuItems()} onBack={onBack} gradient="gradient-lobby" />
    </Layout>
  );
}
