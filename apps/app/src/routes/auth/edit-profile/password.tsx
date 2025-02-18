import { type SubmitHandler, createForm, valiForm } from "@modular-forms/solid";
import { useNavigate } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import { Show } from "solid-js";
import * as v from "valibot";
import Button from "~/components/ui/button";
import Card from "~/components/ui/card";
import Input from "~/components/ui/input";
import { v1 } from "~/lib/api";
import { locale, t } from "~/lib/i18n";
import { profileQueryOptions } from "~/lib/queries";
import { passwordSchema } from "~/lib/schemas";
import { notify } from "~/lib/toast";

export default function EditPasswordPage() {
  return (
    <Show when={locale()} keyed>
      {(_) => {
        const PasswordFormSchema = v.pipe(
          v.object({
            password: passwordSchema,
            repeatPassword: passwordSchema,
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
        type PasswordForm = v.InferOutput<typeof PasswordFormSchema>;

        const navigate = useNavigate();
        const queryClient = useQueryClient();
        const [passwordForm, { Form, Field }] = createForm<PasswordForm>({
          initialValues: {
            password: "",
            repeatPassword: "",
          },
          validate: valiForm(PasswordFormSchema),
        });

        const handleSubmit: SubmitHandler<PasswordForm> = async (values) => {
          const response = await v1.users.me.patch({
            body: { password: values.password },
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
          <div class="flex flex-grow flex-col items-center justify-center p-2">
            <Card class="flex w-100 max-w-full flex-col gap-4">
              <h1 class="font-semibold text-xl">{t("edit_password.title")}</h1>
              <Form class="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Field name="password">
                  {(field, props) => (
                    <Input
                      autocomplete="new-password"
                      type="password"
                      label={t("edit_password.new_password")}
                      {...props}
                      errorMessage={field.error}
                    />
                  )}
                </Field>
                <Field name="repeatPassword">
                  {(field, props) => (
                    <Input
                      autocomplete="new-password"
                      type="password"
                      label={t("form.repeat_password")}
                      {...props}
                      errorMessage={field.error}
                    />
                  )}
                </Field>
                <Button type="submit" class="mt-4" intent="gradient" loading={passwordForm.submitting}>
                  {t("edit_password.save")}
                </Button>
              </Form>
            </Card>
          </div>
        );
      }}
    </Show>
  );
}
