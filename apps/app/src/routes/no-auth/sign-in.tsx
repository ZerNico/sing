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

export default function LoginPage() {
  type LoginForm = {
    username: string;
    password: string;
  };
  const [loginForm, { Form, Field }] = createForm<LoginForm>({
    initialValues: {
      username: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams<{
    redirect?: string;
  }>();
  const queryClient = useQueryClient();

  const handleSubmit: SubmitHandler<LoginForm> = async (values) => {
    const response = await v1.auth.login.post({ body: values, credentials: "include" });

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
    <div class="flex flex-grow flex-col items-center justify-center p-2">
      <Card class="flex w-100 max-w-full flex-col gap-4">
        <h1 class="font-semibold text-xl">{t("login.title")}</h1>
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
            name="password"
            validate={valiField(
              v.pipe(v.string(), v.nonEmpty(t("form.password_required")), v.maxLength(128, t("form.password_max_length", { length: 128 })))
            )}
          >
            {(field, props) => (
              <Input autocomplete="current-password" type="password" label={t("form.password")} {...props} errorMessage={field.error} />
            )}
          </Field>
          <div class="flex flex-col gap-2">
            <Button type="submit" class="mt-4" intent="gradient" loading={loginForm.submitting}>
              {t("login.sign_in")}
            </Button>
            <a href="/forgot-password" class="text-sm text-slate-500 hover:text-slate-800">
              {t("login.forgot_password")}
            </a>
          </div>
        </Form>
        <div class="flex items-center gap-2 text-slate-400">
          <div class="h-0.5 flex-1 rounded-full bg-slate-400" />
          {t("login.or")}
          <div class="h-0.5 flex-1 rounded-full bg-slate-400" />
        </div>

        <div class="flex flex-wrap gap-4">
          <GoogleLogin />
          <DiscordLogin />
        </div>

        <p class="text-slate-500 text-sm">
          {t("login.no_account")}{" "}
          <a
            href={withQuery("/sign-up", {
              redirect: searchParams.redirect,
            })}
            class="text-slate-800"
          >
            {t("login.sign_up")}
          </a>
        </p>
      </Card>
    </div>
  );
}
