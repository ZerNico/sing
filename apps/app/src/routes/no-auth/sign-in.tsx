import { type SubmitHandler, createForm, valiForm } from "@modular-forms/solid";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import { Show } from "solid-js";
import { withQuery } from "ufo";
import * as v from "valibot";
import DiscordLogin from "~/components/discord-login";
import GoogleLogin from "~/components/google-login";
import Button from "~/components/ui/button";
import Card from "~/components/ui/card";
import Input from "~/components/ui/input";
import { v1 } from "~/lib/api";
import { locale, t } from "~/lib/i18n";
import { profileQueryOptions } from "~/lib/queries";
import { passwordSchema } from "~/lib/schemas";
import { notify } from "~/lib/toast";

export default function LoginPage() {
  return (
    <Show when={locale()} keyed>
      {(_) => {
        const LoginFormSchema = v.object({
          login: v.pipe(v.string(), v.trim(), v.maxLength(128)),
          password: passwordSchema,
        });
        type LoginForm = v.InferOutput<typeof LoginFormSchema>;

        const [loginForm, { Form, Field }] = createForm<LoginForm>({
          initialValues: {
            login: "",
            password: "",
          },
          validate: valiForm(LoginFormSchema),
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
              message: t("login.invalid_credentials"),
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
                <Field name="login">
                  {(field, props) => <Input autocomplete="username" label={t("form.login")} {...props} errorMessage={field.error} />}
                </Field>
                <Field name="password">
                  {(field, props) => (
                    <Input
                      autocomplete="current-password"
                      type="password"
                      label={t("form.password")}
                      {...props}
                      errorMessage={field.error}
                    />
                  )}
                </Field>
                <div class="flex flex-col gap-2">
                  <Button type="submit" class="mt-4" intent="gradient" loading={loginForm.submitting}>
                    {t("login.sign_in")}
                  </Button>
                  <a href="/forgot-password" class="text-slate-500 text-sm hover:text-slate-800">
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
      }}
    </Show>
  );
}
