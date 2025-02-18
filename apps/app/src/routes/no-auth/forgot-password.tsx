import { type SubmitHandler, createForm, valiForm } from "@modular-forms/solid";
import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";
import * as v from "valibot";
import Button from "~/components/ui/button";
import Card from "~/components/ui/card";
import Input from "~/components/ui/input";
import { v1 } from "~/lib/api";
import { locale, t } from "~/lib/i18n";
import { emailSchema } from "~/lib/schemas";
import { notify } from "~/lib/toast";

export default function ForgotPasswordPage() {
  return (
    <Show when={locale()} keyed>
      {(_) => {
        const ForgotPasswordSchema = v.object({
          email: emailSchema,
        });
        type ForgotPasswordForm = v.InferOutput<typeof ForgotPasswordSchema>;

        const navigate = useNavigate();
        const [forgotPasswordForm, { Form, Field }] = createForm<ForgotPasswordForm>({
          initialValues: {
            email: "",
          },
          validate: valiForm(ForgotPasswordSchema),
        });

        const handleSubmit: SubmitHandler<ForgotPasswordForm> = async (values) => {
          const response = await v1.auth["request-reset"].post({ body: values, credentials: "include" });

          if (response.ok) {
            notify({
              message: t("auth.forgot_password.success_description"),
              intent: "success",
            });
            navigate("/reset-password");
            return;
          }

          if (response.status === 429 && response.data.code === "RESET_RATE_LIMITED") {
            notify({
              message: t("auth.forgot_password.rate_limited_description"),
              intent: "error",
            });
            return;
          }

          notify({
            message: t("auth.forgot_password.error_description"),
            intent: "error",
          });
        };

        return (
          <div class="flex flex-grow flex-col items-center justify-center">
            <Card class="flex w-100 flex-col gap-4">
              <h1 class="font-semibold text-xl">{t("auth.forgot_password.title")}</h1>
              <p class="text-slate-500">{t("auth.forgot_password.description")}</p>
              <Form class="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Field name="email">
                  {(field, props) => <Input type="email" label={t("form.email")} {...props} errorMessage={field.error} />}
                </Field>
                <Button type="submit" class="mt-4" intent="gradient" loading={forgotPasswordForm.submitting}>
                  {forgotPasswordForm.submitting ? t("auth.forgot_password.loading") : t("auth.forgot_password.submit")}
                </Button>
              </Form>
              <p class="text-slate-500 text-sm">
                {t("auth.forgot_password.already_have_code")}{" "}
                <a href="/reset-password" class="text-slate-800">
                  {t("auth.forgot_password.reset_password")}
                </a>
              </p>
            </Card>
          </div>
        );
      }}
    </Show>
  );
}
