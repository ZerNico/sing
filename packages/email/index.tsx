export { VerifyEmail } from "./emails/verify-email";
import { type Options, render } from "@react-email/render";
import { VerifyEmail, type VerifyEmailProps } from "./emails/verify-email";

export function renderVerifyEmail(props: VerifyEmailProps, options?: Options) {
  return render(<VerifyEmail {...props} />, options);
}
