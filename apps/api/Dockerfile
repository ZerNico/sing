FROM node:18-alpine AS builder

RUN apk update && apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate 

WORKDIR /app

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"
RUN pnpm install -g turbo
COPY . .
RUN turbo prune --scope=api --docker

FROM node:18-alpine AS runner

RUN apk update && apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate 

WORKDIR /app

COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/full/ ./
RUN pnpm install --frozen-lockfile
RUN pnpm run build --filter="api..."

EXPOSE 4000

WORKDIR /app/apps/api

CMD ["pnpm", "start:prod"]