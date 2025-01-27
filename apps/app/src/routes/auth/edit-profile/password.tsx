import { type SubmitHandler, createForm, valiField } from "@modular-forms/solid";
import { useNavigate } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import * as v from "valibot";
import Button from "~/components/ui/button";
import Card from "~/components/ui/card";
import Input from "~/components/ui/input";
import { v1 } from "~/lib/api";
import { t } from "~/lib/i18n";
import { profileQueryOptions } from "~/lib/queries";
import { notify } from "~/lib/toast";

export default function EditPasswordPage() {
  type PasswordForm = {
    password: string;
  };

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [passwordForm, { Form, Field }] = createForm<PasswordForm>({
    initialValues: {
      password: "",
    },
  });

  const handleSubmit: SubmitHandler<PasswordForm> = async (values) => {
    const response = await v1.users.me.patch({
      body: values,
      credentials: "include",
    });

    if (response.ok) {
      await queryClient.invalidateQueries(profileQueryOptions());
      notify({
        intent: "success",
        message: t("edit_password.success"),
      });
      navigate("/edit-profile");
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
        <h1 class="font-semibold text-xl">{t("edit_password.title")}</h1>
        <Form class="flex flex-col gap-8" onSubmit={handleSubmit}>
          <div>
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
              {(field, props) => <Input type="password" label={t("edit_password.new_password")} {...props} errorMessage={field.error} />}
            </Field>
          </div>

          <Button type="submit" intent="gradient" loading={passwordForm.submitting}>
            {t("edit_password.save")}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
