const en = {
  login: {
    title: "Sign In",
    sign_in: "Sign in",
    or: "or",
    no_account: "Don't have an account?",
    sign_up: "Sign up",
    invalid_username_or_password: "Invalid username or password",
  },
  register: {
    title: "Sign Up",
    sign_up: "Sign up",
    or: "or",
    already_have_an_account: "Already have an account?",
    sign_in: "Sign in",
    user_or_email_already_exists: "User or email already exists",
  },
  verify_email: {
    title: "Verify Email",
    description: "Please enter the verification code sent to your email",
    verify: "Verify",
    resend: "Resend",
    email_sent: "Email sent",
    email_verified: "Email verified",
    wait_before_resend: "Please wait {{ seconds }} seconds before trying again",
    not_received: "Did not receive the email or the code expired?",
    invalid_code: "Code is invalid or expired",
  },
  complete_profile: {
    title: "Complete Profile",
    description: "Please complete your profile",
    username: "Username",
    save: "Save",
  },
  form: {
    username: "Username",
    password: "Password",
    email: "Email",
    code: "Code",
    username_min_length: "Username must be at least {{ length }} characters long",
    username_max_length: "Username must be at most {{ length }} characters long",
    email_invalid: "Email is invalid",
    email_max_length: "Email must be at most {{ length }} characters long",
    password_required: "Password is required",
    password_max_length: "Password must be at most {{ length }} characters long",
    code_length: "Code must be {{ length }} characters long",
  },
  toast: {
    success: "Success",
    error: "Error",
    info: "Info",
    warning: "Warning",
  },
  error: {
    unknown: "An unknown error occurred",
  }
};

export type Dict = typeof en;
export const dict = en;
