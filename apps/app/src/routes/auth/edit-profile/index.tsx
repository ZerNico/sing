import { type SubmitHandler, createForm, valiField } from "@modular-forms/solid";
import { useQueryClient } from "@tanstack/solid-query";
import { Show, createSignal } from "solid-js";
import * as v from "valibot";
import Avatar from "~/components/ui/avatar";
import Button from "~/components/ui/button";
import Card from "~/components/ui/card";
import Input from "~/components/ui/input";
import { v1 } from "~/lib/api";
import { useAuth } from "~/lib/auth";
import { t } from "~/lib/i18n";
import { profileQueryOptions } from "~/lib/queries";
import { notify } from "~/lib/toast";
import IconPencilLine from "~icons/lucide/pencil-line";

export default function EditProfilePage() {
  const { profile } = useAuth();

  return (
    <Show when={profile()}>
      {(user) => {
        type ProfileForm = {
          username: string;
        };

        const [profileForm, { Form, Field }] = createForm<ProfileForm>({
          initialValues: {
            username: user().username ?? "",
          },
        });

        const queryClient = useQueryClient();
        const [fileInputElement, setFileInputElement] = createSignal<HTMLInputElement | null>(null);
        const [file, setFile] = createSignal<File | null>(null);

        const handleSubmit: SubmitHandler<ProfileForm> = async (values) => {
          const body = {
            ...values,
            picture: file() ?? undefined,
          };

          const response = await v1.users.me.patch({ body: body, credentials: "include" });

          if (response.ok) {
            await queryClient.invalidateQueries(profileQueryOptions());
            notify({
              message: t("edit_profile.success"),
              intent: "success",
            });

            setFile(null);

            return;
          }

          if (response.status === 400 && response.data.code === "USER_OR_EMAIL_ALREADY_EXISTS") {
            notify({
              message: t("edit_profile.user_already_exists"),
              intent: "error",
            });
            return;
          }

          notify({
            message: t("error.unknown"),
            intent: "error",
          });
        };

        const handleFileChange = async (event: Event) => {
          const input = event.target as HTMLInputElement;
          const file = input.files?.[0];
          if (!file) return;

          setFile(file);
        };

        const fileUrl = () => {
          const f = file();
          if (!f) {
            return;
          }

          return URL.createObjectURL(f);
        };

        return (
          <div class="flex flex-grow flex-col items-center justify-center">
            <Card class="flex w-100 flex-col gap-4">
              <h1 class="font-semibold text-xl">{t("edit_profile.title")}</h1>
              <div class="flex justify-center">
                <button class="relative transition-opacity hover:opacity-75" type="button" onClick={() => fileInputElement()?.click()}>
                  <input
                    ref={setFileInputElement}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileChange}
                    class="hidden"
                  />
                  <Show when={file()} fallback={<Avatar class="h-30 w-30" user={user()} />}>
                    <img src={fileUrl()} alt="" class="h-30 w-30 rounded-full" />
                  </Show>
                  <div class="absolute right-1 bottom-1 rounded-full bg-slate-800 p-1.5 text-white text-xs">
                    <IconPencilLine />
                  </div>
                </button>
              </div>
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
                  {(field, props) => <Input value={field.value} label={t("edit_profile.username")} {...props} errorMessage={field.error} />}
                </Field>

                <div class="flex flex-col gap-2">
                  <Button type="submit" class="" intent="gradient" loading={profileForm.submitting}>
                    {t("edit_profile.save")}
                  </Button>
                  <Button href="/edit-profile/password" type="button" class="">
                    {t("edit_profile.change_password")}
                  </Button>
                </div>
              </Form>
            </Card>
          </div>
        );
      }}
    </Show>
  );
}
