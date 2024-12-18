import { query, redirect } from "@solidjs/router";
import { v1 } from "./api";

export const getMe = query(async () => {
  const response = await v1.users.me.get({ credentials: "include" });

  return response;
}, "api/v1.0/users/me");

export const requireAuth = query(async () => {
  const user = await getMe();

  if (!user) {
    throw redirect("/login");
  }
  return user;
}, "require-auth");

export const requireNoAuth = query(async () => {
  const user = await getMe();

  if (user) {
    throw redirect("/");
  }
}, "require-no-auth");
