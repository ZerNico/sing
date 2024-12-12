import { renderVerifyEmail } from "@sing/email";
import nodemailer, { type Transporter } from "nodemailer";
import { config } from "../config";

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(config.EMAIL_SMTP_URI);
  }

  public async sendVerifyEmail(email: string, code: number) {
    const props = {
      code: code,
      url: `https://${config.BASE_DOMAIN}`,
      supportUrl: `mailto:${config.SUPPORT_EMAIL}`,
    };

    const emailHtml = await renderVerifyEmail(props);

    const emailText = await renderVerifyEmail(props, { plainText: true });

    await this.transporter.sendMail({
      from: config.EMAIL_FROM_MAIL,
      to: email,
      subject: "Verify your E-Mail",
      html: emailHtml,
      text: emailText,
    });
  }
}

export const emailService = new EmailService();
