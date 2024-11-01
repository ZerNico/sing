import { A } from "@solidjs/router";
import { type VariantProps, cva } from "class-variance-authority";
import type { JSX } from "solid-js";

interface ButtonProps extends VariantProps<typeof button> {
  children: JSX.Element;
  class?: string;
}

interface LinkProps extends VariantProps<typeof button> {
  children: JSX.Element;
  class?: string;
  href: string;
}

const button = cva("inline-flex h-10 items-center justify-center rounded-lg px-6 font-semibold shadow-xl", {
  variants: {
    intent: {
      primary: "bg-primary-600 text-white",
      gradient: "bg-gradient-to-b from-teal-600 to-spearmint-500 text-white",
      outline: "border border-neutral/20 bg-black/5 text-white backdrop-blur-10 transition-colors hover:bg-black/10",
    },
  },
  defaultVariants: {
    intent: "primary",
  },
});

export default function Button(props: ButtonProps | LinkProps) {
  if ("href" in props) {
    return (
      <A
        href={props.href}
        class={button({ intent: props.intent })}
        classList={{
          [props.class || ""]: true,
        }}
      >
        {props.children}
      </A>
    );
  }

  return (
    <button
      type="button"
      class={button({ intent: props.intent })}
      classList={{
        [props.class || ""]: true,
      }}
    >
      {props.children}
    </button>
  );
}
