import { type SubmitHandler, createForm, valiForm } from "@modular-forms/solid";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import { Show } from "solid-js";
import * as v from "valibot";
import Button from "~/components/ui/button";
import Card from "~/components/ui/card";
import Input from "~/components/ui/input";
import { v1 } from "~/lib/api";
import { locale, t } from "~/lib/i18n";
import { profileQueryOptions } from "~/lib/queries";
import { notify } from "~/lib/toast";

export default function VerifyEmailPage() {
  return (
    <Show when={locale()} keyed>
      {(_) => {
        const VerifyEmailSchema = v.object({
          code: v.pipe(v.string(), v.length(8, t("form.code_length", { length: 8 }))),
        });
        type VerifyEmailForm = v.InferOutput<typeof VerifyEmailSchema>;

        const navigate = useNavigate();
        const queryClient = useQueryClient();
        const [searchParams] = useSearchParams<{
          redirect?: string;
        }>();

        const [verifyEmailForm, { Form, Field }] = createForm<VerifyEmailForm>({
          initialValues: {
            code: "",
          },
          validate: valiForm(VerifyEmailSchema),
        });

        const handleSubmit: SubmitHandler<VerifyEmailForm> = async (values) => {
          const response = await v1.auth.verify.post({ body: { code: values.code }, credentials: "include" });

          if (response.ok) {
            await queryClient.invalidateQueries(profileQueryOptions());
            navigate(searchParams.redirect || "/");
            return;
          }

          if (response.status === 400 && response.data.code === "EMAIL_ALREADY_VERIFIED") {
            navigate(searchParams.redirect || "/");
            return;
          }

          if (response.status === 400 && response.data.code === "INVALID_CODE") {
            notify({
              message: t("verify_email.invalid_code"),
              intent: "error",
            });
            return;
          }

          notify({
            message: t("error.unknown"),
            intent: "error",
          });
        };

        const handleResend = async () => {
          const response = await v1.auth.resend.post({ credentials: "include" });

          if (response.ok) {
            notify({
              message: t("verify_email.email_sent"),
              intent: "success",
            });
            return;
          }

          if (response.status === 429 && response.data.code === "RESEND_RATE_LIMITED") {
            const retryAfter = new Date(response.data.retryAfter);
            const seconds = Math.ceil((retryAfter.getTime() - Date.now()) / 1000);
            notify({
              message: t("verify_email.wait_before_resend", { seconds }),
              intent: "info",
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
              <h1 class="font-semibold text-xl">{t("verify_email.title")}</h1>
              <p class="text-slate-500">{t("verify_email.description")}</p>
              <Form class="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Field name="code">
                  {(field, props) => <Input maxLength={8} label={t("form.code")} {...props} errorMessage={field.error} />}
                </Field>
                <Button type="submit" class="mt-4" intent="gradient" loading={verifyEmailForm.submitting}>
                  {t("verify_email.verify")}
                </Button>
              </Form>
              <p class="text-slate-500 text-sm">
                {t("verify_email.not_received")}{" "}
                <button onClick={handleResend} class="cursor-pointer bg-none text-slate-800" type="button">
                  {t("verify_email.resend")}
                </button>
              </p>
            </Card>
          </div>
        );
      }}
    </Show>
  );
}
