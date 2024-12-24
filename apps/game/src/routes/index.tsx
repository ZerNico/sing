import { A, useNavigate } from "@solidjs/router";
import Layout from "../components/layout";

export default function Initial() {
  const navigate = useNavigate();
  
  return (
    <Layout intent="secondary">
      <A href="/home">Home</A>
    </Layout>
  );
}
