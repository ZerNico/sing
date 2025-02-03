import { type SubmitHandler, createForm, valiField } from "@modular-forms/solid";
import { useNavigate, useSearchParams } from "@solidjs/router";
import * as v from "valibot";
import Button from "~/components/ui/button";
import Card from "~/components/ui/card";
import Input from "~/components/ui/input";
import { v1 } from "~/lib/api";
import { t } from "~/lib/i18n";
import { notify } from "~/lib/toast";

type ResetPasswordForm = {
  code: string;
  password: string;
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams<{ code?: string }>();

  const [resetPasswordForm, { Form, Field }] = createForm<ResetPasswordForm>({
    initialValues: {
      code: searchParams.code ?? "",
      password: "",
    },
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
    <div class="flex flex-grow flex-col items-center justify-center">
      <Card class="flex w-100 flex-col gap-4">
        <h1 class="font-semibold text-xl">{t("auth.reset_password.title")}</h1>
        <p class="text-slate-500">{t("auth.reset_password.description")}</p>
        <Form class="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field name="code" validate={valiField(v.pipe(v.string(), v.length(8, t("form.code_length", { length: 8 }))))}>
            {(field, props) => (
              <Input value={field.value} label={t("auth.reset_password.code")} {...props} maxLength={8} errorMessage={field.error} />
            )}
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
              <Input value={field.value} type="password" label={t("form.password")} {...props} errorMessage={field.error} />
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
}
