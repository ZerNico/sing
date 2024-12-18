import { type SubmitHandler, createForm, valiField } from "@modular-forms/solid";
import { useNavigate } from "@solidjs/router";
import * as v from "valibot";
import Button from "~/components/ui/button";
import Card from "~/components/ui/card";
import Input from "~/components/ui/input";
import { v1 } from "~/lib/api";
import { t } from "~/lib/i18n";
import { notify } from "~/lib/toast";

export default function Login() {
  type VerifyEmailForm = {
    code: string;
  };
  const [verifyEmailForm, { Form, Field }] = createForm<VerifyEmailForm>({
    initialValues: {
      code: "",
    },
  });

  const navigate = useNavigate();

  const handleSubmit: SubmitHandler<VerifyEmailForm> = async (values, event) => {
    const response = await v1.auth.verify.post({ body: { code: values.code }, credentials: "include" });

    if (response.ok) {
      navigate("/");
    }

    if (response.status === 400 && response.data.code === "INVALID_CODE") {
      notify({
        message: t("verify_email.invalid_code"),
        intent: "error",
      })
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
          <Field name="code" validate={valiField(v.pipe(v.string(), v.length(6, t("form.code_length", { length: 6 }))))}>
            {(field, props) => <Input maxLength={6} label={t("form.code")} {...props} errorMessage={field.error} />}
          </Field>
          <Button type="submit" class="mt-4" intent="gradient" loading={verifyEmailForm.submitting}>
            {t("verify_email.verify")}
          </Button>
        </Form>
        <p class="text-slate-500 text-sm">
          {t("verify_email.not_received")}{" "}
          <a href="/sign-up" class="text-slate-800">
            {t("verify_email.resend")}
          </a>
        </p>
      </Card>
    </div>
  );
}
