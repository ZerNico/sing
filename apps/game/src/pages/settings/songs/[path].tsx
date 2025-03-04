import { useNavigate, useParams } from "@solidjs/router";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import Menu, { type MenuItem } from "~/components/menu";
import TitleBar from "~/components/title-bar";
import { songsStore } from "~/stores/songs";

export default function SongPathSettings() {
  const navigate = useNavigate();

  const onBack = () => navigate("/settings/songs");

  const params = useParams<{ path: string }>();
  const path = () => decodeURIComponent(params.path);

  const removePath = () => {
    songsStore.removeSongPath(path());
    onBack();
  };

  const menuItems: MenuItem[] = [
    {
      type: "button",
      label: "Remove",
      action: removePath,
    },
  ];

  return (
    <Layout
      intent="secondary"
      header={<TitleBar title="Settings" description={`Songs / ${path()}`} onBack={onBack} />}
      footer={<KeyHints hints={["back", "navigate", "confirm"]} />}
    >
      <Menu items={menuItems} onBack={onBack} />
    </Layout>
  );
}
