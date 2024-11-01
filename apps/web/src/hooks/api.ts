import { client } from "@nokijs/client";
import type { App } from "api";


const api = client<App>("http://localhost:4000/api/v1.0");

export const apiV1 = api.api["v1.0"];

export default function useApi() {
  return api.api["v1.0"]
}