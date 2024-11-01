// @refresh reload
import { StartClient, mount } from "@solidjs/start/client";

// biome-ignore lint/style/noNonNullAssertion: Can be ignored because we know the element exists
mount(() => <StartClient />, document.getElementById("app")!);
