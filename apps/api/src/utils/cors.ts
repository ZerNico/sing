import { type BaseContext, RouteBuilder } from "@nokijs/server";

export interface CorsOptions {
  origin?: string | string[] | ((origin: string, context: BaseContext) => string | undefined | null);
  allowMethods?: string[];
  allowHeaders?: string[];
  maxAge?: number;
  credentials?: boolean;
  exposeHeaders?: string[];
}

const defaultOptions = {
  origin: "*",
  allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
  allowHeaders: [],
  exposeHeaders: [],
};

export function cors(options: CorsOptions): RouteBuilder {
  const opts = { ...defaultOptions, ...options };

  return new RouteBuilder().before((context) => {
    const headers = context.res.headers;

    const origin = typeof opts.origin === "function" ? opts.origin(headers.get("origin") || "", context) : opts.origin;

    if (origin) {
      headers.set("access-control-allow-origin", typeof origin === "string" ? origin : origin.join(", "));
    }

    if (options.credentials) {
      headers.set("access-control-allow-credentials", "true");
    }

    if (options.maxAge) {
      headers.set("access-control-max-age", String(options.maxAge));
    }

    if (opts.allowMethods) {
      headers.set("access-control-allow-methods", opts.allowMethods.join(", "));
    }

    if (opts.allowHeaders) {
      headers.set("access-control-allow-headers", opts.allowHeaders.join(", "));
    }

    if (opts.exposeHeaders) {
      headers.set("access-control-expose-headers", opts.exposeHeaders.join(", "));
    }
  });
}
