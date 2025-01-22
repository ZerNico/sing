import { type SubmitHandler, createForm, valiField } from "@modular-forms/solid";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import { withQuery } from "ufo";
import * as v from "valibot";
import DiscordLogin from "~/components/discord-login";
import GoogleLogin from "~/components/google-login";
import Button from "~/components/ui/button";
import Card from "~/components/ui/card";
import Input from "~/components/ui/input";
import { v1 } from "~/lib/api";
import { t } from "~/lib/i18n";
import { profileQueryOptions } from "~/lib/queries";
import { notify } from "~/lib/toast";

export default function RegisterPage() {
  type RegisterForm = {
    username: string;
    email: string;
    password: string;
  };
  const [registerForm, { Form, Field }] = createForm<RegisterForm>({
    initialValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams<{
    redirect?: string;
  }>();
  const queryClient = useQueryClient();

  const handleSubmit: SubmitHandler<RegisterForm> = async (values) => {
    const response = await v1.auth.register.post({ body: values, credentials: "include" });

    if (response.ok) {
      await queryClient.invalidateQueries(profileQueryOptions());
      navigate(searchParams.redirect || "/");
      return;
    }

    if (response.status === 400) {
      notify({
        message: t("login.invalid_username_or_password"),
        intent: "error",
      });
      return;
    }

    notify({
      message: t("error.unknown"),
      intent: "error",
    });
  };

  return (
    <div class="flex flex-grow flex-col items-center justify-center">
      <Card class="flex w-100 flex-col gap-4">
        <h1 class="font-semibold text-xl">{t("register.title")}</h1>
        <Form class="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field
            name="username"
            validate={valiField(
              v.pipe(
                v.string(),
                v.minLength(3, t("form.username_min_length", { length: 3 })),
                v.maxLength(20, t("form.username_max_length", { length: 20 }))
              )
            )}
          >
            {(field, props) => <Input autocomplete="username" label={t("form.username")} {...props} errorMessage={field.error} />}
          </Field>
          <Field
            name="email"
            validate={valiField(
              v.pipe(v.string(), v.email(t("form.email_invalid")), v.maxLength(128, t("form.email_max_length", { length: 128 })))
            )}
          >
            {(field, props) => <Input autocomplete="email" type="email" label={t("form.email")} {...props} errorMessage={field.error} />}
          </Field>
          <Field
            name="password"
            validate={valiField(
              v.pipe(
                v.string(),
                v.minLength(6, t("form.password_min_length", { length: 6 })),
                v.maxLength(128, t("form.password_max_length", { length: 128 }))
              )
            )}
          >
            {(field, props) => (
              <Input autocomplete="current-password" type="password" label={t("form.password")} {...props} errorMessage={field.error} />
            )}
          </Field>
          <Button type="submit" class="mt-4" intent="gradient" loading={registerForm.submitting}>
            {t("register.sign_up")}
          </Button>
        </Form>
        <div class="flex items-center gap-2 text-slate-400">
          <div class="h-0.5 flex-1 rounded-full bg-slate-400" />
          {t("register.or")}
          <div class="h-0.5 flex-1 rounded-full bg-slate-400" />
        </div>

        <div class="flex flex-wrap gap-4">
          <GoogleLogin />
          <DiscordLogin />
        </div>

        <p class="text-slate-500 text-sm">
          {t("register.already_have_an_account")}{" "}
          <a
            href={withQuery("/sign-in", {
              redirect: searchParams.redirect,
            })}
            class="text-slate-800"
          >
            {t("register.sign_in")}
          </a>
        </p>
      </Card>
    </div>
  );
}
