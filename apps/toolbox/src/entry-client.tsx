// @refresh reload
import { StartClient, mount } from "@solidjs/start/client";

// biome-ignore lint/style/noNonNullAssertion: This is fine
mount(() => <StartClient />, document.getElementById("app")!);
