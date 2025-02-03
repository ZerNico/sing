export { VerifyEmail } from "./emails/verify-email";
import { type Options, render } from "@react-email/render";
import { ResetPassword } from "./emails/reset-password";
import type { ResetPasswordProps } from "./emails/reset-password";
import { VerifyEmail, type VerifyEmailProps } from "./emails/verify-email";

export function renderVerifyEmail(props: VerifyEmailProps, options?: Options) {
  return render(<VerifyEmail {...props} />, options);
}

export function renderResetPassword(props: ResetPasswordProps, options?: Options) {
  return render(<ResetPassword {...props} />, options);
}
