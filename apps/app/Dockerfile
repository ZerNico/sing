FROM oven/bun:1 AS builder

WORKDIR /usr/src/app

COPY ./apps/api ./apps/api
COPY ./apps/app ./apps/app
COPY ./packages/email ./packages/email
COPY ./package.json ./bun.lock ./turbo.json ./

RUN bun install
RUN bun run build --filter @tuneperfect/app


FROM nginx:alpine AS runner

RUN touch /etc/alpine-release
RUN apk add --no-cache curl bash libstdc++ libgcc
RUN curl -fsSL https://bun.sh/install | bash

ENV BUN_INSTALL="/root/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"

WORKDIR /app
RUN bun install @import-meta-env/cli
COPY ./apps/app/.env.example ./
COPY ./apps/app/docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

WORKDIR /usr/share/nginx/html
COPY --from=builder /usr/src/app/apps/app/dist ./
COPY ./apps/app/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["/app/entrypoint.sh"]