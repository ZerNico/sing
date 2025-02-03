import { type SubmitHandler, createForm, valiField } from "@modular-forms/solid";
import { useNavigate } from "@solidjs/router";
import * as v from "valibot";
import Button from "~/components/ui/button";
import Card from "~/components/ui/card";
import Input from "~/components/ui/input";
import { v1 } from "~/lib/api";
import { t } from "~/lib/i18n";
import { notify } from "~/lib/toast";

type ForgotPasswordForm = {
  email: string;
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [forgotPasswordForm, { Form, Field }] = createForm<ForgotPasswordForm>({
    initialValues: {
      email: "",
    },
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
          <Field
            name="email"
            validate={valiField(
              v.pipe(v.string(), v.email(t("form.email_invalid")), v.maxLength(128, t("form.email_max_length", { length: 128 })))
            )}
          >
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
}
