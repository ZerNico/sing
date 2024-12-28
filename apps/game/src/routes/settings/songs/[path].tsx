import { useNavigate, useParams } from "@solidjs/router";
import { createSignal } from "solid-js";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import TitleBar from "~/components/title-bar";
import Button from "~/components/ui/button";
import { useNavigation } from "~/hooks/navigation";
import { songsStore } from "~/stores/songs";

export default function SongPathSettings() {
  const navigate = useNavigate();
  const [pressed, setPressed] = createSignal(false);

  const onBack = () => navigate("/settings/songs");

  const params = useParams<{ path: string }>();
  const path = () => decodeURIComponent(params.path);

  console.log(songsStore.localSongs, songsStore.paths());
  

  useNavigation(() => ({
    layer: 0,
    onKeydown(event) {
      if (event.action === "back") {
        onBack();
      } else if (event.action === "confirm") {
        setPressed(true);
      }
    },
    onKeyup(event) {
      if (event.action === "confirm") {
        setPressed(false);
        songsStore.removeSongPath(path());
        onBack();
      }
    },
  }));

  const onRemove = () => {
    songsStore.removeSongPath(path());
    onBack();
    console.log(songsStore.localSongs);
    
  };

  return (
    <Layout
      intent="secondary"
      header={<TitleBar title="Settings" description={`Songs / ${path()}`} onBack={onBack} />}
      footer={<KeyHints hints={["back", "navigate", "confirm"]} />}
    >
      <div class="flex w-full flex-grow flex-col justify-center">
        <Button
          selected
          gradient="gradient-settings"
          onClick={() => {
            onRemove();
            onBack();
          }}
          active={pressed()}
        >
          Remove
        </Button>
      </div>
    </Layout>
  );
}
