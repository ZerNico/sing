import { Body, Container, Head, Heading, Html, Preview, Tailwind, type TailwindConfig, Text } from "@react-email/components";

const tailwindConfig: TailwindConfig = {
  theme: {
    extend: {
      colors: {
        night: {
          "50": "#f0f4fd",
          "100": "#e3ebfc",
          "200": "#ccd8f9",
          "300": "#adbdf4",
          "400": "#8c9bed",
          "500": "#7079e4",
          "600": "#5556d6",
          "700": "#4645bd",
          "800": "#3b3c98",
          "900": "#363879",
          "950": "#101024",
        },
        spearmint: {
          "50": "#effef3",
          "100": "#d8ffe6",
          "200": "#b4fecf",
          "300": "#7afbab",
          "400": "#38ef7d",
          "500": "#0fd85b",
          "600": "#06b348",
          "700": "#098c3c",
          "800": "#0d6e33",
          "900": "#0d5a2d",
          "950": "#003316",
        },
      },
    },
  },
};

export interface VerifyEmailProps {
  code: number;
  url: string;
  supportUrl: string;
};

export function VerifyEmail(props: VerifyEmailProps) {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>Verify your E-Mail</Preview>
      <Tailwind config={tailwindConfig}>
        <Body className="mx-auto my-auto bg-night-950 px-2 py-10 font-sans text-slate-50">
          <Container className="mx-auto max-w-[465px] py-5 text-center">
            <Heading className="m-0 font-semibold text-[40px]">Tune Perfect</Heading>
          </Container>
          <Container className="mx-auto max-w-[465px] rounded border border-white/10 border-solid p-[20px]">
            <Heading className="m-0 font-semibold text-[20px]">Verify your E-Mail</Heading>
            <Text className="m-0 text-slate-300">Enter the following code to verify your email address.</Text>
            <Text className="m-0 p-8 text-center ">
              <span className="inline-block rounded border border-white/10 border-solid p-4 font-bold text-[40px] tracking-[6px]">{props.code}</span>
            </Text>

            <Text className="m-0 pb-8 text-center">
              <a href={props.url} target="_blank" className="inline-block rounded bg-slate-50 px-4 py-2 font-semibold text-[14px] text-black no-underline" rel="noreferrer">
                Visit Tune Perfect
              </a>
            </Text>
            <Text className="m-0 text-slate-300">If you didn't request this, you can safely ignore this email.</Text>
          </Container>
          <Container className="mx-auto max-w-[465px] py-5 text-center">
            <Text className="m-0 text-slate-300">
              Need help?{" "}
              <a href={props.supportUrl} target="_blank" className="text-spearmint-500 no-underline" rel="noreferrer">
                Contact Support
              </a>
            </Text>
            <Text className="m-0 text-slate-300">© {currentYear} Tune Perfect.</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

VerifyEmail.PreviewProps = {
  code: 123456,
  url: "https://tuneperfect.localhost",
  supportUrl: "mailto:support@tuneperfect.localhost",
} satisfies VerifyEmailProps;

export default VerifyEmail;
