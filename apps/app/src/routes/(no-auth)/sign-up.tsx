import { type SubmitHandler, createForm, valiField } from "@modular-forms/solid";
import { useNavigate } from "@solidjs/router";
import * as v from "valibot";
import Button from "~/components/ui/button";
import Card from "~/components/ui/card";
import Input from "~/components/ui/input";
import { v1 } from "~/lib/api";
import { t } from "~/lib/i18n";
import { notify } from "~/lib/toast";
import DiscordIcon from "~icons/logos/discord-icon";
import GoogleIcon from "~icons/logos/google-icon";

export default function Login() {
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

  const handleSubmit: SubmitHandler<RegisterForm> = async (values) => {
    const response = await v1.auth.register.post({ body: values, credentials: "include" });

    if (response.ok) {
      navigate("/verify-email");
      return;
    }

    if (response.status === 400 && response.data.code === "USER_OR_EMAIL_ALREADY_EXISTS") {
      notify({
        title: "Error",
        message: t("register.user_or_email_already_exists"),
        intent: "error",
      });
      return;
    }

    notify({
      title: "Error",
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
            {(field, props) => <Input label={t("form.username")} {...props} errorMessage={field.error} />}
          </Field>
          <Field
            name="email"
            validate={valiField(
              v.pipe(v.string(), v.email(t("form.email_invalid")), v.maxLength(128, t("form.email_max_length", { length: 128 })))
            )}
          >
            {(field, props) => <Input label={t("form.email")} {...props} errorMessage={field.error} />}
          </Field>
          <Field
            name="password"
            validate={valiField(
              v.pipe(v.string(), v.nonEmpty(t("form.password_required")), v.maxLength(128, t("form.password_max_length", { length: 128 })))
            )}
          >
            {(field, props) => <Input type="password" label={t("form.password")} {...props} errorMessage={field.error} />}
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

        <div class="flex gap-4">
          <Button class="flex-1">
            <GoogleIcon class="text-sm" /> Google
          </Button>
          <Button class="flex-1">
            <DiscordIcon class="text-sm" />
            Discord
          </Button>
        </div>

        <p class="text-slate-500 text-sm">
          {t("register.already_have_an_account")}{" "}
          <a href="/sign-in" class="text-slate-800">
            {t("register.sign_in")}
          </a>
        </p>
      </Card>
    </div>
  );
}
