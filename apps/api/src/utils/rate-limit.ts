import { type BaseContext, RouteBuilder } from "@nokijs/server";

interface RateLimitOptions {
  max?: number;
  window?: number;
  generateKey: (context: BaseContext) => string;
}

interface RateLimitInfo {
  count: number;
  resetAt: number;
}

const defaultOptions = {
  max: 100,
  window: 60, // 1 minute
};

export function rateLimit(options: RateLimitOptions): RouteBuilder {
  const opts = { ...defaultOptions, ...options };

  const rateLimitStore = new Map<string, RateLimitInfo>();

  setInterval(() => {
    const now = Date.now();
    for (const [key, info] of rateLimitStore.entries()) {
      if (info.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000);

  return new RouteBuilder().before((context) => {
    const key = opts.generateKey(context);
    const now = Date.now();
    let limitInfo = rateLimitStore.get(key);
    if (!limitInfo || limitInfo.resetAt <= now) {
      limitInfo = {
        count: 0,
        resetAt: now + opts.window * 1000,
      };
      rateLimitStore.set(key, limitInfo);
    }

    limitInfo.count++;

    context.res.headers.set("RateLimit-Limit", opts.max.toString());
    context.res.headers.set("RateLimit-Remaining", Math.max(0, opts.max - limitInfo.count).toString());
    context.res.headers.set("RateLimit-Reset", Math.ceil(limitInfo.resetAt / 1000).toString());

    if (limitInfo.count > opts.max) {
      context.res.headers.set("Retry-After", Math.ceil((limitInfo.resetAt - now) / 1000).toString());

      return context.res.json(
        {
          error: "Too Many Requests",
          message: "Rate limit exceeded",
          retryAfter: Math.ceil((limitInfo.resetAt - now) / 1000),
        },
        { status: 429 },
      );
    }
  });
}
