import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import TitleBar from "~/components/title-bar";

export default function Score() {
  return (
    <Layout
      intent="secondary"
      header={<TitleBar title="Settings" description={"Microphones"} />}
      footer={<KeyHints hints={["confirm"]} />}
    >
      <div>Score</div>
    </Layout>
  );
}
