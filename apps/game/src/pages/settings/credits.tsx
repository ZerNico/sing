import { useNavigate } from "@solidjs/router";
import { open } from "@tauri-apps/plugin-shell";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import Menu, { type MenuItem } from "~/components/menu";
import TitleBar from "~/components/title-bar";

export default function CreditsPage() {
  const navigate = useNavigate();
  const onBack = () => navigate("/settings");

  const menuItems: MenuItem[] = [
    {
      type: "button",
      label: "UltraStar Play",
      action: () => open("https://ultrastar-play.com"),
    },
    {
      type: "button",
      label: "Karol Szcześniak",
    },
  ];

  return (
    <Layout
      intent="secondary"
      header={<TitleBar title="Credits" onBack={onBack} />}
      footer={<KeyHints hints={["back", "navigate", "confirm"]} />}
    >
      <Menu items={menuItems} onBack={onBack} />
    </Layout>
  );
}
