import { type SubmitHandler, createForm, valiForm } from "@modular-forms/solid";
import { useQueryClient } from "@tanstack/solid-query";
import { Show, createSignal } from "solid-js";
import * as v from "valibot";
import Avatar from "~/components/ui/avatar";
import Button from "~/components/ui/button";
import Card from "~/components/ui/card";
import Input from "~/components/ui/input";
import { v1 } from "~/lib/api";
import { useAuth } from "~/lib/auth";
import { locale, t } from "~/lib/i18n";
import { profileQueryOptions } from "~/lib/queries";
import { notify } from "~/lib/toast";
import IconPencilLine from "~icons/lucide/pencil-line";

export default function EditProfilePage() {
  return (
    <Show when={locale()} keyed>
      {(_) => (
        <Show when={useAuth().profile()}>
          {(user) => {
            const ProfileFormSchema = v.object({
              username: v.pipe(
                v.string(),
                v.minLength(3, t("form.username_min_length", { length: 3 })),
                v.maxLength(20, t("form.username_max_length", { length: 20 }))
              ),
            });
            type ProfileForm = v.InferOutput<typeof ProfileFormSchema>;

            const [profileForm, { Form, Field }] = createForm<ProfileForm>({
              initialValues: {
                username: user().username ?? "",
              },
              validate: valiForm(ProfileFormSchema),
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
              if (!f) return;
              return URL.createObjectURL(f);
            };

            return (
              <div class="flex flex-grow flex-col items-center justify-center p-2">
                <Card class="flex w-100 max-w-full flex-col gap-4">
                  <h1 class="font-semibold text-xl">{t("edit_profile.title")}</h1>
                  <div class="flex justify-center">
                    <button
                      class="relative transition-opacity hover:opacity-75"
                      type="button"
                      onClick={() => fileInputElement()?.click()}
                    >
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
                    <Field name="username">
                      {(field, props) => (
                        <Input
                          value={field.value}
                          label={t("edit_profile.username")}
                          {...props}
                          errorMessage={field.error}
                        />
                      )}
                    </Field>

                    <div class="flex flex-col gap-2">
                      <Button type="submit" intent="gradient" loading={profileForm.submitting}>
                        {t("edit_profile.save")}
                      </Button>
                      <Button href="/edit-profile/password" type="button">
                        {t("edit_profile.change_password")}
                      </Button>
                    </div>
                  </Form>
                </Card>
              </div>
            );
          }}
        </Show>
      )}
    </Show>
  );
}
