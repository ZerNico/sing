import { Body, Container, Head, Heading, Html, Preview, Tailwind, type TailwindConfig, Text } from "@react-email/components";

const tailwindConfig: TailwindConfig = {
  theme: {
    extend: {},
  },
};

export interface VerifyEmailProps {
  code: string;
  url: string;
  supportUrl: string;
}

export function VerifyEmail(props: VerifyEmailProps) {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>Verify your E-Mail</Preview>
      <Tailwind config={tailwindConfig}>
        <Body className="mx-auto my-auto bg-[#203141] px-2 py-10 font-sans text-slate-800">
          <Container className="mx-auto max-w-[465px] py-5 text-center">
            <Heading className="m-0 font-semibold text-[30px] text-white">Tune Perfect</Heading>
          </Container>
          <Container className="mx-auto w-full max-w-[465px] rounded-lg bg-white p-[32px]">
            <Heading className="m-0 font-semibold text-[20px]">Verify your E-Mail</Heading>
            <Text className="m-0 text-slate-500">Enter the following code to verify your email address.</Text>
            <Text className="m-0 py-12 text-center ">
              <span className="inline-block rounded border border-white/10 border-solid font-bold text-[40px] tracking-[6px]">
                {props.code}
              </span>
            </Text>

            <Text className="m-0 pb-8 text-center">
              <a
                href={props.url}
                target="_blank"
                className="box-border inline-block w-full rounded-lg px-4 py-2 font-semibold text-[14px] text-white no-underline shadow-md"
                rel="noreferrer"
                style={{
                  background: "linear-gradient(to right, #36d1dc, #5b86e5)",
                }}
              >
                Visit Tune Perfect
              </a>
            </Text>
            <Text className="m-0">If you didn't request this, you can just ignore this email.</Text>
          </Container>
          <Container className="mx-auto max-w-[465px] py-5 text-center text-white">
            <Text className="m-0">
              Need help?{" "}
              <a href={props.supportUrl} target="_blank" className="text-white no-underline" rel="noreferrer">
                Contact Support
              </a>
            </Text>
            <Text className="m-0">© {currentYear} Tune Perfect.</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

VerifyEmail.PreviewProps = {
  code: "D4F8H3J2",
  url: "https://tuneperfect.localhost",
  supportUrl: "mailto:support@tuneperfect.localhost",
} satisfies VerifyEmailProps;

export default VerifyEmail;
