import { createSignal } from "solid-js";
import Header from "~/components/header";
import { useGoogleOAuth } from "~/hooks/auth";
import { v1 } from "~/lib/api";

export default function Login() {
  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");

  const googleOauth = useGoogleOAuth();

  return <div>123</div>;
}
