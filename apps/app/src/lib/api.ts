import { client } from "@nokijs/client";
import type { App } from "api";

const api = client<App>(import.meta.env.VITE_API_URL);

export const v1 = api["v1.0"];
