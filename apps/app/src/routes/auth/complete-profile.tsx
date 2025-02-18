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
import { usernameSchema } from "~/lib/schemas";
import { notify } from "~/lib/toast";

export default function CompleteProfilePage() {
  return (
    <Show when={locale()} keyed>
      {(_) => {
        const CompleteProfileSchema = v.object({
          username: usernameSchema,
        });
        type CompleteProfileForm = v.InferOutput<typeof CompleteProfileSchema>;

        const navigate = useNavigate();
        const queryClient = useQueryClient();
        const [searchParams] = useSearchParams<{
          redirect?: string;
        }>();

        const [completeProfileForm, { Form, Field }] = createForm<CompleteProfileForm>({
          initialValues: {
            username: "",
          },
          validate: valiForm(CompleteProfileSchema),
        });

        const handleSubmit: SubmitHandler<CompleteProfileForm> = async (values) => {
          const response = await v1.users.me.patch({ body: values, credentials: "include" });

          if (response.ok) {
            await queryClient.invalidateQueries(profileQueryOptions());
            navigate(searchParams.redirect || "/");
            console.log("redirecting to", searchParams.redirect || "/");
            return;
          }

          if (response.status === 400 && response.data.code === "USER_OR_EMAIL_ALREADY_EXISTS") {
            notify({
              message: t("register.user_already_exists"),
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
          <div class="flex flex-grow flex-col items-center justify-center">
            <Card class="flex w-100 flex-col gap-4">
              <h1 class="font-semibold text-xl">{t("complete_profile.title")}</h1>
              <p class="text-slate-500">{t("complete_profile.description")}</p>
              <Form class="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Field name="username">
                  {(field, props) => <Input label={t("form.username")} {...props} errorMessage={field.error} />}
                </Field>
                <Button type="submit" class="mt-4" intent="gradient" loading={completeProfileForm.submitting}>
                  {t("complete_profile.save")}
                </Button>
              </Form>
            </Card>
          </div>
        );
      }}
    </Show>
  );
}
