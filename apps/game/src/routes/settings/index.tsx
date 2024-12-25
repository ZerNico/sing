import { useNavigate } from "@solidjs/router";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import { useNavigation } from "~/hooks/navigation";

export default function Settings() {
  const navigate = useNavigate();

  useNavigation(() => ({
    layer: 0,
    onKeydown(event) {},
    onKeyup(event) {
      if (event.action === "back") {
        navigate("/home");
      }
    },
  }));

  return (
    <Layout intent="secondary" footer={<KeyHints hints={["back", "navigate", "confirm"]} />}>
      123
    </Layout>
  );
}
