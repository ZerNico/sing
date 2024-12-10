# Tune Perfect

## Prerequisites
- [caddy](https://caddyserver.com/docs/install)
- [docker](https://docs.docker.com/get-docker/)
- [bun](https://bun.sh/docs/installation)

## Development

```bash
bun install
docker compose -f docker-compose.dev.yml up -d
caddy start
bun run dev
```