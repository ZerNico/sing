import * as v from "valibot";
import { t } from "./i18n";

export const usernameSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(3, t("form.username_min_length", { length: 3 })),
  v.maxLength(20, t("form.username_max_length", { length: 20 })),
  v.regex(/^[a-zA-Z0-9]+$/, t("form.username_invalid")),
);
export const emailSchema = v.pipe(
  v.string(),
  v.trim(),
  v.email(t("form.email_invalid")),
  v.maxLength(128, t("form.email_max_length", { length: 128 })),
);
export const passwordSchema = v.pipe(
  v.string(),
  v.minLength(6, t("form.password_min_length", { length: 6 })),
  v.maxLength(128, t("form.password_max_length", { length: 128 })),
);
