import { A } from "@solidjs/router";
import { type VariantProps, cva } from "class-variance-authority";
import { type JSX, Show } from "solid-js";
import LoaderCircle from "~icons/lucide/loader-circle";

interface ButtonProps extends BaseProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

interface LinkProps extends BaseProps {
  href: string;
}

interface BaseProps extends VariantProps<typeof button> {
  children: JSX.Element;
  class?: string;
  loading?: boolean;
}

const button = cva("inline-grid h-10 items-center gap-4 rounded-lg px-6 font-semibold shadow-md focus:outline-slate-800", {
  variants: {
    intent: {
      primary: "bg-slate-800 text-white",
      gradient: "bg-gradient-to-r from-blue-start to-blue-end text-white",
    },
  },
  defaultVariants: {
    intent: "primary",
  },
});

export default function Button(props: ButtonProps | LinkProps) {
  const classes = () => ({
    [button({ intent: props.intent })]: true,
    [props.class || ""]: true,
  });

  if ("href" in props) {
    return (
      <A href={props.href} classList={classes()}>
        <ButtonContent loading={props.loading}>{props.children}</ButtonContent>
      </A>
    );
  }

  return (
    <button type={props.type || "button"} onClick={props.onClick} classList={classes()}>
      <ButtonContent loading={props.loading}>{props.children}</ButtonContent>
    </button>
  );
}

function ButtonContent(props: { children: JSX.Element; loading?: boolean }) {
  return (
    <>
      <span
        class="col-start-1 row-start-1 flex items-center justify-center gap-2 transition-opacity"
        classList={{
          "opacity-0": props.loading,
        }}
      >
        {props.children}
      </span>
      <Show when={props.loading}>
        <div class="col-start-1 row-start-1 flex items-center justify-center">
          <LoaderCircle class="animate-spin" />
        </div>
      </Show>
    </>
  );
}
