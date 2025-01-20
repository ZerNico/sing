import { type BaseContext, RouteBuilder } from "@nokijs/server";

export interface CorsOptions {
  origin: string | string[];
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

function isOriginAllowed(allowedOrigins: string | string[], requestOrigin: string): boolean {
  if (allowedOrigins === "*") return true;
  if (Array.isArray(allowedOrigins)) {
    return allowedOrigins.includes(requestOrigin);
  }
  return allowedOrigins === requestOrigin;
}

export function cors(options: CorsOptions): RouteBuilder {
  const opts = { ...defaultOptions, ...options };

  return new RouteBuilder().before((context) => {
    const requestOrigin = context.headers.origin ?? "";

    if (isOriginAllowed(opts.origin, requestOrigin)) {
      console.log("Origin allowed", requestOrigin);
      
      context.res.headers.set("access-control-allow-origin", requestOrigin);
    }

    if (options.credentials) {
      context.res.headers.set("access-control-allow-credentials", "true");
    }

    if (options.maxAge) {
      context.res.headers.set("access-control-max-age", String(options.maxAge));
    }

    if (opts.allowMethods) {
      context.res.headers.set("access-control-allow-methods", opts.allowMethods.join(", "));
    }

    if (opts.allowHeaders) {
      context.res.headers.set("access-control-allow-headers", opts.allowHeaders.join(", "));
    }

    if (opts.exposeHeaders) {
      context.res.headers.set("access-control-expose-headers", opts.exposeHeaders.join(", "));
    }
  });
}
