import { type SubmitHandler, createForm, valiForm } from "@modular-forms/solid";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { Show } from "solid-js";
import * as v from "valibot";
import Button from "~/components/ui/button";
import Card from "~/components/ui/card";
import Input from "~/components/ui/input";
import { v1 } from "~/lib/api";
import { locale, t } from "~/lib/i18n";
import { getPasswordSchema } from "~/lib/schemas";
import { notify } from "~/lib/toast";

export default function ResetPasswordPage() {
  return (
    <Show when={locale()} keyed>
      {(_) => {
        const ResetPasswordSchema = v.pipe(
          v.object({
            code: v.pipe(v.string(), v.length(8, t("form.code_length", { length: 8 }))),
            password: getPasswordSchema(),
            repeatPassword: getPasswordSchema(),
          }),
          v.forward(
            v.partialCheck(
              [["password"], ["repeatPassword"]],
              (input) => input.password === input.repeatPassword,
              t("form.password_mismatch")
            ),
            ["repeatPassword"]
          )
        );
        type ResetPasswordForm = v.InferOutput<typeof ResetPasswordSchema>;

        const navigate = useNavigate();
        const [searchParams] = useSearchParams<{ code?: string }>();

        const [resetPasswordForm, { Form, Field }] = createForm<ResetPasswordForm>({
          initialValues: {
            code: searchParams.code ?? "",
            password: "",
          },
          validate: valiForm(ResetPasswordSchema),
        });

        const handleSubmit: SubmitHandler<ResetPasswordForm> = async (values) => {
          const response = await v1.auth.reset.post({
            body: values,
            credentials: "include",
          });

          if (response.ok) {
            notify({
              message: t("auth.reset_password.success_description"),
              intent: "success",
            });
            navigate("/sign-in");
            return;
          }

          if (response.status === 400 && response.data.code === "INVALID_CODE") {
            notify({
              message: t("auth.reset_password.invalid_code_description"),
              intent: "error",
            });
            return;
          }

          notify({
            message: t("auth.reset_password.error_description"),
            intent: "error",
          });
        };

        return (
          <div class="flex flex-grow flex-col items-center justify-center p-2">
            <Card class="flex w-100 max-w-full flex-col gap-4">
              <h1 class="font-semibold text-xl">{t("auth.reset_password.title")}</h1>
              <p class="text-slate-500">{t("auth.reset_password.description")}</p>
              <Form class="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Field name="code">
                  {(field, props) => (
                    <Input value={field.value} label={t("auth.reset_password.code")} {...props} maxLength={8} errorMessage={field.error} />
                  )}
                </Field>

                <Field name="password">
                  {(field, props) => (
                    <Input
                      autocomplete="new-password"
                      value={field.value}
                      type="password"
                      label={t("form.password")}
                      {...props}
                      errorMessage={field.error}
                    />
                  )}
                </Field>

                <Field name="repeatPassword">
                  {(field, props) => (
                    <Input
                      autocomplete="new-password"
                      value={field.value}
                      type="password"
                      label={t("form.repeat_password")}
                      {...props}
                      errorMessage={field.error}
                    />
                  )}
                </Field>

                <Button type="submit" class="mt-4" intent="gradient" loading={resetPasswordForm.submitting}>
                  {resetPasswordForm.submitting ? t("auth.reset_password.loading") : t("auth.reset_password.submit")}
                </Button>
              </Form>
              <p class="text-slate-500 text-sm">
                {t("auth.reset_password.no_code")}{" "}
                <a href="/forgot-password" class="text-slate-800">
                  {t("auth.reset_password.request_code")}
                </a>
              </p>
            </Card>
          </div>
        );
      }}
    </Show>
  );
}
