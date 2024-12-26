import { RouteBuilder } from "@nokijs/server";

export interface CsrfOptions {
  allowedOrigins: string[];
}

const defaultOptions: CsrfOptions = {
  allowedOrigins: [],
};

export function csrf(options: CsrfOptions): RouteBuilder {
  const opts = { ...defaultOptions, ...options };

  return new RouteBuilder().before((context) => {
    const headers = context.headers;

    if (context.method === "GET") {
      return;
    }

    const origin = headers.origin;
    const referer = headers.referer;

    if (origin) {
      if (!opts.allowedOrigins.includes(origin)) {
        return context.res.json(
          {
            code: "INVALID_ORIGIN",
            message: "Invalid origin",
          },
          { status: 403 },
        );
      }
      return;
    }

    if (referer) {
      const refererUrl = new URL(referer);
      if (!opts.allowedOrigins.includes(refererUrl.origin)) {
        return context.res.json(
          {
            code: "INVALID_REFERER",
            message: "Invalid referer",
          },
          { status: 403 },
        );
      }
      return;
    }

    return context.res.json(
      {
        code: "MISSING_ORIGIN_OR_REFERER",
        message: "Missing origin or referer header",
      },
      { status: 403 },
    );
  });
}
