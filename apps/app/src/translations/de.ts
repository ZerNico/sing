const de = {
  login: {
    title: "Anmelden",
    sign_in: "Anmelden",
    or: "oder",
    no_account: "Noch kein Konto?",
    sign_up: "Registrieren",
    invalid_username_or_password: "Ungültiger Benutzername oder Passwort",
  },
  register: {
    title: "Registrieren",
    sign_up: "Registrieren",
    or: "oder",
    already_have_an_account: "Bereits ein Konto?",
    sign_in: "Anmelden",
    user_or_email_already_exists: "Benutzer oder E-Mail existiert bereits",
    user_already_exists: "Benutzer existiert bereits",
  },
  verify_email: {
    title: "E-Mail bestätigen",
    description: "Bitte gib den Bestätigungscode ein, der an deine E-Mail gesendet wurde",
    verify: "Bestätigen",
    resend: "Erneut senden",
    email_sent: "E-Mail gesendet",
    email_verified: "E-Mail bestätigt",
    wait_before_resend: "Bitte warten {{ seconds }} Sekunden, bevor du es erneut versuchst",
    not_received: "Keine E-Mail erhalten oder Code abgelaufen?",
    invalid_code: "Code ist ungültig oder abgelaufen",
  },
  complete_profile: {
    title: "Profil vervollständigen",
    description: "Bitte vervollständige dein Profil",
    username: "Benutzername",
    save: "Speichern",
  },
  join_lobby: {
    title: "Lobby beitreten",
    description: "Bitte gib den Lobby-Code ein",
    join: "Beitreten",
    lobby_not_found: "Lobby nicht gefunden",
  },
  form: {
    username: "Benutzername",
    password: "Passwort",
    email: "E-Mail",
    code: "Code",
    username_min_length: "Benutzername muss mindestens {{ length }} Zeichen lang sein",
    username_max_length: "Benutzername darf maximal {{ length }} Zeichen lang sein",
    email_invalid: "E-Mail ist ungültig",
    email_max_length: "E-Mail darf maximal {{ length }} Zeichen lang sein",
    password_required: "Passwort wird benötigt",
    password_min_length: "Passwort muss mindestens {{ length }} Zeichen lang sein",
    password_max_length: "Passwort darf maximal {{ length }} Zeichen lang sein",
    code_length: "Code muss {{ length }} Zeichen lang sein",
  },
  toast: {
    success: "Erfolg",
    error: "Fehler",
    info: "Info",
    warning: "Warnung",
  },
  error: {
    unknown: "Ein unbekannter Fehler ist aufgetreten",
  }
};

export type Dict = typeof de;
export const dict = de;