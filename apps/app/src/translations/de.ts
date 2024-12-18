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
  },
  verify_email: {
    title: "E-Mail bestätigen",
    description: "Bitte geben Sie den Bestätigungscode ein, der an Ihre E-Mail gesendet wurde",
    verify: "Bestätigen",
    resend: "Erneut senden",
    email_verified: "E-Mail bestätigt",
    not_received: "Keine E-Mail erhalten oder Code abgelaufen?",
    invalid_code: "Code ist ungültig oder abgelaufen",
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