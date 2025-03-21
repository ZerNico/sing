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
import { notify } from "~/lib/toast";

export default function JoinPage() {
  return (
    <>
      <Show when={locale()} keyed>
        {(_) => {
          const JoinFormSchema = v.object({
            code: v.pipe(v.string(), v.length(6, t("form.lobby_code_length", { length: 6 }))),
          });
          type JoinForm = v.InferOutput<typeof JoinFormSchema>;

          const navigate = useNavigate();
          const queryClient = useQueryClient();
          const [joinForm, { Form, Field }] = createForm<JoinForm>({
            initialValues: {
              code: "",
            },
            validate: valiForm(JoinFormSchema),
          });

          const handleSubmit: SubmitHandler<JoinForm> = async (values) => {
            const lobbyCode = values.code.toUpperCase();
            const response = await v1.lobbies[":lobbyId"].join.post({
              params: { lobbyId: lobbyCode },
              credentials: "include",
            });

            if (response.ok) {
              await queryClient.invalidateQueries(profileQueryOptions());
              navigate("/");
              return;
            }

            if (response.status === 404) {
              notify({
                intent: "error",
                message: t("join_lobby.lobby_not_found"),
              });
              return;
            }

            notify({
              intent: "error",
              message: t("error.unknown"),
            });
          };

          return (
            <div class="flex flex-grow flex-col items-center justify-center p-2">
              <Card class="flex w-100 max-w-full flex-col gap-4">
                <h1 class="font-semibold text-xl">{t("join_lobby.title")}</h1>
                <p class="text-slate-500">{t("join_lobby.description")}</p>
                <Form class="flex flex-col gap-4" onSubmit={handleSubmit}>
                  <Field name="code">
                    {(field, props) => (
                      <Input label={t("form.lobby_code")} {...props} maxLength={6} autocomplete="off" errorMessage={field.error} />
                    )}
                  </Field>
                  <Button type="submit" class="mt-4" intent="gradient" loading={joinForm.submitting}>
                    {t("join_lobby.join")}
                  </Button>
                </Form>
              </Card>
            </div>
          );
        }}
      </Show>
    </>
  );
}
