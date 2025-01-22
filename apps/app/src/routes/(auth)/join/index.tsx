import { type SubmitHandler, createForm, valiField } from "@modular-forms/solid";
import { revalidate, useNavigate } from "@solidjs/router";
import * as v from "valibot";
import Button from "~/components/ui/button";
import Card from "~/components/ui/card";
import Input from "~/components/ui/input";
import { v1 } from "~/lib/api";
import { t } from "~/lib/i18n";
import { notify } from "~/lib/toast";

export default function Login() {
  type JoinLobbyForm = {
    code: string;
  };
  const [joinLobbyForm, { Form, Field }] = createForm<JoinLobbyForm>({
    initialValues: {
      code: "",
    },
  });

  const navigate = useNavigate();

  const handleSubmit: SubmitHandler<JoinLobbyForm> = async (values, event) => {
    const response = await v1.lobbies[":lobbyId"].join.post({ params: { lobbyId: values.code }, credentials: "include" });
    await revalidate("api/v1.0/users/me");

    if (response.ok) {
      navigate("/");
      return;
    }

    if (response.status === 404 && response.data.code === "LOBBY_NOT_FOUND") {
      notify({
        message: t("join_lobby.lobby_not_found"),
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
        <h1 class="font-semibold text-xl">{t("join_lobby.title")}</h1>
        <p class="text-slate-500">{t("join_lobby.description")}</p>
        <Form class="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field
            name="code"
            validate={valiField(v.pipe(v.string(), v.length(6, t("form.lobby_code_length", { length: 6 })), v.toUpperCase()))}
          >
            {(field, props) => <Input inputClass="uppercase" label={t("form.lobby_code")} {...props} errorMessage={field.error} />}
          </Field>
          <Button type="submit" class="mt-4" intent="gradient" loading={joinLobbyForm.submitting}>
            {t("join_lobby.join")}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
