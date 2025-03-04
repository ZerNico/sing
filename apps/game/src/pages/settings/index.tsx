import { useNavigate } from "@solidjs/router";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import Menu, { type MenuItem } from "~/components/menu";
import TitleBar from "~/components/title-bar";

export default function Settings() {
  const navigate = useNavigate();
  const onBack = () => navigate("/home");

  const menuItems: MenuItem[] = [
    {
      type: "button",
      label: "Songs",
      action: () => navigate("/settings/songs"),
    },
    {
      type: "button",
      label: "Microphones",
      action: () => navigate("/settings/microphones"),
    },
    {
      type: "button",
      label: "Volume",
      action: () => navigate("/settings/volume"),
    },
    {
      type: "button",
      label: "Credits",
      action: () => navigate("/settings/credits"),
    },
  ];

  return (
    <Layout
      intent="secondary"
      header={<TitleBar title="Settings" onBack={onBack} />}
      footer={<KeyHints hints={["back", "navigate", "confirm"]} />}
    >
      <Menu items={menuItems} onBack={onBack} />
    </Layout>
  );
}
