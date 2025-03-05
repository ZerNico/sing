FROM oven/bun:1 AS builder

WORKDIR /usr/src/app

COPY ./apps/api ./apps/api
COPY ./packages/email ./packages/email
COPY ./package.json ./bun.lock ./turbo.json ./

RUN bun install
RUN bun run build --filter @tuneperfect/api

FROM oven/bun:1 AS runner

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/apps/api/dist/index.js ./index.js
COPY --from=builder /usr/src/app/apps/api/drizzle ./drizzle

USER bun
EXPOSE 3000/tcp
CMD ["bun", "index.js"]